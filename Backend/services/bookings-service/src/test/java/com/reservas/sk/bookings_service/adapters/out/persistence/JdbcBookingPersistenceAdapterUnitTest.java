package com.reservas.sk.bookings_service.adapters.out.persistence;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class JdbcBookingPersistenceAdapterUnitTest {

    private JdbcTemplate jdbcTemplate;
    private JdbcBookingPersistenceAdapter adapter;

    @BeforeEach
    void setUp() {
        jdbcTemplate = mock(JdbcTemplate.class);
        adapter = new JdbcBookingPersistenceAdapter(jdbcTemplate);
    }

    @Test
    void userExists_trueWhenQueryReturnsRow() {
        when(jdbcTemplate.query(anyString(), org.mockito.ArgumentMatchers.<RowMapper<Integer>>any(), eq(5L)))
                .thenReturn(List.of(5));

        assertTrue(adapter.userExists(5L));
    }

    @Test
    void userExists_falseWhenQueryIsEmpty() {
        when(jdbcTemplate.query(anyString(), org.mockito.ArgumentMatchers.<RowMapper<Integer>>any(), eq(5L)))
                .thenReturn(List.of());

        assertFalse(adapter.userExists(5L));
    }

    @Test
    void findSpaceCityId_returnsOptionalValues() {
        when(jdbcTemplate.query(anyString(), org.mockito.ArgumentMatchers.<RowMapper<Long>>any(), eq(9L)))
                .thenReturn(List.of(12L));

        Optional<Long> found = adapter.findSpaceCityId(9L);

        assertTrue(found.isPresent());
        assertEquals(12L, found.get());

        when(jdbcTemplate.query(anyString(), org.mockito.ArgumentMatchers.<RowMapper<Long>>any(), eq(10L)))
                .thenReturn(List.of());
        assertTrue(adapter.findSpaceCityId(10L).isEmpty());
    }

    @Test
    void equipmentLookupMethods_returnEmptyWithoutQueryWhenIdsMissing() {
        assertTrue(adapter.findExistingEquipmentIds(List.of()).isEmpty());
        assertTrue(adapter.findUnavailableEquipmentIds(null).isEmpty());
        assertTrue(adapter.findEquipmentIdsOutsideCity(List.of(), 1L).isEmpty());
    }

    @Test
    void acquireAndReleaseLock_useNamedLock() {
        when(jdbcTemplate.queryForObject(anyString(), eq(Integer.class), anyString(), anyInt())).thenReturn(1);

        boolean acquired = adapter.acquireSpaceReservationLock(44L, 5);
        adapter.releaseSpaceReservationLock(44L);

        assertTrue(acquired);

        ArgumentCaptor<String> lockNameCaptor = ArgumentCaptor.forClass(String.class);
        verify(jdbcTemplate).queryForObject(eq("SELECT RELEASE_LOCK(?)"), eq(Integer.class), lockNameCaptor.capture());
        assertEquals("bookings:space:44", lockNameCaptor.getValue());
    }

    @Test
    void acquireLock_returnsFalseForNullOrZero() {
        when(jdbcTemplate.queryForObject(anyString(), eq(Integer.class), anyString(), anyInt())).thenReturn(null);
        assertFalse(adapter.acquireSpaceReservationLock(1L, 1));

        when(jdbcTemplate.queryForObject(anyString(), eq(Integer.class), anyString(), anyInt())).thenReturn(0);
        assertFalse(adapter.acquireSpaceReservationLock(1L, 1));
    }

    @Test
    void updatesAndLogMethods_delegateToJdbc() {
        adapter.updateReservationCancellation(1L, "cancelled", "motivo");
        adapter.updateReservationStatus(1L, "completed");
        adapter.markReservationEquipmentsDelivered(1L, 2L, Instant.parse("2026-03-01T10:00:00Z"), "ok");
        adapter.markReservationEquipmentsReturned(1L, 2L, Instant.parse("2026-03-01T10:10:00Z"), "ok");
        adapter.insertReservationHandoverLog(1L, 2L, 3L, 4L, "DELIVERED", "ok", Instant.parse("2026-03-01T10:20:00Z"));

        verify(jdbcTemplate).update(eq("UPDATE reservations SET status = ?, cancellation_reason = ? WHERE id = ?"), eq("cancelled"), eq("motivo"), eq(1L));
        verify(jdbcTemplate).update(eq("UPDATE reservations SET status = ? WHERE id = ?"), eq("completed"), eq(1L));
        verify(jdbcTemplate).update(
                org.mockito.ArgumentMatchers.contains("SET status = 'delivered'"),
                any(),
                anyLong(),
                any(),
                eq(1L)
        );
        verify(jdbcTemplate).update(
                org.mockito.ArgumentMatchers.contains("SET status = 'returned'"),
                any(),
                anyLong(),
                any(),
                eq(1L)
        );
        verify(jdbcTemplate).update(anyString(), eq(1L), eq(2L), eq(3L), eq(4L), eq("DELIVERED"), eq("ok"), any());
    }

    @Test
    void findReservationEquipmentsByReservationIds_emptyInputReturnsEmptyMap() {
        assertTrue(adapter.findReservationEquipmentsByReservationIds(List.of()).isEmpty());
    }
}
