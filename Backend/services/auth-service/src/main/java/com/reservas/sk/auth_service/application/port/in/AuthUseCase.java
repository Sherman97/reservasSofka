package com.reservas.sk.auth_service.application.port.in;

import com.reservas.sk.auth_service.application.usecase.AuthResult;
import com.reservas.sk.auth_service.application.usecase.LoginCommand;
import com.reservas.sk.auth_service.application.usecase.RegisterCommand;
import com.reservas.sk.auth_service.domain.model.User;

import java.util.List;

public interface AuthUseCase {
    AuthResult register(RegisterCommand command);

    AuthResult login(LoginCommand command);

    User getMe(Long userId);

    List<User> listNonAdminUsers(String query);
}





