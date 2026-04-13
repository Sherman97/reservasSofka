package com.reservas.sk.notifications_service.domain;

public interface NotificacionSender {
    void enviarNotificacion(Reserva reserva, String mensaje) throws Exception;
}

