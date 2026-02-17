package com.reservas.sk.bookings_service.domain.service;

import com.reservas.sk.bookings_service.exception.ApiException;
import org.springframework.http.HttpStatus;

import java.time.*;
import java.time.format.DateTimeParseException;

public final class DateTimeService {
    private DateTimeService() {
    }

    public static Instant parse(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, fieldName + " es invalido");
        }

        try {
            return Instant.parse(value);
        } catch (DateTimeParseException ignored) {
        }

        try {
            return LocalDateTime.parse(value).toInstant(ZoneOffset.UTC);
        } catch (DateTimeParseException ignored) {
        }

        throw new ApiException(HttpStatus.BAD_REQUEST, fieldName + " es invalido");
    }
}







