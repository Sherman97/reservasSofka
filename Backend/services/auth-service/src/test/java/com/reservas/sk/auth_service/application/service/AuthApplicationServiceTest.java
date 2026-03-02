package com.reservas.sk.auth_service.application.service;

import com.reservas.sk.auth_service.application.port.out.PasswordHasherPort;
import com.reservas.sk.auth_service.application.port.out.TokenPort;
import com.reservas.sk.auth_service.application.port.out.UserEventPublisherPort;
import com.reservas.sk.auth_service.application.port.out.UserPersistencePort;
import com.reservas.sk.auth_service.application.usecase.AuthResult;
import com.reservas.sk.auth_service.application.usecase.LoginCommand;
import com.reservas.sk.auth_service.application.usecase.RegisterCommand;
import com.reservas.sk.auth_service.application.usecase.UserCreatedEvent;
import com.reservas.sk.auth_service.domain.model.User;
import com.reservas.sk.auth_service.exception.ApiException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AuthApplicationServiceTest {
    @Mock
    private UserPersistencePort userPersistencePort;
    @Mock
    private PasswordHasherPort passwordHasherPort;
    @Mock
    private TokenPort tokenPort;
    @Mock
    private UserEventPublisherPort userEventPublisherPort;
    @InjectMocks
    private AuthApplicationService service;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void register_emailAlreadyRegistered() {
        RegisterCommand cmd = new RegisterCommand("Juan", "juan@email.com", "1234");
        when(userPersistencePort.existsByEmail(anyString())).thenReturn(true);
        ApiException ex = assertThrows(ApiException.class, () -> service.register(cmd));
        assertEquals(HttpStatus.CONFLICT, ex.getStatus());
        assertEquals("EMAIL_ALREADY_REGISTERED", ex.getErrorCode());
    }

    @Test
    void login_invalidCredentials() {
        LoginCommand cmd = new LoginCommand("juan@email.com", "1234");
        when(userPersistencePort.findByEmail(anyString())).thenReturn(Optional.empty());
        ApiException ex = assertThrows(ApiException.class, () -> service.login(cmd));
        assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatus());
        assertEquals("INVALID_CREDENTIALS", ex.getErrorCode());
    }

    @Test
    void getMe_userNotFound() {
        when(userPersistencePort.findById(99L)).thenReturn(Optional.empty());
        ApiException ex = assertThrows(ApiException.class, () -> service.getMe(99L));
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatus());
        assertEquals("USER_NOT_FOUND", ex.getErrorCode());
    }
}

