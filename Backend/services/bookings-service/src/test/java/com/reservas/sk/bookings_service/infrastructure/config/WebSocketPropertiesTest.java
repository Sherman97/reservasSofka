package com.reservas.sk.bookings_service.infrastructure.config;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class WebSocketPropertiesTest {

    @Test
    void defaultAllowedOriginsIsWildcard() {
        WebSocketProperties properties = new WebSocketProperties();

        assertEquals("*", properties.getAllowedOrigins());
    }

    @Test
    void setAllowedOriginsUpdatesValue() {
        WebSocketProperties properties = new WebSocketProperties();

        properties.setAllowedOrigins("http://localhost:5173");

        assertEquals("http://localhost:5173", properties.getAllowedOrigins());
    }
}
