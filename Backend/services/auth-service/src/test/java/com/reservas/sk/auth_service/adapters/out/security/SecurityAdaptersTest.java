package com.reservas.sk.auth_service.adapters.out.security;

import com.reservas.sk.auth_service.application.usecase.AuthenticatedUser;
import com.reservas.sk.auth_service.domain.model.User;
import com.reservas.sk.auth_service.exception.ApiException;
import com.reservas.sk.auth_service.infrastructure.config.JwtProperties;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Base64;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class SecurityAdaptersTest {
    private static final String ASSERT_MSG = "PMD UnitTestAssertionsShouldIncludeMessage";
    private static final String RAW_PASSWORD = "raw";
    private static final String HASHED_PASSWORD = "hashed";

    @Test
    void jwtTokenAdapter_generatesAndParsesToken() {
        JwtProperties props = new JwtProperties();
        props.setSecret("plain-secret-with-at-least-32-chars-abcdef");
        props.setExpiration(Duration.ofHours(2));

        JwtTokenAdapter adapter = new JwtTokenAdapter(props);
        adapter.init();

        User user = new User(7L, "Juan", "juan@test.com", "hash", LocalDateTime.now());
        String token = adapter.generate(user);

        assertNotNull(token, ASSERT_MSG);

        AuthenticatedUser parsed = adapter.parse(token);
        assertEquals(7L, parsed.userId(), ASSERT_MSG);
        assertEquals("juan@test.com", parsed.email(), ASSERT_MSG);
    }

    @Test
    void jwtTokenAdapter_initFailsWhenSecretMissing() {
        JwtProperties props = new JwtProperties();
        props.setSecret(" ");

        JwtTokenAdapter adapter = new JwtTokenAdapter(props);

        ApiException ex = assertThrows(ApiException.class, adapter::init);
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, ex.getStatus(), ASSERT_MSG);
    }

    @Test
    void jwtTokenAdapter_acceptsNonBase64SecretFallback() {
        JwtProperties props = new JwtProperties();
        props.setSecret("plain-secret-with-at-least-32-chars");

        JwtTokenAdapter adapter = new JwtTokenAdapter(props);
        adapter.init();

        String token = adapter.generate(new User(1L, "N", "a@b.com", "h", LocalDateTime.now()));
        assertNotNull(adapter.parse(token), ASSERT_MSG);
    }

    @Test
    void jwtTokenAdapter_acceptsBase64Secret() {
        JwtProperties props = new JwtProperties();
        String rawSecret = "plain-secret-with-at-least-32-chars-abcdef";
        props.setSecret(Base64.getEncoder().encodeToString(rawSecret.getBytes()));
        props.setExpiration(Duration.ofHours(1));

        JwtTokenAdapter adapter = new JwtTokenAdapter(props);
        adapter.init();

        String token = adapter.generate(new User(2L, "Ana", "ana@test.com", "h", LocalDateTime.now()));
        AuthenticatedUser parsed = adapter.parse(token);
        assertEquals(2L, parsed.userId(), ASSERT_MSG);
        assertEquals("ana@test.com", parsed.email(), ASSERT_MSG);
    }

    @Test
    void bcryptAdapter_delegatesToPasswordEncoder() {
        PasswordEncoder encoder = mock(PasswordEncoder.class);
        when(encoder.encode(RAW_PASSWORD)).thenReturn(HASHED_PASSWORD);
        when(encoder.matches(RAW_PASSWORD, HASHED_PASSWORD)).thenReturn(true);

        BcryptPasswordHasherAdapter adapter = new BcryptPasswordHasherAdapter(encoder);

        assertEquals(HASHED_PASSWORD, adapter.hash(RAW_PASSWORD), ASSERT_MSG);
        assertTrue(adapter.matches(RAW_PASSWORD, HASHED_PASSWORD), ASSERT_MSG);
    }
}


