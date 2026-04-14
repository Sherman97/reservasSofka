package com.reservas.sk.bookings_service.adapters.in.web;

import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class HealthControllerTest {

    @Test
    void healthReturnsExpectedPayload() {
        HealthController controller = new HealthController();

        Map<String, Object> response = controller.health();

        assertEquals("bookings-service", response.get("service"));
        assertTrue((Boolean) response.get("ok"));
    }
}
