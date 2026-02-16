package com.reservas.sk.auth_service.application.port.out;

import com.reservas.sk.auth_service.application.usecase.AuthenticatedUser;
import com.reservas.sk.auth_service.domain.model.User;

public interface TokenPort {
    String generate(User user);

    AuthenticatedUser parse(String token);
}





