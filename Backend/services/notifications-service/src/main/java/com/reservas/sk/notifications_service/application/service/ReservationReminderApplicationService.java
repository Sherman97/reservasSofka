package com.reservas.sk.notifications_service.application.service;

import com.reservas.sk.notifications_service.application.port.out.WebSocketBroadcastPort;
import com.reservas.sk.notifications_service.domain.model.NotificationEvent;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ReservationReminderApplicationService {
    private static final String CREATED = "bookings.reservation.created";
    private static final String CANCELLED = "bookings.reservation.cancelled";
    private static final String DELIVERED = "bookings.reservation.delivered";
    private static final String RETURNED = "bookings.reservation.returned";

    private final WebSocketBroadcastPort webSocketBroadcastPort;
    private final ConcurrentHashMap<Long, ReminderState> reminders = new ConcurrentHashMap<>();

    public ReservationReminderApplicationService(WebSocketBroadcastPort webSocketBroadcastPort) {
        this.webSocketBroadcastPort = webSocketBroadcastPort;
    }

    public void handleEvent(String routingKey, Map<String, Object> payload) {
        if (routingKey == null || payload == null || payload.isEmpty()) {
            return;
        }

        if (CANCELLED.equals(routingKey) || RETURNED.equals(routingKey)) {
            Long reservationId = toLong(payload.get("reservationId"));
            if (reservationId != null) {
                reminders.remove(reservationId);
            }
            return;
        }

        if (!CREATED.equals(routingKey) && !DELIVERED.equals(routingKey)) {
            return;
        }

        Long reservationId = toLong(payload.get("reservationId"));
        Long userId = toLong(payload.get("userId"));
        Long spaceId = toLong(payload.get("spaceId"));
        Instant endAt = toInstant(payload.get("endAt"));
        if (reservationId == null || userId == null || spaceId == null || endAt == null) {
            return;
        }

        reminders.compute(reservationId, (id, oldValue) -> {
            ReminderState state = oldValue == null ? new ReminderState() : oldValue;
            state.reservationId = reservationId;
            state.userId = userId;
            state.spaceId = spaceId;
            state.endAt = endAt;
            return state;
        });
    }

    @Scheduled(fixedDelayString = "${app.notifications.reminder-interval-ms:30000}")
    public void publishReminders() {
        Instant now = Instant.now();

        for (ReminderState state : reminders.values()) {
            if (state.endAt == null) {
                continue;
            }

            if (!state.notified15m && !now.isBefore(state.endAt.minus(15, ChronoUnit.MINUTES))) {
                publishReminder(state, "notifications.reservation.reminder.15m", 15, now);
                state.notified15m = true;
            }

            if (!state.notified5m && !now.isBefore(state.endAt.minus(5, ChronoUnit.MINUTES))) {
                publishReminder(state, "notifications.reservation.reminder.5m", 5, now);
                state.notified5m = true;
            }

            if (!state.notifiedOverdue10m && !now.isBefore(state.endAt.plus(10, ChronoUnit.MINUTES))) {
                publishOverdue(state, now);
                state.notifiedOverdue10m = true;
            }

            if (now.isAfter(state.endAt.plus(1, ChronoUnit.DAYS))) {
                reminders.remove(state.reservationId);
            }
        }
    }

    private void publishReminder(ReminderState state, String routingKey, int minutesLeft, Instant occurredAt) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("reservationId", state.reservationId);
        payload.put("userId", state.userId);
        payload.put("spaceId", state.spaceId);
        payload.put("endAt", state.endAt.toString());
        payload.put("minutesLeft", minutesLeft);
        payload.put("message", "Faltan " + minutesLeft + " minutos para finalizar o entregar la reserva.");

        webSocketBroadcastPort.publish(new NotificationEvent(
                routingKey,
                "notifications",
                payload,
                occurredAt
        ));
    }

    private void publishOverdue(ReminderState state, Instant occurredAt) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("reservationId", state.reservationId);
        payload.put("userId", state.userId);
        payload.put("spaceId", state.spaceId);
        payload.put("endAt", state.endAt.toString());
        payload.put("minutesOverdue", 10);
        payload.put("message", "Han pasado 10 minutos desde el fin de la reserva. Registra la entrega/devolucion.");

        webSocketBroadcastPort.publish(new NotificationEvent(
                "notifications.reservation.reminder.overdue.10m",
                "notifications",
                payload,
                occurredAt
        ));
    }

    private Long toLong(Object value) {
        if (value instanceof Number number) {
            return number.longValue();
        }
        if (value instanceof String str && !str.isBlank()) {
            try {
                return Long.parseLong(str);
            } catch (NumberFormatException ignored) {
                return null;
            }
        }
        return null;
    }

    private Instant toInstant(Object value) {
        if (value instanceof String str && !str.isBlank()) {
            try {
                return Instant.parse(str);
            } catch (Exception ignored) {
                return null;
            }
        }
        return null;
    }

    private static final class ReminderState {
        private Long reservationId;
        private Long userId;
        private Long spaceId;
        private Instant endAt;
        private boolean notified15m;
        private boolean notified5m;
        private boolean notifiedOverdue10m;
    }
}

