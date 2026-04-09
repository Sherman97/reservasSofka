package com.reservas.sk.bookings_service.domain.model;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ReservationStatusCatalogTest {
    private static final String ASSERT_MSG = "PMD UnitTestAssertionsShouldIncludeMessage";

    @Test
    void mapAdminToSystem_returnsEmptyWhenStatusIsUnknown() {
        assertTrue(ReservationStatusCatalog.mapAdminToSystem("desconocido").isEmpty(), ASSERT_MSG);
    }

    @Test
    void normalizeStatusOrNull_returnsNullForBlankValues() {
        assertEquals(null, ReservationStatusCatalog.normalizeStatusOrNull("   "), ASSERT_MSG);
    }

    @Test
    void isAllowedSystemFilterStatus_rejectsUnknownStatus() {
        assertFalse(ReservationStatusCatalog.isAllowedSystemFilterStatus("other"), ASSERT_MSG);
    }
}
