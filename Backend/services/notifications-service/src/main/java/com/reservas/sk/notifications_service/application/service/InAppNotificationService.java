package com.reservas.sk.notifications_service.application.service;

import com.reservas.sk.notifications_service.domain.Reserva;
import com.reservas.sk.notifications_service.domain.ReservaRepository;
import com.reservas.sk.notifications_service.domain.NotificacionSender;
import org.slf4j.Logger;

public class InAppNotificationService {
    private final ReservaRepository reservaRepository;
    private final NotificacionSender notificacionSender;
    private final Logger logger;

    public InAppNotificationService(ReservaRepository reservaRepository, NotificacionSender notificacionSender, Logger logger) {
        this.reservaRepository = reservaRepository;
        this.notificacionSender = notificacionSender;
        this.logger = logger;
    }

    // Implementación completa del servicio de notificaciones in-app
    public void notificar15MinAntes(Reserva reserva) {
        if (esValidaParaNotificar(reserva, 15)) {
            enviarNotificacion(reserva, "Faltan 15 minutos para que finalice tu reserva de " + reserva.getNombreRecurso() + ". Fin: " + reserva.getFechaFin());
        }
    }

    public void notificar5MinAntes(Reserva reserva) {
        if (esValidaParaNotificar(reserva, 5)) {
            enviarNotificacion(reserva, "Faltan 5 minutos para que finalice tu reserva de " + reserva.getNombreRecurso() + ". Fin: " + reserva.getFechaFin());
        }
    }

    public void notificar10MinDespues(Reserva reserva) {
        if (reserva.isActiva() && !reserva.isEntregada() && !reserva.isModificada() &&
            estaEnHorarioLaboral(reserva.getFechaFin().plusMinutes(10))) {
            String tiempoExtra = calcularTiempoExtra(reserva.getFechaFin(), 10);
            enviarNotificacion(reserva, "Han pasado 10 minutos desde el fin de tu reserva de " + reserva.getNombreRecurso() + ". Tiempo extra: " + tiempoExtra);
        }
    }

    public void notificarIncluyeNombreYFechaYTiempoExtra(Reserva reserva) {
        String mensaje = "Reserva de " + reserva.getNombreRecurso() + ". Fin: " + reserva.getFechaFin();
        if (reserva.getFechaFin().isBefore(java.time.LocalDateTime.now())) {
            mensaje += ". Tiempo extra: " + calcularTiempoExtra(reserva.getFechaFin(), 0);
        }
        enviarNotificacion(reserva, mensaje);
    }

    public void reintentarYLoguearSiFalla(Reserva reserva) {
        int intentos = 0;
        boolean enviado = false;
        Exception lastEx = null;
        while (!enviado && intentos < 3) {
            try {
                notificacionSender.enviarNotificacion(reserva, "Mensaje de prueba");
                enviado = true;
            } catch (Exception ex) {
                lastEx = ex;
                logger.error("Error enviando notificación, intento " + (intentos+1), ex);
                intentos++;
            }
        }
        if (!enviado && lastEx != null) {
            logger.error("No se pudo enviar la notificación tras 3 intentos", lastEx);
        }
    }

    public void noNotificarSiCanceladaOModificada(Reserva reserva) {
        if (!reserva.isActiva() || reserva.isModificada()) {
            logger.info("Reserva cancelada o modificada, no se notifica");
            return;
        }
        enviarNotificacion(reserva, "Notificación válida");
    }

    public void notificarSoloEnHorarioLaboral(Reserva reserva) {
        if (estaEnHorarioLaboral(java.time.LocalDateTime.now())) {
            enviarNotificacion(reserva, "Notificación en horario laboral");
        } else {
            logger.info("Fuera de horario laboral, no se notifica");
        }
    }

    public void loguearCadaNotificacion(Reserva reserva) {
        enviarNotificacion(reserva, "Mensaje de log");
        logger.info("Notificación enviada para reserva " + reserva.getId());
    }

    // Métodos auxiliares
    private boolean esValidaParaNotificar(Reserva reserva, int minutosAntes) {
        if (!reserva.isActiva() || reserva.isModificada() || reserva.isEntregada()) return false;
        java.time.LocalDateTime ahora = java.time.LocalDateTime.now();
        java.time.LocalDateTime noti = reserva.getFechaFin().minusMinutes(minutosAntes);
        return ahora.isAfter(noti.minusSeconds(1)) && ahora.isBefore(noti.plusSeconds(60)) && estaEnHorarioLaboral(ahora);
    }

    private boolean estaEnHorarioLaboral(java.time.LocalDateTime fecha) {
        java.time.DayOfWeek dia = fecha.getDayOfWeek();
        int hora = fecha.getHour();
        return (dia.getValue() >= 1 && dia.getValue() <= 5) && (hora >= 8 && hora < 17);
    }

    private String calcularTiempoExtra(java.time.LocalDateTime fin, int minutosExtra) {
        java.time.Duration dur = java.time.Duration.between(fin, java.time.LocalDateTime.now().plusMinutes(minutosExtra));
        long min = dur.toMinutes();
        return min + " minutos";
    }

    private void enviarNotificacion(Reserva reserva, String mensaje) {
        try {
            notificacionSender.enviarNotificacion(reserva, mensaje);
            logger.info("Notificación enviada: " + mensaje);
        } catch (Exception ex) {
            logger.error("Error enviando notificación", ex);
        }
    }
}
