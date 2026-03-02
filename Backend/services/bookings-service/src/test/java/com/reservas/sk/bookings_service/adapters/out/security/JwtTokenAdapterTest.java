package com.reservas.sk.bookings_service.adapters.out.security;

import com.reservas.sk.bookings_service.application.usecase.AuthenticatedUser;
import com.reservas.sk.bookings_service.exception.ApiException;
import com.reservas.sk.bookings_service.infrastructure.config.JwtProperties;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class JwtTokenAdapterTest {

    @Test
    void parse_validToken() {
        JwtProperties properties = new JwtProperties();
        String secret = "plain-secret-with-at-least-32-chars-abcdef";
        properties.setSecret(secret);
        JwtTokenAdapter adapter = new JwtTokenAdapter(properties);
        adapter.init();

        String token = Jwts.builder()
                .subject("55")
                .claim("email", "bookings@test.com")
                .signWith(Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8)))
                .compact();

        AuthenticatedUser parsed = adapter.parse(token);

        assertEquals(55L, parsed.userId());
        assertEquals("bookings@test.com", parsed.email());
    }

    @Test
    void init_failsWhenSecretMissing() {
        JwtProperties properties = new JwtProperties();
        properties.setSecret(" ");

        JwtTokenAdapter adapter = new JwtTokenAdapter(properties);

        ApiException ex = assertThrows(ApiException.class, adapter::init);
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, ex.getStatus());
    }
}
