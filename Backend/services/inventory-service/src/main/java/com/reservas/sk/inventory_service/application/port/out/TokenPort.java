package com.reservas.sk.inventory_service.application.port.out;

import com.reservas.sk.inventory_service.application.usecase.AuthenticatedUser;

public interface TokenPort {
    AuthenticatedUser parse(String token);
}







