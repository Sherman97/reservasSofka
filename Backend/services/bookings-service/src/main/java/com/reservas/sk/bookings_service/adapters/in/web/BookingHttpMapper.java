package com.reservas.sk.bookings_service.adapters.in.web;

import com.reservas.sk.bookings_service.adapters.in.web.dto.ReservationEquipmentResponse;
import com.reservas.sk.bookings_service.adapters.in.web.dto.ReservationResponse;
import com.reservas.sk.bookings_service.adapters.in.web.dto.SpaceAvailabilityResponse;
import com.reservas.sk.bookings_service.domain.model.Reservation;
import com.reservas.sk.bookings_service.domain.model.ReservationEquipment;
import com.reservas.sk.bookings_service.domain.model.SpaceAvailability;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
public class BookingHttpMapper {
    public ReservationResponse toResponse(Reservation reservation) {
        return new ReservationResponse(
                reservation.getId(),
                reservation.getUserId(),
                reservation.getSpaceId(),
                toIso(reservation.getStartDatetime()),
                toIso(reservation.getEndDatetime()),
                reservation.getStatus(),
                reservation.getTitle(),
                reservation.getAttendeesCount(),
                reservation.getNotes(),
                reservation.getCancellationReason(),
                toIso(reservation.getCreatedAt()),
                reservation.getEquipments().stream().map(this::toEquipmentResponse).toList()
        );
    }

    public SpaceAvailabilityResponse toAvailabilityResponse(SpaceAvailability availability) {
        return new SpaceAvailabilityResponse(availability.available(), availability.overlappingReservations());
    }

    private ReservationEquipmentResponse toEquipmentResponse(ReservationEquipment equipment) {
        return new ReservationEquipmentResponse(
                equipment.getId(),
                equipment.getEquipmentId(),
                equipment.getStatus(),
                toIso(equipment.getDeliveredAt()),
                equipment.getDeliveredBy(),
                toIso(equipment.getReturnedAt()),
                equipment.getReturnedBy(),
                equipment.getConditionNotes()
        );
    }

    private String toIso(Instant value) {
        return value == null ? null : value.toString();
    }
}






