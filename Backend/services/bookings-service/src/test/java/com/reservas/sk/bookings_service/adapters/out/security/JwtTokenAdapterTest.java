package com.reservas.sk.bookings_service.adapters.out.security;

import com.reservas.sk.bookings_service.application.usecase.AuthenticatedUser;
import com.reservas.sk.bookings_service.exception.ApiException;
import com.reservas.sk.bookings_service.infrastructure.config.JwtProperties;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JwtTokenAdapterTest {
    private static final String ASSERT_MSG = "PMD UnitTestAssertionsShouldIncludeMessage";

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

        assertEquals(55L, parsed.userId(), ASSERT_MSG);
        assertEquals("bookings@test.com", parsed.email(), ASSERT_MSG);
    }

    @Test
    void init_failsWhenSecretMissing() {
        JwtProperties properties = new JwtProperties();
        properties.setSecret(" ");

        JwtTokenAdapter adapter = new JwtTokenAdapter(properties);

        ApiException ex = assertThrows(ApiException.class, adapter::init);
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, ex.getStatus(), ASSERT_MSG);
    }

    @Test
    void parse_defaultsToUserRoleWhenRolesClaimIsMissing() {
        JwtProperties properties = new JwtProperties();
        String secret = "plain-secret-with-at-least-32-chars-abcdef";
        properties.setSecret(secret);
        JwtTokenAdapter adapter = new JwtTokenAdapter(properties);
        adapter.init();

        String token = Jwts.builder()
                .subject("77")
                .claim("email", "roles-missing@test.com")
                .signWith(Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8)))
                .compact();

        AuthenticatedUser parsed = adapter.parse(token);

        assertEquals(77L, parsed.userId(), ASSERT_MSG);
        assertEquals(Set.of("USER"), parsed.roles(), ASSERT_MSG);
        assertTrue(parsed.hasRole("user"), ASSERT_MSG);
    }

    @Test
    void parse_normalizesRolesAndFiltersInvalidEntries() {
        JwtProperties properties = new JwtProperties();
        String secret = "plain-secret-with-at-least-32-chars-abcdef";
        properties.setSecret(secret);
        JwtTokenAdapter adapter = new JwtTokenAdapter(properties);
        adapter.init();

        String token = Jwts.builder()
                .subject("88")
                .claim("email", "roles@test.com")
                .claim("roles", List.of(" admin ", "", "user"))
                .signWith(Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8)))
                .compact();

        AuthenticatedUser parsed = adapter.parse(token);

        assertEquals(Set.of("ADMIN", "USER"), parsed.roles(), ASSERT_MSG);
        assertTrue(parsed.hasRole("admin"), ASSERT_MSG);
    }

    @Test
    void init_acceptsBase64Secret() {
        JwtProperties properties = new JwtProperties();
        String rawSecret = "plain-secret-with-at-least-32-chars-abcdef";
        properties.setSecret(Base64.getEncoder().encodeToString(rawSecret.getBytes(StandardCharsets.UTF_8)));
        JwtTokenAdapter adapter = new JwtTokenAdapter(properties);

        adapter.init();

        String token = Jwts.builder()
                .subject("90")
                .claim("email", "base64@test.com")
                .signWith(Keys.hmacShaKeyFor(rawSecret.getBytes(StandardCharsets.UTF_8)))
                .compact();

        AuthenticatedUser parsed = adapter.parse(token);
        assertEquals(90L, parsed.userId(), ASSERT_MSG);
    }

    @Test
    void parse_defaultsToUserRoleWhenRolesClaimIsNotAList() {
        JwtProperties properties = new JwtProperties();
        String secret = "plain-secret-with-at-least-32-chars-abcdef";
        properties.setSecret(secret);
        JwtTokenAdapter adapter = new JwtTokenAdapter(properties);
        adapter.init();

        String token = Jwts.builder()
                .subject("91")
                .claim("email", "raw-role@test.com")
                .claim("roles", "ADMIN")
                .signWith(Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8)))
                .compact();

        AuthenticatedUser parsed = adapter.parse(token);
        assertEquals(Set.of("USER"), parsed.roles(), ASSERT_MSG);
    }

    @Test
    void parse_defaultsToUserRoleWhenRolesListHasOnlyBlankValues() {
        JwtProperties properties = new JwtProperties();
        String secret = "plain-secret-with-at-least-32-chars-abcdef";
        properties.setSecret(secret);
        JwtTokenAdapter adapter = new JwtTokenAdapter(properties);
        adapter.init();

        String token = Jwts.builder()
                .subject("92")
                .claim("email", "blank-roles@test.com")
                .claim("roles", List.of(" ", "   "))
                .signWith(Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8)))
                .compact();

        AuthenticatedUser parsed = adapter.parse(token);
        assertEquals(Set.of("USER"), parsed.roles(), ASSERT_MSG);
    }
}

