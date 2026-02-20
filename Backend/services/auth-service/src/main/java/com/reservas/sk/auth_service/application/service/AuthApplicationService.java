package com.reservas.sk.auth_service.application.service;

import com.reservas.sk.auth_service.application.port.in.AuthUseCase;
import com.reservas.sk.auth_service.application.port.out.PasswordHasherPort;
import com.reservas.sk.auth_service.application.port.out.TokenPort;
import com.reservas.sk.auth_service.application.port.out.UserEventPublisherPort;
import com.reservas.sk.auth_service.application.port.out.UserPersistencePort;
import com.reservas.sk.auth_service.application.usecase.AuthResult;
import com.reservas.sk.auth_service.application.usecase.LoginCommand;
import com.reservas.sk.auth_service.application.usecase.RegisterCommand;
import com.reservas.sk.auth_service.application.usecase.UserCreatedEvent;
import com.reservas.sk.auth_service.domain.model.User;
import com.reservas.sk.auth_service.domain.service.EmailNormalizer;
import com.reservas.sk.auth_service.exception.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
// Human Check 🛡️: se incluyen codigos de error para distinguir conflictos/auth/not-found.
public class AuthApplicationService implements AuthUseCase {
    private final UserPersistencePort userPersistencePort;
    private final PasswordHasherPort passwordHasherPort;
    private final TokenPort tokenPort;
    private final UserEventPublisherPort userEventPublisherPort;

    public AuthApplicationService(UserPersistencePort userPersistencePort,
                                  PasswordHasherPort passwordHasherPort,
                                  TokenPort tokenPort,
                                  UserEventPublisherPort userEventPublisherPort) {
        this.userPersistencePort = userPersistencePort;
        this.passwordHasherPort = passwordHasherPort;
        this.tokenPort = tokenPort;
        this.userEventPublisherPort = userEventPublisherPort;
    }

    @Override
    public AuthResult register(RegisterCommand command) {
        String normalizedEmail = EmailNormalizer.normalize(command.email());

        if (userPersistencePort.existsByEmail(normalizedEmail)) {
            throw new ApiException(HttpStatus.CONFLICT, "El email ya esta registrado", "EMAIL_ALREADY_REGISTERED");
        }

        User user = userPersistencePort.save(
                command.name().trim(),
                normalizedEmail,
                passwordHasherPort.hash(command.password())
        );

        String token = tokenPort.generate(user);
        userEventPublisherPort.publishUserCreated(
                new UserCreatedEvent(user.getId(), user.getEmail(), user.getName(), Instant.now())
        );

        return new AuthResult(user, token);
    }

    @Override
    public AuthResult login(LoginCommand command) {
        String normalizedEmail = EmailNormalizer.normalize(command.email());

        User user = userPersistencePort.findByEmail(normalizedEmail)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Credenciales invalidas", "INVALID_CREDENTIALS"));

        if (!passwordHasherPort.matches(command.password(), user.getPasswordHash())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Credenciales invalidas", "INVALID_CREDENTIALS");
        }

        return new AuthResult(user, tokenPort.generate(user));
    }

    @Override
    public User getMe(Long userId) {
        return userPersistencePort.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Usuario no encontrado", "USER_NOT_FOUND"));
    }
}





