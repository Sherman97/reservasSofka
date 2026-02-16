package com.reservas.sk.auth_service.application.usecase;

import com.reservas.sk.auth_service.domain.model.User;

public record AuthResult(User user, String token) {
}





