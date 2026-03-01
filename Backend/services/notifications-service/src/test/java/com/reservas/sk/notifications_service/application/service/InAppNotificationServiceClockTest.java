package com.reservas.sk.notifications_service.application.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class InAppNotificationServiceClockTest {
    private Clock clockMock;
    private InAppNotificationService inAppNotificationService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        clockMock = mock(Clock.class);
    }

    @Test
    void notificaSoloEnHorarioLaboral_dentro() {
        // Mock Clock para retornar las 10:00 AM (dentro de horario laboral)
        Instant instant = LocalDateTime.of(2026, 3, 1, 10, 0, 0).atZone(ZoneId.of("America/Bogota")).toInstant();
        when(clockMock.instant()).thenReturn(instant);
        when(clockMock.getZone()).thenReturn(ZoneId.of("America/Bogota"));

        // Inyecto el clock mockeado
        inAppNotificationService = new InAppNotificationService(clockMock);

        // Simulo que notificar retorna true (está dentro de horario laboral)
        assertTrue(inAppNotificationService.esEnHorarioLaboral());
    }

    @Test
    void notificaSoloEnHorarioLaboral_fuera() {
        // Mock Clock para retornar las 6:00 PM (fuera de horario laboral: después de las 5:00 PM)
        Instant instant = LocalDateTime.of(2026, 3, 1, 18, 0, 0).atZone(ZoneId.of("America/Bogota")).toInstant();
        when(clockMock.instant()).thenReturn(instant);
        when(clockMock.getZone()).thenReturn(ZoneId.of("America/Bogota"));

        inAppNotificationService = new InAppNotificationService(clockMock);

        // Simulo que notificar retorna false (está fuera de horario laboral)
        assertFalse(inAppNotificationService.esEnHorarioLaboral());
    }

    @Test
    void notificaSoloEnHorarioLaboral_finesDeSemana() {
        // Mock Clock para retornar un sábado (fuera de horario laboral)
        Instant instant = LocalDateTime.of(2026, 3, 7, 10, 0, 0).atZone(ZoneId.of("America/Bogota")).toInstant(); // Sábado
        when(clockMock.instant()).thenReturn(instant);
        when(clockMock.getZone()).thenReturn(ZoneId.of("America/Bogota"));

        inAppNotificationService = new InAppNotificationService(clockMock);

        // No notifica en fin de semana
        assertFalse(inAppNotificationService.esEnHorarioLaboral());
    }
}

