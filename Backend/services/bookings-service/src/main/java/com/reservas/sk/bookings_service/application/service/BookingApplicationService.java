package com.reservas.sk.bookings_service.application.service;

import com.reservas.sk.bookings_service.application.port.in.BookingUseCase;
import com.reservas.sk.bookings_service.application.port.out.BookingPersistencePort;
import com.reservas.sk.bookings_service.application.port.out.ReservationEventPublisherPort;
import com.reservas.sk.bookings_service.application.usecase.CheckSpaceAvailabilityQuery;
import com.reservas.sk.bookings_service.application.usecase.CreateReservationCommand;
import com.reservas.sk.bookings_service.application.usecase.HandoverReservationCommand;
import com.reservas.sk.bookings_service.application.usecase.ListReservationsQuery;
import com.reservas.sk.bookings_service.application.usecase.ReservationCancelledEvent;
import com.reservas.sk.bookings_service.application.usecase.ReservationCreatedEvent;
import com.reservas.sk.bookings_service.application.usecase.ReservationDeliveredEvent;
import com.reservas.sk.bookings_service.application.usecase.ReservationReturnedEvent;
import com.reservas.sk.bookings_service.domain.model.Reservation;
import com.reservas.sk.bookings_service.domain.model.ReservationEquipment;
import com.reservas.sk.bookings_service.domain.model.SpaceAvailability;
import com.reservas.sk.bookings_service.domain.service.DateTimeService;
import com.reservas.sk.bookings_service.exception.ApiException;
import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Service
@SuppressFBWarnings(
        value = "EI_EXPOSE_REP2",
        justification = "Ports are injected dependencies managed by Spring."
)
public class BookingApplicationService implements BookingUseCase {
    private static final String STATUS_PENDING = "pending";
    private static final String STATUS_CONFIRMED = "confirmed";
    private static final String STATUS_IN_PROGRESS = "in_progress";
    private static final String STATUS_COMPLETED = "completed";
    private static final String STATUS_CANCELLED = "cancelled";
    private static final List<String> RESERVATION_ACTIVE_STATUSES =
            List.of(STATUS_PENDING, STATUS_CONFIRMED, STATUS_IN_PROGRESS);
    private static final Logger log = LoggerFactory.getLogger(BookingApplicationService.class);

    private final BookingPersistencePort persistencePort;
    private final ReservationEventPublisherPort eventPublisherPort;

    public BookingApplicationService(BookingPersistencePort persistencePort,
                                     ReservationEventPublisherPort eventPublisherPort) {
        this.persistencePort = persistencePort;
        this.eventPublisherPort = eventPublisherPort;
    }

    @Override
    public SpaceAvailability checkAvailability(CheckSpaceAvailabilityQuery query) {
        long spaceId = requirePositive(query.spaceId(), "spaceId es obligatorio");
        Instant startAt = DateTimeService.parse(query.startAt(), "startAt");
        Instant endAt = DateTimeService.parse(query.endAt(), "endAt");
        validateRange(startAt, endAt);

        int overlaps = persistencePort.countOverlappingReservations(spaceId, startAt, endAt);
        return new SpaceAvailability(overlaps == 0, overlaps);
    }

    @Override
    @Transactional
    public Reservation createReservation(CreateReservationCommand command) {
        long userId = requirePositive(command.userId(), "userId es obligatorio");
        long spaceId = requirePositive(command.spaceId(), "spaceId es obligatorio");

        if (!persistencePort.userExists(userId)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Usuario no encontrado");
        }

        Long cityId = persistencePort.findSpaceCityId(spaceId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Espacio no encontrado"));

        Instant startAt = DateTimeService.parse(command.startAt(), "startAt");
        Instant endAt = DateTimeService.parse(command.endAt(), "endAt");
        validateRange(startAt, endAt);

        // Human Check 🛡️: lock por espacio para evitar doble reserva simultanea.
        boolean lockAcquired = persistencePort.acquireSpaceReservationLock(spaceId, 5);
        if (!lockAcquired) {
            throw new ApiException(HttpStatus.CONFLICT,
                    "No fue posible reservar en este momento. Intente de nuevo.",
                    "SPACE_LOCK_TIMEOUT");
        }

        try {
            int overlaps = persistencePort.countOverlappingReservations(spaceId, startAt, endAt);
            if (overlaps > 0) {
                throw new ApiException(HttpStatus.CONFLICT,
                        "El espacio ya esta reservado para ese rango de tiempo",
                        "SPACE_ALREADY_RESERVED");
            }

            List<Long> equipmentIds = normalizeEquipmentIds(command.equipmentIds());
            if (!equipmentIds.isEmpty()) {
                List<Long> existing = persistencePort.findExistingEquipmentIds(equipmentIds);
                if (existing.size() != equipmentIds.size()) {
                    Set<Long> existingSet = new HashSet<>(existing);
                    List<Long> missing = equipmentIds.stream()
                            .filter(id -> !existingSet.contains(id))
                            .toList();
                    throw new ApiException(HttpStatus.BAD_REQUEST, "Equipos no encontrados: " + missing, "EQUIPMENT_NOT_FOUND");
                }

                List<Long> unavailable = persistencePort.findUnavailableEquipmentIds(equipmentIds);
                if (!unavailable.isEmpty()) {
                    throw new ApiException(HttpStatus.CONFLICT, "Equipos no disponibles: " + unavailable, "EQUIPMENT_UNAVAILABLE");
                }

                List<Long> outsideCity = persistencePort.findEquipmentIdsOutsideCity(equipmentIds, cityId);
                if (!outsideCity.isEmpty()) {
                    throw new ApiException(HttpStatus.BAD_REQUEST,
                            "Equipos no pertenecen a la ciudad del espacio: " + outsideCity,
                            "EQUIPMENT_OUTSIDE_CITY");
                }
            }

            long reservationId = persistencePort.insertReservation(
                    userId,
                    spaceId,
                    startAt,
                    endAt,
                    STATUS_CONFIRMED,
                    normalizeNullable(command.title()),
                    command.attendeesCount(),
                    normalizeNullable(command.notes())
            );

            for (Long equipmentId : equipmentIds) {
                persistencePort.insertReservationEquipment(reservationId, equipmentId, "requested");
            }

            Reservation created = getReservationById(reservationId);
            safePublishReservationCreated(new ReservationCreatedEvent(
                    created.getId(),
                    created.getUserId(),
                    created.getSpaceId(),
                    created.getStatus(),
                    created.getStartDatetime().toString(),
                    created.getEndDatetime().toString(),
                    created.getEquipments().stream().map(ReservationEquipment::getEquipmentId).toList(),
                    Instant.now()
            ));
            return created;
        } finally {
            try {
                persistencePort.releaseSpaceReservationLock(spaceId);
            } catch (Exception ex) {
                if (log.isWarnEnabled()) {
                    log.warn("No se pudo liberar lock de espacio. spaceId={}", spaceId, ex);
                }
            }
        }
    }

    @Override
    public List<Reservation> listReservations(ListReservationsQuery query) {
        String status = normalizeStatus(query.status());
        List<Reservation> reservations = persistencePort.listReservations(query.userId(), query.spaceId(), status);
        if (reservations.isEmpty()) {
            return reservations;
        }

        List<Long> ids = reservations.stream().map(Reservation::getId).toList();
        Map<Long, List<ReservationEquipment>> equipmentMap = persistencePort.findReservationEquipmentsByReservationIds(ids);

        List<Reservation> result = new ArrayList<>();
        for (Reservation reservation : reservations) {
            result.add(withEquipments(reservation, equipmentMap.getOrDefault(reservation.getId(), List.of())));
        }
        return result;
    }

    @Override
    public Reservation getReservationById(Long reservationId) {
        long id = requirePositive(reservationId, "id es invalido");
        Reservation reservation = persistencePort.findReservationById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Reserva no encontrada"));

        List<ReservationEquipment> equipments = persistencePort.findReservationEquipments(id);
        return withEquipments(reservation, equipments);
    }

    @Override
    @Transactional
    public Reservation cancelReservation(Long reservationId, String reason) {
        Reservation existing = getReservationById(reservationId);

        if (STATUS_CANCELLED.equalsIgnoreCase(existing.getStatus())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "La reserva ya esta cancelada");
        }

        persistencePort.updateReservationCancellation(existing.getId(), STATUS_CANCELLED, normalizeNullable(reason));
        Reservation cancelled = getReservationById(existing.getId());
        safePublishReservationCancelled(new ReservationCancelledEvent(
                cancelled.getId(),
                cancelled.getUserId(),
                cancelled.getSpaceId(),
                cancelled.getStatus(),
                cancelled.getCancellationReason(),
                Instant.now()
        ));
        return cancelled;
    }

    @Override
    @Transactional
    public Reservation deliverReservation(HandoverReservationCommand command) {
        long reservationId = requirePositive(command.reservationId(), "id es invalido");
        long staffId = requirePositive(command.staffId(), "staffId es invalido");
        String novelty = normalizeNullable(command.novelty());

        Reservation existing = getReservationById(reservationId);
        assertHandoverAllowed(existing, List.of("confirmed", "in_progress"), "La reserva no puede marcarse como entregada");

        Instant now = Instant.now();
        persistencePort.updateReservationStatus(existing.getId(), STATUS_IN_PROGRESS);
        persistencePort.markReservationEquipmentsDelivered(existing.getId(), staffId, now, novelty);
        persistencePort.insertReservationHandoverLog(
                existing.getId(),
                existing.getSpaceId(),
                existing.getUserId(),
                staffId,
                "DELIVERED",
                novelty,
                now
        );

        Reservation delivered = getReservationById(existing.getId());
        safePublishReservationDelivered(new ReservationDeliveredEvent(
                delivered.getId(),
                delivered.getUserId(),
                delivered.getSpaceId(),
                staffId,
                delivered.getStatus(),
                novelty,
                delivered.getEndDatetime().toString(),
                now
        ));
        return delivered;
    }

    @Override
    @Transactional
    public Reservation returnReservation(HandoverReservationCommand command) {
        long reservationId = requirePositive(command.reservationId(), "id es invalido");
        long staffId = requirePositive(command.staffId(), "staffId es invalido");
        String novelty = normalizeNullable(command.novelty());

        Reservation existing = getReservationById(reservationId);
        assertHandoverAllowed(existing, List.of("in_progress", "confirmed"), "La reserva no puede marcarse como devuelta");

        Instant now = Instant.now();
        persistencePort.updateReservationStatus(existing.getId(), STATUS_COMPLETED);
        persistencePort.markReservationEquipmentsReturned(existing.getId(), staffId, now, novelty);
        persistencePort.insertReservationHandoverLog(
                existing.getId(),
                existing.getSpaceId(),
                existing.getUserId(),
                staffId,
                "RETURNED",
                novelty,
                now
        );

        Reservation returned = getReservationById(existing.getId());
        safePublishReservationReturned(new ReservationReturnedEvent(
                returned.getId(),
                returned.getUserId(),
                returned.getSpaceId(),
                staffId,
                returned.getStatus(),
                novelty,
                returned.getEndDatetime().toString(),
                now
        ));
        return returned;
    }

    private void safePublishReservationCreated(ReservationCreatedEvent event) {
        try {
            eventPublisherPort.publishReservationCreated(event);
        } catch (Exception ex) {
            if (log.isWarnEnabled()) {
                log.warn("No se pudo publicar evento de reserva creada. reservationId={}", event.reservationId(), ex);
            }
        }
    }

    private void safePublishReservationCancelled(ReservationCancelledEvent event) {
        try {
            eventPublisherPort.publishReservationCancelled(event);
        } catch (Exception ex) {
            if (log.isWarnEnabled()) {
                log.warn("No se pudo publicar evento de reserva cancelada. reservationId={}", event.reservationId(), ex);
            }
        }
    }

    private void safePublishReservationDelivered(ReservationDeliveredEvent event) {
        try {
            eventPublisherPort.publishReservationDelivered(event);
        } catch (Exception ex) {
            if (log.isWarnEnabled()) {
                log.warn("No se pudo publicar evento de reserva entregada. reservationId={}", event.reservationId(), ex);
            }
        }
    }

    private void safePublishReservationReturned(ReservationReturnedEvent event) {
        try {
            eventPublisherPort.publishReservationReturned(event);
        } catch (Exception ex) {
            if (log.isWarnEnabled()) {
                log.warn("No se pudo publicar evento de reserva devuelta. reservationId={}", event.reservationId(), ex);
            }
        }
    }

    private Reservation withEquipments(Reservation reservation, List<ReservationEquipment> equipments) {
        return new Reservation(
                reservation.getId(),
                reservation.getUserId(),
                reservation.getSpaceId(),
                reservation.getStartDatetime(),
                reservation.getEndDatetime(),
                reservation.getStatus(),
                reservation.getTitle(),
                reservation.getAttendeesCount(),
                reservation.getNotes(),
                reservation.getCancellationReason(),
                reservation.getCreatedAt(),
                equipments
        );
    }

    private long requirePositive(Long value, String message) {
        if (value == null || value <= 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, message);
        }
        return value;
    }

    private void validateRange(Instant startAt, Instant endAt) {
        if (!startAt.isBefore(endAt)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "startAt debe ser menor que endAt");
        }
    }

    private List<Long> normalizeEquipmentIds(List<Long> equipmentIds) {
        if (equipmentIds == null || equipmentIds.isEmpty()) {
            return List.of();
        }

        Set<Long> uniqueIds = new LinkedHashSet<>();
        for (Long equipmentId : equipmentIds) {
            if (equipmentId == null || equipmentId <= 0) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "equipmentIds contiene valores invalidos");
            }
            uniqueIds.add(equipmentId);
        }

        return new ArrayList<>(uniqueIds);
    }

    private String normalizeNullable(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim();
        return normalized.isEmpty() ? null : normalized;
    }

    private String normalizeStatus(String status) {
        if (status == null || status.isBlank()) {
            return null;
        }
        String normalized = status.trim().toLowerCase(Locale.ROOT);
        if (!RESERVATION_ACTIVE_STATUSES.contains(normalized) &&
                !STATUS_COMPLETED.equals(normalized) &&
                !STATUS_CANCELLED.equals(normalized)) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "status invalido. Use: pending, confirmed, in_progress, completed, cancelled");
        }
        return normalized;
    }

    private void assertHandoverAllowed(Reservation reservation, List<String> validStatuses, String message) {
        String normalizedStatus = reservation.getStatus() == null
                ? ""
                : reservation.getStatus().trim().toLowerCase(Locale.ROOT);
        if (!validStatuses.contains(normalizedStatus)) {
            throw new ApiException(HttpStatus.CONFLICT, message, "INVALID_RESERVATION_STATUS");
        }
    }
}








