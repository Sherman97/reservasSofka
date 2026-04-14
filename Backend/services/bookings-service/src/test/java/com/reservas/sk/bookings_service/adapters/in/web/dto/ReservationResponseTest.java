package com.reservas.sk.bookings_service.adapters.in.web.dto;

import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ReservationResponseTest {
    private static final String ASSERT_MSG = "PMD UnitTestAssertionsShouldIncludeMessage";

    @Test
    void constructorUsesEmptyEquipmentsWhenInputListIsNull() {
        ReservationResponse response = new ReservationResponse(
                1L,
                2L,
                3L,
                "2026-03-01T10:00:00Z",
                "2026-03-01T11:00:00Z",
                "confirmed",
                "Titulo",
                2,
                null,
                null,
                "2026-03-01T09:00:00Z",
                null,
                null,
                null
        );

        assertTrue(response.equipments().isEmpty(), ASSERT_MSG);
    }

    @Test
    void constructorCopiesEquipmentsDefensively() {
        List<ReservationEquipmentResponse> equipments = new ArrayList<>();
        equipments.add(new ReservationEquipmentResponse(1L, 10L, "requested", null, null, null, null, null));

        ReservationResponse response = new ReservationResponse(
                1L,
                2L,
                3L,
                "2026-03-01T10:00:00Z",
                "2026-03-01T11:00:00Z",
                "confirmed",
                "Titulo",
                2,
                null,
                null,
                "2026-03-01T09:00:00Z",
                equipments,
                null,
                null
        );
        equipments.clear();

        assertEquals(1, response.equipments().size(), ASSERT_MSG);
    }
}
