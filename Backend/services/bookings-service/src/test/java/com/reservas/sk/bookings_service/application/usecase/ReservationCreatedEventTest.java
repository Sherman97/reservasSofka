package com.reservas.sk.bookings_service.application.usecase;

import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class ReservationCreatedEventTest {
    private static final String ASSERT_MSG = "PMD UnitTestAssertionsShouldIncludeMessage";

    @Test
    void constructorKeepsEquipmentIdsAsNullWhenInputIsNull() {
        ReservationCreatedEvent event = new ReservationCreatedEvent(
                1L,
                2L,
                3L,
                "confirmed",
                "2026-03-01T10:00:00Z",
                "2026-03-01T11:00:00Z",
                null,
                Instant.parse("2026-03-01T09:00:00Z")
        );

        assertNull(event.equipmentIds(), ASSERT_MSG);
    }

    @Test
    void constructorCopiesEquipmentIdsDefensively() {
        List<Long> equipmentIds = new ArrayList<>();
        equipmentIds.add(10L);

        ReservationCreatedEvent event = new ReservationCreatedEvent(
                1L,
                2L,
                3L,
                "confirmed",
                "2026-03-01T10:00:00Z",
                "2026-03-01T11:00:00Z",
                equipmentIds,
                Instant.parse("2026-03-01T09:00:00Z")
        );
        equipmentIds.clear();

        assertEquals(List.of(10L), event.equipmentIds(), ASSERT_MSG);
    }
}
