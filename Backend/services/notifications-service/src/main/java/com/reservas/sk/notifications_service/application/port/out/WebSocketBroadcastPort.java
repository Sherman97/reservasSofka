package com.reservas.sk.notifications_service.application.port.out;

import com.reservas.sk.notifications_service.domain.model.NotificationEvent;

public interface WebSocketBroadcastPort {
    void publish(NotificationEvent event);
}






