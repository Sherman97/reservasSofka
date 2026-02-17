package com.reservas.sk.auth_service.domain.service;

import java.util.Locale;

public final class EmailNormalizer {
    private EmailNormalizer() {
    }

    public static String normalize(String email) {
        return String.valueOf(email).trim().toLowerCase(Locale.ROOT);
    }
}





