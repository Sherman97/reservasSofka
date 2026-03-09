package com.reservas.sk.locations_service.adapters.in.web;

import com.reservas.sk.locations_service.domain.model.City;
import com.reservas.sk.locations_service.domain.model.Space;
import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class LocationsHttpMapperTest {
    private static final String ASSERT_MSG = "PMD UnitTestAssertionsShouldIncludeMessage";
    private final LocationsHttpMapper mapper = new LocationsHttpMapper();

    @Test
    void toResponse_mapsCityWithIsoDates() {
        City city = new City(
                1L,
                "Bogota",
                "Colombia",
                Instant.parse("2026-03-01T10:00:00Z"),
                Instant.parse("2026-03-01T11:00:00Z")
        );

        var response = mapper.toResponse(city);

        assertEquals("2026-03-01T10:00:00Z", response.createdAt(), ASSERT_MSG);
        assertEquals("2026-03-01T11:00:00Z", response.updatedAt(), ASSERT_MSG);
    }

    @Test
    void toResponse_mapsNullDatesAsNull() {
        Space space = new Space(2L, 1L, "Sala A", 10, "1", "desc", null, true, null, null);

        var response = mapper.toResponse(space);

        assertNull(response.createdAt(), ASSERT_MSG);
        assertNull(response.updatedAt(), ASSERT_MSG);
    }
}
