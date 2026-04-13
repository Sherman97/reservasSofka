package com.reservas.sk.bookings_service.infrastructure.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.rabbit")
public class RabbitProperties {
    private boolean enabled;
    private String exchange = "reservas.events";
    private String reservationCreatedRoutingKey = "bookings.reservation.created";
    private String reservationCancelledRoutingKey = "bookings.reservation.cancelled";
    private String reservationDeliveredRoutingKey = "bookings.reservation.delivered";
    private String reservationReturnedRoutingKey = "bookings.reservation.returned";
    private String reservationCheckedInRoutingKey = "bookings.reservation.checkedin";
    private String reservationNoShowRoutingKey = "bookings.reservation.noshow";

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

    public String getReservationDeliveredRoutingKey() {
        return reservationDeliveredRoutingKey;
    }

    public void setReservationDeliveredRoutingKey(String reservationDeliveredRoutingKey) {
        this.reservationDeliveredRoutingKey = reservationDeliveredRoutingKey;
    }

    public String getReservationReturnedRoutingKey() {
        return reservationReturnedRoutingKey;
    }

    public void setReservationReturnedRoutingKey(String reservationReturnedRoutingKey) {
        this.reservationReturnedRoutingKey = reservationReturnedRoutingKey;
    }

    public String getReservationCheckedInRoutingKey() {
        return reservationCheckedInRoutingKey;
    }

    public void setReservationCheckedInRoutingKey(String reservationCheckedInRoutingKey) {
        this.reservationCheckedInRoutingKey = reservationCheckedInRoutingKey;
    }

    public String getReservationNoShowRoutingKey() {
        return reservationNoShowRoutingKey;
    }

    public void setReservationNoShowRoutingKey(String reservationNoShowRoutingKey) {
        this.reservationNoShowRoutingKey = reservationNoShowRoutingKey;
    }
}




