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

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.atMostOnce;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

class InAppNotificationServiceTest {
    private static final String ASSERT_MSG = "PMD UnitTestAssertionsShouldIncludeMessage";
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
    void noNotifica15MinAntesSiReservaNoEsValida() throws Exception {
        LocalDateTime fin = LocalDateTime.now(clock).plusMinutes(15);
        Reserva inactiva = new Reserva(10L, "Sala X", fin, false, false, false);
        Reserva modificada = new Reserva(11L, "Sala Y", fin, true, false, true);
        Reserva entregada = new Reserva(12L, "Sala Z", fin, true, true, false);

        inAppNotificationService.notificar15MinAntes(inactiva);
        inAppNotificationService.notificar15MinAntes(modificada);
        inAppNotificationService.notificar15MinAntes(entregada);

        verify(notificacionSender, never()).enviarNotificacion(any(), any());
    }

    @Test
    void noNotifica5MinAntesSiEstaFueraDeVentana() throws Exception {
        LocalDateTime finFueraRango = LocalDateTime.now(clock).plusMinutes(8);
        Reserva reserva = new Reserva(13L, "Sala R", finFueraRango, true, false, false);

        inAppNotificationService.notificar5MinAntes(reserva);

        verify(notificacionSender, never()).enviarNotificacion(any(), any());
    }

    @Test
    void notificacionIncluyeNombreYFechaYTiempoExtraSiAplica() throws Exception {
        LocalDateTime fin = LocalDateTime.now(clock).minusMinutes(7);
        Reserva reserva = new Reserva(4L, "Sala D", fin, true, false, false);
        inAppNotificationService.notificarIncluyeNombreYFechaYTiempoExtra(reserva);
        ArgumentCaptor<String> captor = ArgumentCaptor.forClass(String.class);
        verify(notificacionSender).enviarNotificacion(eq(reserva), captor.capture());
        String msg = captor.getValue();
        assertTrue(msg.contains("Sala D"), ASSERT_MSG);
        assertTrue(msg.contains("Fin:"), ASSERT_MSG);
        assertTrue(msg.contains("Tiempo extra"), ASSERT_MSG);
    }

    @Test
    void notificacionNoIncluyeTiempoExtraSiReservaNoHaFinalizado() throws Exception {
        LocalDateTime fin = LocalDateTime.now(clock).plusMinutes(20);
        Reserva reserva = new Reserva(14L, "Sala Futuro", fin, true, false, false);

        inAppNotificationService.notificarIncluyeNombreYFechaYTiempoExtra(reserva);

        ArgumentCaptor<String> captor = ArgumentCaptor.forClass(String.class);
        verify(notificacionSender).enviarNotificacion(eq(reserva), captor.capture());
        assertFalse(captor.getValue().contains("Tiempo extra"), ASSERT_MSG);
    }

    @Test
    void reintentaYLogueaSiFallaEnvio() throws Exception {
        LocalDateTime fin = LocalDateTime.now(clock).plusMinutes(15);
        Reserva reserva = new Reserva(5L, "Sala E", fin, true, false, false);
        doThrow(new RuntimeException("fallo")).when(notificacionSender).enviarNotificacion(any(), any());
        inAppNotificationService.reintentarYLoguearSiFalla(reserva);
        verify(notificacionSender, times(3)).enviarNotificacion(any(), any());
    }

    @Test
    void reintentoSeDetieneCuandoLograEnviar() throws Exception {
        reset(notificacionSender);
        LocalDateTime fin = LocalDateTime.now(clock).plusMinutes(15);
        Reserva reserva = new Reserva(15L, "Sala Retry", fin, true, false, false);
        doThrow(new RuntimeException("fallo 1"))
                .doNothing()
                .when(notificacionSender).enviarNotificacion(any(), any());

        inAppNotificationService.reintentarYLoguearSiFalla(reserva);

        verify(notificacionSender, times(2)).enviarNotificacion(any(), any());
    }

    @Test
    void noNotificaSiReservaCanceladaOModificada() throws Exception {
        LocalDateTime fin = LocalDateTime.now(clock).plusMinutes(15);
        Reserva cancelada = new Reserva(6L, "Sala F", fin, false, false, false);
        Reserva modificada = new Reserva(7L, "Sala G", fin, true, false, true);
        inAppNotificationService.noNotificarSiCanceladaOModificada(cancelada);
        inAppNotificationService.noNotificarSiCanceladaOModificada(modificada);
        verify(notificacionSender, never()).enviarNotificacion(any(), any());
    }

    @Test
    void soloNotificaEnHorarioLaboral_deterministaConClock() throws Exception {
        Reserva reserva = new Reserva(8L, "Sala H", LocalDateTime.now(clock), true, false, false);
        inAppNotificationService.notificarSoloEnHorarioLaboral(reserva);
        verify(notificacionSender, times(1)).enviarNotificacion(eq(reserva), contains("horario laboral"));
    }

    @Test
    void noNotificaFueraDeHorarioLaboral() throws Exception {
        Clock offHours = Clock.fixed(Instant.parse("2026-03-01T02:00:00Z"), ZoneOffset.UTC);
        InAppNotificationService serviceOffHours =
                new InAppNotificationService(reservaRepository, notificacionSender, logger, offHours);
        Reserva reserva = new Reserva(16L, "Sala Off", LocalDateTime.now(offHours), true, false, false);

        serviceOffHours.notificarSoloEnHorarioLaboral(reserva);

        verify(notificacionSender, never()).enviarNotificacion(any(), any());
    }

    @Test
    void enviarNotificacionRegistraErrorCuandoSenderFalla() throws Exception {
        LocalDateTime fin = LocalDateTime.now(clock).plusMinutes(15);
        Reserva reserva = new Reserva(17L, "Sala Error", fin, true, false, false);
        doThrow(new RuntimeException("envio fallido")).when(notificacionSender).enviarNotificacion(any(), any());

        inAppNotificationService.notificar15MinAntes(reserva);

        verify(notificacionSender, times(1)).enviarNotificacion(any(), any());
    }

    @Test
    void logueaCadaNotificacionEnviada() throws Exception {
        LocalDateTime fin = LocalDateTime.now(clock).plusMinutes(15);
        Reserva reserva = new Reserva(9L, "Sala I", fin, true, false, false);
        inAppNotificationService.loguearCadaNotificacion(reserva);
        verify(notificacionSender, times(1)).enviarNotificacion(eq(reserva), contains("Mensaje de log"));
    }
}



