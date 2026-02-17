package com.reservas.sk.bookings_service.application.service;

import com.reservas.sk.bookings_service.application.port.in.BookingUseCase;
import com.reservas.sk.bookings_service.application.port.out.BookingPersistencePort;
import com.reservas.sk.bookings_service.application.port.out.ReservationEventPublisherPort;
import com.reservas.sk.bookings_service.application.usecase.CheckSpaceAvailabilityQuery;
import com.reservas.sk.bookings_service.application.usecase.CreateReservationCommand;
import com.reservas.sk.bookings_service.application.usecase.ListReservationsQuery;
import com.reservas.sk.bookings_service.application.usecase.ReservationCancelledEvent;
import com.reservas.sk.bookings_service.application.usecase.ReservationCreatedEvent;
import com.reservas.sk.bookings_service.domain.model.Reservation;
import com.reservas.sk.bookings_service.domain.model.ReservationEquipment;
import com.reservas.sk.bookings_service.domain.model.SpaceAvailability;
import com.reservas.sk.bookings_service.domain.service.DateTimeService;
import com.reservas.sk.bookings_service.exception.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class BookingApplicationService implements BookingUseCase {
    private static final List<String> RESERVATION_ACTIVE_STATUSES = List.of("pending", "confirmed", "in_progress");

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

        int overlaps = persistencePort.countOverlappingReservations(spaceId, startAt, endAt);
        if (overlaps > 0) {
            throw new ApiException(HttpStatus.CONFLICT, "El espacio ya esta reservado para ese rango de tiempo");
        }

        List<Long> equipmentIds = normalizeEquipmentIds(command.equipmentIds());
        if (!equipmentIds.isEmpty()) {
            List<Long> existing = persistencePort.findExistingEquipmentIds(equipmentIds);
            if (existing.size() != equipmentIds.size()) {
                HashSet<Long> existingSet = new HashSet<>(existing);
                List<Long> missing = equipmentIds.stream()
                        .filter(id -> !existingSet.contains(id))
                        .toList();
                throw new ApiException(HttpStatus.BAD_REQUEST, "Equipos no encontrados: " + missing);
            }

            List<Long> unavailable = persistencePort.findUnavailableEquipmentIds(equipmentIds);
            if (!unavailable.isEmpty()) {
                throw new ApiException(HttpStatus.CONFLICT, "Equipos no disponibles: " + unavailable);
            }

            List<Long> outsideCity = persistencePort.findEquipmentIdsOutsideCity(equipmentIds, cityId);
            if (!outsideCity.isEmpty()) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Equipos no pertenecen a la ciudad del espacio: " + outsideCity);
            }
        }

        long reservationId = persistencePort.insertReservation(
                userId,
                spaceId,
                startAt,
                endAt,
                "confirmed",
                normalizeNullable(command.title()),
                command.attendeesCount(),
                normalizeNullable(command.notes())
        );

        for (Long equipmentId : equipmentIds) {
            persistencePort.insertReservationEquipment(reservationId, equipmentId, "requested");
        }

        Reservation created = getReservationById(reservationId);
        eventPublisherPort.publishReservationCreated(new ReservationCreatedEvent(
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

        if ("cancelled".equalsIgnoreCase(existing.getStatus())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "La reserva ya esta cancelada");
        }

        persistencePort.updateReservationCancellation(existing.getId(), "cancelled", normalizeNullable(reason));
        Reservation cancelled = getReservationById(existing.getId());
        eventPublisherPort.publishReservationCancelled(new ReservationCancelledEvent(
                cancelled.getId(),
                cancelled.getUserId(),
                cancelled.getSpaceId(),
                cancelled.getStatus(),
                cancelled.getCancellationReason(),
                Instant.now()
        ));
        return cancelled;
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

        LinkedHashSet<Long> uniqueIds = new LinkedHashSet<>();
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
                !"completed".equals(normalized) &&
                !"cancelled".equals(normalized)) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "status invalido. Use: pending, confirmed, in_progress, completed, cancelled");
        }
        return normalized;
    }
}







