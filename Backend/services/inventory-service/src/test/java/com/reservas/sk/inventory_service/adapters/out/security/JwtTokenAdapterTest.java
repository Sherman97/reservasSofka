package com.reservas.sk.inventory_service.adapters.out.security;

import com.reservas.sk.inventory_service.application.usecase.AuthenticatedUser;
import com.reservas.sk.inventory_service.exception.ApiException;
import com.reservas.sk.inventory_service.infrastructure.config.JwtProperties;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class JwtTokenAdapterTest {
    private static final String ASSERT_MSG = "PMD UnitTestAssertionsShouldIncludeMessage";

    @Test
    void parse_validToken() {
        JwtProperties properties = new JwtProperties();
        properties.setSecret("plain-secret-with-at-least-32-chars-abcdef");
        JwtTokenAdapter adapter = new JwtTokenAdapter(properties);
        adapter.init();

        String token = Jwts.builder()
                .subject("77")
                .claim("email", "inventory@test.com")
                .signWith(Keys.hmacShaKeyFor("plain-secret-with-at-least-32-chars-abcdef".getBytes(StandardCharsets.UTF_8)))
                .compact();

        AuthenticatedUser parsed = adapter.parse(token);

        assertEquals(77L, parsed.userId(), ASSERT_MSG);
        assertEquals("inventory@test.com", parsed.email(), ASSERT_MSG);
    }

    @Test
    void init_failsWhenSecretMissing() {
        JwtProperties properties = new JwtProperties();
        properties.setSecret(" ");

        JwtTokenAdapter adapter = new JwtTokenAdapter(properties);

        ApiException ex = assertThrows(ApiException.class, adapter::init);
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, ex.getStatus(), ASSERT_MSG);
    }
}

