package com.reservas.sk.locations_service.application.port.out;

import com.reservas.sk.locations_service.application.usecase.AuthenticatedUser;

public interface TokenPort {
    AuthenticatedUser parse(String token);
}






