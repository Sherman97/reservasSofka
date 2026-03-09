package com.reservas.sk.inventory_service.adapters.in.web;

import com.reservas.sk.inventory_service.adapters.in.web.dto.EquipmentResponse;
import com.reservas.sk.inventory_service.domain.model.Equipment;
import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class InventoryHttpMapperTest {
    private static final String ASSERT_MSG = "PMD UnitTestAssertionsShouldIncludeMessage";

    private final InventoryHttpMapper mapper = new InventoryHttpMapper();

    @Test
    void toResponse_mapsInstantFieldsToIsoWhenNotNull() {
        Equipment equipment = new Equipment(
                1L,
                10L,
                "Laptop",
                "SN-1",
                "BC-1",
                "M-1",
                "available",
                null,
                null,
                Instant.parse("2026-01-01T10:00:00Z"),
                Instant.parse("2026-01-02T10:00:00Z")
        );

        EquipmentResponse response = mapper.toResponse(equipment);

        assertEquals("2026-01-01T10:00:00Z", response.createdAt(), ASSERT_MSG);
        assertEquals("2026-01-02T10:00:00Z", response.updatedAt(), ASSERT_MSG);
    }

    @Test
    void toResponse_mapsNullUpdatedAtAsNull() {
        Equipment equipment = new Equipment(
                2L,
                10L,
                "Proyector",
                "SN-2",
                null,
                null,
                "maintenance",
                null,
                null,
                Instant.parse("2026-01-01T10:00:00Z"),
                null
        );

        EquipmentResponse response = mapper.toResponse(equipment);

        assertNull(response.updatedAt(), ASSERT_MSG);
    }
}
