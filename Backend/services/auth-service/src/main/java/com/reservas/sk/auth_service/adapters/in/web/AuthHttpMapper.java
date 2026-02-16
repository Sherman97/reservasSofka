package com.reservas.sk.auth_service.adapters.in.web;

import com.reservas.sk.auth_service.adapters.in.web.dto.AuthResponse;
import com.reservas.sk.auth_service.adapters.in.web.dto.UserResponse;
import com.reservas.sk.auth_service.application.usecase.AuthResult;
import com.reservas.sk.auth_service.domain.model.User;
import org.springframework.stereotype.Component;

@Component
public class AuthHttpMapper {
    public AuthResponse toAuthResponse(AuthResult result) {
        return new AuthResponse(toUserResponse(result.user()), result.token());
    }

    public UserResponse toUserResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getCreatedAt()
        );
    }
}





