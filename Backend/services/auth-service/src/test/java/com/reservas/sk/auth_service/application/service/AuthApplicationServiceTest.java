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

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.anyString;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

class AuthApplicationServiceTest {
    private static final String ASSERT_MSG = "PMD UnitTestAssertionsShouldIncludeMessage";
    private static final String RAW_PASSWORD = "1234";
    private static final String JUAN_EMAIL = "juan@email.com";
    private static final String STORED_HASH = "stored-hash";
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
        RegisterCommand cmd = registerCommand();
        User storedUser = storedUser();
        mockRegisterFlow(storedUser);

        AuthResult result = service.register(cmd);

        assertNotNull(result, ASSERT_MSG);
        assertEquals(storedUser, result.user(), ASSERT_MSG);
        assertEquals("jwt-token", result.token(), ASSERT_MSG);
        verify(passwordHasherPort, times(1)).hash(RAW_PASSWORD);
        verify(tokenPort, times(1)).generate(storedUser);
    }

    @Test
    void register_ok_publicaEventoConIdDelUsuarioCreado() {
        UserCreatedEvent event = registerAndCaptureUserCreatedEvent();
        assertEquals(10L, event.userId(), ASSERT_MSG);
    }

    @Test
    void register_ok_publicaEventoConEmailNormalizado() {
        UserCreatedEvent event = registerAndCaptureUserCreatedEvent();
        assertEquals(JUAN_EMAIL, event.email(), ASSERT_MSG);
    }

    @Test
    void register_ok_publicaEventoConNombreNormalizado() {
        UserCreatedEvent event = registerAndCaptureUserCreatedEvent();
        assertEquals("Juan Perez", event.name(), ASSERT_MSG);
    }

    @Test
    void register_ok_publicaEventoConFecha() {
        UserCreatedEvent event = registerAndCaptureUserCreatedEvent();
        assertNotNull(event.occurredAt(), ASSERT_MSG);
    }

    @Test
    void register_emailAlreadyRegistered() {
        RegisterCommand cmd = new RegisterCommand("Juan", JUAN_EMAIL, RAW_PASSWORD);
        when(userPersistencePort.existsByEmail(anyString())).thenReturn(true);
        ApiException ex = assertThrows(ApiException.class, () -> service.register(cmd));
        assertEquals(HttpStatus.CONFLICT, ex.getStatus(), ASSERT_MSG);
        assertEquals("EMAIL_ALREADY_REGISTERED", ex.getErrorCode(), ASSERT_MSG);
    }

    @Test
    void login_ok_credencialesValidas() {
        LoginCommand cmd = new LoginCommand("  JUAN@Email.com  ", RAW_PASSWORD);
        User existingUser = new User(11L, "Juan", JUAN_EMAIL, STORED_HASH, LocalDateTime.now());

        when(userPersistencePort.findByEmail(JUAN_EMAIL)).thenReturn(Optional.of(existingUser));
        when(passwordHasherPort.matches(RAW_PASSWORD, STORED_HASH)).thenReturn(true);
        when(tokenPort.generate(existingUser)).thenReturn("jwt-login");

        AuthResult result = service.login(cmd);

        assertNotNull(result, ASSERT_MSG);
        assertEquals(existingUser, result.user(), ASSERT_MSG);
        assertEquals("jwt-login", result.token(), ASSERT_MSG);
        verify(passwordHasherPort, times(1)).matches(RAW_PASSWORD, STORED_HASH);
        verify(tokenPort, times(1)).generate(existingUser);
    }

    @Test
    void login_invalidCredentials() {
        LoginCommand cmd = new LoginCommand(JUAN_EMAIL, RAW_PASSWORD);
        when(userPersistencePort.findByEmail(anyString())).thenReturn(Optional.empty());
        ApiException ex = assertThrows(ApiException.class, () -> service.login(cmd));
        assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatus(), ASSERT_MSG);
        assertEquals("INVALID_CREDENTIALS", ex.getErrorCode(), ASSERT_MSG);
    }

    @Test
    void login_invalidCredentialsWhenPasswordDoesNotMatch() {
        LoginCommand cmd = new LoginCommand(JUAN_EMAIL, RAW_PASSWORD);
        User existingUser = new User(11L, "Juan", JUAN_EMAIL, STORED_HASH, LocalDateTime.now());
        when(userPersistencePort.findByEmail(JUAN_EMAIL)).thenReturn(Optional.of(existingUser));
        when(passwordHasherPort.matches(RAW_PASSWORD, STORED_HASH)).thenReturn(false);

        ApiException ex = assertThrows(ApiException.class, () -> service.login(cmd));

        assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatus(), ASSERT_MSG);
        assertEquals("INVALID_CREDENTIALS", ex.getErrorCode(), ASSERT_MSG);
        verifyNoInteractions(tokenPort);
    }

    @Test
    void getMe_userNotFound() {
        when(userPersistencePort.findById(99L)).thenReturn(Optional.empty());
        ApiException ex = assertThrows(ApiException.class, () -> service.getMe(99L));
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatus(), ASSERT_MSG);
        assertEquals("USER_NOT_FOUND", ex.getErrorCode(), ASSERT_MSG);
    }

    private RegisterCommand registerCommand() {
        return new RegisterCommand("  Juan Perez  ", "  JUAN@Email.com  ", RAW_PASSWORD);
    }

    private User storedUser() {
        return new User(10L, "Juan Perez", JUAN_EMAIL, "hashed-1234", LocalDateTime.now());
    }

    private void mockRegisterFlow(User storedUser) {
        when(userPersistencePort.existsByEmail(JUAN_EMAIL)).thenReturn(false);
        when(passwordHasherPort.hash(RAW_PASSWORD)).thenReturn("hashed-1234");
        when(userPersistencePort.save("Juan Perez", JUAN_EMAIL, "hashed-1234")).thenReturn(storedUser);
        when(tokenPort.generate(storedUser)).thenReturn("jwt-token");
    }

    private UserCreatedEvent registerAndCaptureUserCreatedEvent() {
        RegisterCommand cmd = registerCommand();
        User storedUser = storedUser();
        mockRegisterFlow(storedUser);

        service.register(cmd);

        ArgumentCaptor<UserCreatedEvent> eventCaptor = ArgumentCaptor.forClass(UserCreatedEvent.class);
        verify(userEventPublisherPort, times(1)).publishUserCreated(eventCaptor.capture());
        return eventCaptor.getValue();
    }
}


