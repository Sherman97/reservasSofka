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

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class SecurityAdaptersTest {

    @Test
    void jwtTokenAdapter_generatesAndParsesToken() {
        JwtProperties props = new JwtProperties();
        props.setSecret("plain-secret-with-at-least-32-chars-abcdef");
        props.setExpiration(Duration.ofHours(2));

        JwtTokenAdapter adapter = new JwtTokenAdapter(props);
        adapter.init();

        User user = new User(7L, "Juan", "juan@test.com", "hash", LocalDateTime.now());
        String token = adapter.generate(user);

        assertNotNull(token);

        AuthenticatedUser parsed = adapter.parse(token);
        assertEquals(7L, parsed.userId());
        assertEquals("juan@test.com", parsed.email());
    }

    @Test
    void jwtTokenAdapter_initFailsWhenSecretMissing() {
        JwtProperties props = new JwtProperties();
        props.setSecret(" ");

        JwtTokenAdapter adapter = new JwtTokenAdapter(props);

        ApiException ex = assertThrows(ApiException.class, adapter::init);
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, ex.getStatus());
    }

    @Test
    void jwtTokenAdapter_acceptsNonBase64SecretFallback() {
        JwtProperties props = new JwtProperties();
        props.setSecret("plain-secret-with-at-least-32-chars");

        JwtTokenAdapter adapter = new JwtTokenAdapter(props);
        adapter.init();

        String token = adapter.generate(new User(1L, "N", "a@b.com", "h", LocalDateTime.now()));
        assertNotNull(adapter.parse(token));
    }

    @Test
    void bcryptAdapter_delegatesToPasswordEncoder() {
        PasswordEncoder encoder = mock(PasswordEncoder.class);
        when(encoder.encode("raw")).thenReturn("hashed");
        when(encoder.matches("raw", "hashed")).thenReturn(true);

        BcryptPasswordHasherAdapter adapter = new BcryptPasswordHasherAdapter(encoder);

        assertEquals("hashed", adapter.hash("raw"));
        assertTrue(adapter.matches("raw", "hashed"));
    }
}
