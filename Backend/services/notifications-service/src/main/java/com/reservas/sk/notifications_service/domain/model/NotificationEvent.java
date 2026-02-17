package com.reservas.sk.notifications_service.domain.model;

import java.time.Instant;
import java.util.Map;

public record NotificationEvent(String routingKey,
                                String channel,
                                Map<String, Object> payload,
                                Instant occurredAt) {
}






