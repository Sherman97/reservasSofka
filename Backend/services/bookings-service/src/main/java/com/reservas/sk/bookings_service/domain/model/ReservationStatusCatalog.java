package com.reservas.sk.bookings_service.domain.model;

import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

public final class ReservationStatusCatalog {
    public static final String STATUS_PENDING = "pending";
    public static final String STATUS_CONFIRMED = "confirmed";
    public static final String STATUS_IN_PROGRESS = "in_progress";
    public static final String STATUS_COMPLETED = "completed";
    public static final String STATUS_CANCELLED = "cancelled";

    private static final Set<String> ALLOWED_SYSTEM_FILTER_STATUSES = Set.of(
            STATUS_PENDING,
            STATUS_CONFIRMED,
            STATUS_IN_PROGRESS,
            STATUS_COMPLETED,
            STATUS_CANCELLED
    );

    private static final Map<String, String> ADMIN_TO_SYSTEM_STATUS = Map.of(
            "pendiente", STATUS_PENDING,
            "confirmada", STATUS_CONFIRMED,
            "cancelada", STATUS_CANCELLED,
            "finalizada", STATUS_COMPLETED
    );

    private ReservationStatusCatalog() {
    }

    public static String normalizeStatusOrNull(String status) {
        if (status == null || status.isBlank()) {
            return null;
        }
        return status.trim().toLowerCase(Locale.ROOT);
    }

    public static boolean isAllowedSystemFilterStatus(String normalizedStatus) {
        return ALLOWED_SYSTEM_FILTER_STATUSES.contains(normalizedStatus);
    }

    public static Optional<String> mapAdminToSystem(String adminStatus) {
        String normalized = normalizeStatusOrNull(adminStatus);
        if (normalized == null) {
            return Optional.empty();
        }
        return Optional.ofNullable(ADMIN_TO_SYSTEM_STATUS.get(normalized));
    }
}

