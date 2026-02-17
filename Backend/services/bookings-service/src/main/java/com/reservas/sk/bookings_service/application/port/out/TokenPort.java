package com.reservas.sk.bookings_service.application.port.out;

import com.reservas.sk.bookings_service.application.usecase.AuthenticatedUser;

public interface TokenPort {
    AuthenticatedUser parse(String token);
}







