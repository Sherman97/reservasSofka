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
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
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
    void register_ok_hashTokenYEvento() {
        RegisterCommand cmd = new RegisterCommand("  Juan Perez  ", "  JUAN@Email.com  ", "1234");
        User storedUser = new User(10L, "Juan Perez", "juan@email.com", "hashed-1234", LocalDateTime.now());

        when(userPersistencePort.existsByEmail("juan@email.com")).thenReturn(false);
        when(passwordHasherPort.hash("1234")).thenReturn("hashed-1234");
        when(userPersistencePort.save("Juan Perez", "juan@email.com", "hashed-1234")).thenReturn(storedUser);
        when(tokenPort.generate(storedUser)).thenReturn("jwt-token");

        AuthResult result = service.register(cmd);

        assertNotNull(result);
        assertEquals(storedUser, result.user());
        assertEquals("jwt-token", result.token());
        verify(passwordHasherPort, times(1)).hash("1234");
        verify(tokenPort, times(1)).generate(storedUser);

        ArgumentCaptor<UserCreatedEvent> eventCaptor = ArgumentCaptor.forClass(UserCreatedEvent.class);
        verify(userEventPublisherPort, times(1)).publishUserCreated(eventCaptor.capture());
        UserCreatedEvent event = eventCaptor.getValue();
        assertEquals(10L, event.userId());
        assertEquals("juan@email.com", event.email());
        assertEquals("Juan Perez", event.name());
        assertNotNull(event.occurredAt());
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
    void login_ok_credencialesValidas() {
        LoginCommand cmd = new LoginCommand("  JUAN@Email.com  ", "1234");
        User existingUser = new User(11L, "Juan", "juan@email.com", "stored-hash", LocalDateTime.now());

        when(userPersistencePort.findByEmail("juan@email.com")).thenReturn(Optional.of(existingUser));
        when(passwordHasherPort.matches("1234", "stored-hash")).thenReturn(true);
        when(tokenPort.generate(existingUser)).thenReturn("jwt-login");

        AuthResult result = service.login(cmd);

        assertNotNull(result);
        assertEquals(existingUser, result.user());
        assertEquals("jwt-login", result.token());
        verify(passwordHasherPort, times(1)).matches("1234", "stored-hash");
        verify(tokenPort, times(1)).generate(existingUser);
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
