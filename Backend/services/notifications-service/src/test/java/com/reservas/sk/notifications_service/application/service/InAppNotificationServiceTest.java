package com.reservas.sk.notifications_service.application.service;

import com.reservas.sk.notifications_service.domain.Reserva;
import com.reservas.sk.notifications_service.domain.ReservaRepository;
import com.reservas.sk.notifications_service.domain.NotificacionSender;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.slf4j.Logger;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class InAppNotificationServiceTest {
    @Mock
    private ReservaRepository reservaRepository;
    @Mock
    private NotificacionSender notificacionSender;
    @Mock
    private Logger logger;
    private InAppNotificationService inAppNotificationService;
    private Clock clock;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        clock = Clock.fixed(Instant.parse("2026-03-02T15:00:00Z"), ZoneOffset.UTC);
        inAppNotificationService = new InAppNotificationService(reservaRepository, notificacionSender, logger, clock);
    }

    @Test
    void notificaUsuario15MinAntesDeFinalizarReserva() throws Exception {
        LocalDateTime fin = LocalDateTime.now(clock).plusMinutes(15);
        Reserva reserva = new Reserva(1L, "Sala A", fin, true, false, false);
        inAppNotificationService.notificar15MinAntes(reserva);
        verify(notificacionSender, atMostOnce()).enviarNotificacion(eq(reserva), contains("Faltan 15 minutos"));
    }

    @Test
    void notificaUsuario5MinAntesDeFinalizarReserva() throws Exception {
        LocalDateTime fin = LocalDateTime.now(clock).plusMinutes(5);
        Reserva reserva = new Reserva(2L, "Sala B", fin, true, false, false);
        inAppNotificationService.notificar5MinAntes(reserva);
        verify(notificacionSender, atMostOnce()).enviarNotificacion(eq(reserva), contains("Faltan 5 minutos"));
    }

    @Test
    void notificaUsuario10MinDespuesSiNoEntrega() throws Exception {
        LocalDateTime fin = LocalDateTime.now(clock).minusMinutes(10);
        Reserva reserva = new Reserva(3L, "Sala C", fin, true, false, false);
        inAppNotificationService.notificar10MinDespues(reserva);
        verify(notificacionSender, atMostOnce()).enviarNotificacion(eq(reserva), contains("10 minutos"));
    }

    @Test
    void notificacionIncluyeNombreYFechaYTiempoExtraSiAplica() throws Exception {
        LocalDateTime fin = LocalDateTime.now(clock).minusMinutes(7);
        Reserva reserva = new Reserva(4L, "Sala D", fin, true, false, false);
        inAppNotificationService.notificarIncluyeNombreYFechaYTiempoExtra(reserva);
        ArgumentCaptor<String> captor = ArgumentCaptor.forClass(String.class);
        verify(notificacionSender).enviarNotificacion(eq(reserva), captor.capture());
        String msg = captor.getValue();
        assertTrue(msg.contains("Sala D"));
        assertTrue(msg.contains("Fin:"));
        assertTrue(msg.contains("Tiempo extra"));
    }

    @Test
    void reintentaYLogueaSiFallaEnvio() throws Exception {
        LocalDateTime fin = LocalDateTime.now(clock).plusMinutes(15);
        Reserva reserva = new Reserva(5L, "Sala E", fin, true, false, false);
        doThrow(new RuntimeException("fallo")).when(notificacionSender).enviarNotificacion(any(), any());
        inAppNotificationService.reintentarYLoguearSiFalla(reserva);
        verify(notificacionSender, times(3)).enviarNotificacion(any(), any());
        verify(logger, atLeastOnce()).error(contains("Error enviando notificación"), any(Throwable.class));
    }

    @Test
    void noNotificaSiReservaCanceladaOModificada() throws Exception {
        LocalDateTime fin = LocalDateTime.now(clock).plusMinutes(15);
        Reserva cancelada = new Reserva(6L, "Sala F", fin, false, false, false);
        Reserva modificada = new Reserva(7L, "Sala G", fin, true, false, true);
        inAppNotificationService.noNotificarSiCanceladaOModificada(cancelada);
        inAppNotificationService.noNotificarSiCanceladaOModificada(modificada);
        verify(notificacionSender, never()).enviarNotificacion(any(), any());
        verify(logger, atLeastOnce()).info(contains("no se notifica"));
    }

    @Test
    void soloNotificaEnHorarioLaboral_deterministaConClock() throws Exception {
        Reserva reserva = new Reserva(8L, "Sala H", LocalDateTime.now(clock), true, false, false);
        inAppNotificationService.notificarSoloEnHorarioLaboral(reserva);
        verify(notificacionSender, times(1)).enviarNotificacion(eq(reserva), contains("horario laboral"));
    }

    @Test
    void logueaCadaNotificacionEnviada() {
        LocalDateTime fin = LocalDateTime.now(clock).plusMinutes(15);
        Reserva reserva = new Reserva(9L, "Sala I", fin, true, false, false);
        inAppNotificationService.loguearCadaNotificacion(reserva);
        verify(logger, atLeastOnce()).info(contains("Notificación enviada"));
    }
}
