package com.reservas.sk.notifications_service;

import org.junit.jupiter.api.Test;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import static org.junit.jupiter.api.Assertions.assertNotNull;

class NotificationsServiceApplicationTests {
    private static final String ASSERT_MSG = "PMD UnitTestAssertionsShouldIncludeMessage";
    @Test
    void applicationTestPlaceholder() {
        SpringBootApplication annotation = NotificationsServiceApplication.class.getAnnotation(SpringBootApplication.class);
        assertNotNull(annotation, ASSERT_MSG);
    }
}







