package com.reservas.sk.api_gateway.infrastructure.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "gateway.routes")
public class GatewayRoutesProperties {
    private String auth;
    private String bookings;
    private String inventory;
    private String locations;
    private String notifications;
    private String notificationsWs;

    public String getAuth() {
        return auth;
    }

    public void setAuth(String auth) {
        this.auth = auth;
    }

    public String getBookings() {
        return bookings;
    }

    public void setBookings(String bookings) {
        this.bookings = bookings;
    }

    public String getInventory() {
        return inventory;
    }

    public void setInventory(String inventory) {
        this.inventory = inventory;
    }

    public String getLocations() {
        return locations;
    }

    public void setLocations(String locations) {
        this.locations = locations;
    }

    public String getNotifications() {
        return notifications;
    }

    public void setNotifications(String notifications) {
        this.notifications = notifications;
    }

    public String getNotificationsWs() {
        return notificationsWs;
    }

    public void setNotificationsWs(String notificationsWs) {
        this.notificationsWs = notificationsWs;
    }
}


