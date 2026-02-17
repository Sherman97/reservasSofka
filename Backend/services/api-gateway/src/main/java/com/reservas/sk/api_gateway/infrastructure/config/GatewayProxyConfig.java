package com.reservas.sk.api_gateway.infrastructure.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayProxyConfig {
    @Bean
    RouteLocator routeLocator(RouteLocatorBuilder builder, GatewayRoutesProperties routes) {
        String auth = sanitize(routes.getAuth());
        String bookings = sanitize(routes.getBookings());
        String inventory = sanitize(routes.getInventory());
        String locations = sanitize(routes.getLocations());
        String notifications = sanitize(routes.getNotifications());
        String notificationsWs = sanitize(routes.getNotificationsWs());

        return builder.routes()
                .route("notifications-ws", r -> r
                        .path("/notifications/ws", "/notifications/ws/**")
                        .and()
                        .header("Upgrade", "(?i)websocket")
                        .uri(notificationsWs))
                .route("auth-http", r -> r.path("/auth/**").uri(auth))
                .route("bookings-http", r -> r.path("/bookings/**").uri(bookings))
                .route("inventory-http", r -> r.path("/inventory/**").uri(inventory))
                .route("locations-http", r -> r.path("/locations/**").uri(locations))
                .route("notifications-http", r -> r.path("/notifications/**").uri(notifications))
                .build();
    }

    private String sanitize(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalStateException("Gateway route URL no configurada");
        }
        return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
    }
}


