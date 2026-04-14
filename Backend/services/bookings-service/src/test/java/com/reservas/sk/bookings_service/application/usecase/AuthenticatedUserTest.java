package com.reservas.sk.bookings_service.application.usecase;

import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class AuthenticatedUserTest {
    private static final String ASSERT_MSG = "PMD UnitTestAssertionsShouldIncludeMessage";

    @Test
    void constructorWithNullRolesUsesUserByDefault() {
        AuthenticatedUser user = new AuthenticatedUser(1L, "a@test.com", null);

        assertEquals(Set.of("USER"), user.roles(), ASSERT_MSG);
    }

    @Test
    void hasRole_isCaseInsensitiveAndTrimsInput() {
        AuthenticatedUser user = new AuthenticatedUser(1L, "a@test.com", Set.of("ADMIN"));

        assertTrue(user.hasRole(" admin "), ASSERT_MSG);
    }

    @Test
    void hasRole_returnsFalseWhenRoleNameIsNullOrBlank() {
        AuthenticatedUser user = new AuthenticatedUser(1L, "a@test.com", Set.of("ADMIN"));

        assertFalse(user.hasRole(null), ASSERT_MSG);
        assertFalse(user.hasRole("   "), ASSERT_MSG);
    }
}
