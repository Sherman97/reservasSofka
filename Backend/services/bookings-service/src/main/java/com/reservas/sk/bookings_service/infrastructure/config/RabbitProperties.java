package com.reservas.sk.bookings_service.infrastructure.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.rabbit")
public class RabbitProperties {
    private boolean enabled = false;
    private String exchange = "reservas.events";
    private String reservationCreatedRoutingKey = "bookings.reservation.created";
    private String reservationCancelledRoutingKey = "bookings.reservation.cancelled";

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public String getExchange() {
        return exchange;
    }

    public void setExchange(String exchange) {
        this.exchange = exchange;
    }

    public String getReservationCreatedRoutingKey() {
        return reservationCreatedRoutingKey;
    }

    public void setReservationCreatedRoutingKey(String reservationCreatedRoutingKey) {
        this.reservationCreatedRoutingKey = reservationCreatedRoutingKey;
    }

    public String getReservationCancelledRoutingKey() {
        return reservationCancelledRoutingKey;
    }

    public void setReservationCancelledRoutingKey(String reservationCancelledRoutingKey) {
        this.reservationCancelledRoutingKey = reservationCancelledRoutingKey;
    }
}




