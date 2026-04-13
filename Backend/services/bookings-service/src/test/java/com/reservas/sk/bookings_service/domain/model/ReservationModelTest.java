package com.reservas.sk.bookings_service.domain.model;

import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ReservationModelTest {
    private static final String ASSERT_MSG = "PMD UnitTestAssertionsShouldIncludeMessage";

    @Test
    void constructorUsesEmptyEquipmentsWhenInputListIsNull() {
        Reservation reservation = new Reservation(
                1L,
                2L,
                3L,
                Instant.parse("2026-03-01T10:00:00Z"),
                Instant.parse("2026-03-01T11:00:00Z"),
                "confirmed",
                "Titulo",
                2,
                null,
                null,
                Instant.parse("2026-03-01T09:00:00Z"),
                null
        );

        assertTrue(reservation.getEquipments().isEmpty(), ASSERT_MSG);
    }

    @Test
    void constructorCopiesEquipmentsDefensively() {
        List<ReservationEquipment> equipments = new ArrayList<>();
        equipments.add(new ReservationEquipment(1L, 1L, 10L, "requested", null, null, null, null, null));

        Reservation reservation = new Reservation(
                1L,
                2L,
                3L,
                Instant.parse("2026-03-01T10:00:00Z"),
                Instant.parse("2026-03-01T11:00:00Z"),
                "confirmed",
                "Titulo",
                2,
                null,
                null,
                Instant.parse("2026-03-01T09:00:00Z"),
                equipments
        );
        equipments.clear();

        assertEquals(1, reservation.getEquipments().size(), ASSERT_MSG);
    }
}
