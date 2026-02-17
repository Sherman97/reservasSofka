package com.reservas.sk.bookings_service.application.port.out;

import com.reservas.sk.bookings_service.domain.model.Reservation;
import com.reservas.sk.bookings_service.domain.model.ReservationEquipment;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface BookingPersistencePort {
    boolean userExists(long userId);

    Optional<Long> findSpaceCityId(long spaceId);

    int countOverlappingReservations(long spaceId, Instant startAt, Instant endAt);

    List<Long> findExistingEquipmentIds(List<Long> equipmentIds);

    List<Long> findUnavailableEquipmentIds(List<Long> equipmentIds);

    List<Long> findEquipmentIdsOutsideCity(List<Long> equipmentIds, long cityId);

    long insertReservation(long userId,
                           long spaceId,
                           Instant startAt,
                           Instant endAt,
                           String status,
                           String title,
                           Integer attendeesCount,
                           String notes);

    void insertReservationEquipment(long reservationId, long equipmentId, String status);

    List<Reservation> listReservations(Long userId, Long spaceId, String status);

    Optional<Reservation> findReservationById(long reservationId);

    Map<Long, List<ReservationEquipment>> findReservationEquipmentsByReservationIds(List<Long> reservationIds);

    List<ReservationEquipment> findReservationEquipments(long reservationId);

    void updateReservationCancellation(long reservationId, String status, String cancellationReason);
}







