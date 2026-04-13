package com.reservas.sk.bookings_service.domain.service;

import com.reservas.sk.bookings_service.exception.ApiException;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class DateTimeServiceTest {
    private static final String ASSERT_MSG = "PMD UnitTestAssertionsShouldIncludeMessage";
    private static final String FIELD_START_AT = "startAt";

    @Test
    void parse_acceptsInstantFormat() {
        Instant result = DateTimeService.parse("2026-03-01T10:00:00Z", FIELD_START_AT);

        assertEquals(Instant.parse("2026-03-01T10:00:00Z"), result, ASSERT_MSG);
    }

    @Test
    void parse_acceptsLocalDateTimeFormat() {
        Instant result = DateTimeService.parse("2026-03-01T10:00:00", FIELD_START_AT);

        assertEquals(Instant.parse("2026-03-01T10:00:00Z"), result, ASSERT_MSG);
    }

    @Test
    void parse_rejectsNullValue() {
        ApiException ex = assertThrows(ApiException.class, () -> DateTimeService.parse(null, FIELD_START_AT));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus(), ASSERT_MSG);
    }

    @Test
    void parse_rejectsInvalidValue() {
        ApiException ex = assertThrows(
                ApiException.class,
                () -> DateTimeService.parse("not-a-date", FIELD_START_AT)
        );

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus(), ASSERT_MSG);
    }
}
