package com.reservas.sk.bookings_service.application.port.in;

import com.reservas.sk.bookings_service.application.usecase.CheckSpaceAvailabilityQuery;
import com.reservas.sk.bookings_service.application.usecase.CreateReservationCommand;
import com.reservas.sk.bookings_service.application.usecase.ListReservationsQuery;
import com.reservas.sk.bookings_service.domain.model.Reservation;
import com.reservas.sk.bookings_service.domain.model.SpaceAvailability;

import java.util.List;

public interface BookingUseCase {
    SpaceAvailability checkAvailability(CheckSpaceAvailabilityQuery query);

    Reservation createReservation(CreateReservationCommand command);

    List<Reservation> listReservations(ListReservationsQuery query);

    Reservation getReservationById(Long reservationId);

    Reservation cancelReservation(Long reservationId, String reason);
}






