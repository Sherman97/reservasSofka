package com.reservas.sk.api_gateway.infrastructure.config;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cloud.gateway.route.Route;
import org.springframework.cloud.gateway.route.RouteLocator;

import java.net.URI;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(properties = {
        "gateway.routes.auth=http://auth-service:3001",
        "gateway.routes.bookings=http://bookings-service:3003",
        "gateway.routes.inventory=http://inventory-service:3005",
        "gateway.routes.locations=http://locations-service:3004",
        "gateway.routes.notifications=http://notifications-service:3006",
        "gateway.routes.notifications-ws=ws://notifications-service:3006"
})
class GatewayProxyConfigTest {

    @Autowired
    private RouteLocator routeLocator;

    @Test
    void routeLocator_configuresPublicAndProtectedRoutes() {
        List<Route> configuredRoutes = routeLocator.getRoutes().collectList().block();

        assertNotNull(configuredRoutes);
        assertEquals(6, configuredRoutes.size());

        assertRoute(configuredRoutes, "auth-http", URI.create("http://auth-service:3001"));
        assertRoute(configuredRoutes, "bookings-http", URI.create("http://bookings-service:3003"));
        assertRoute(configuredRoutes, "inventory-http", URI.create("http://inventory-service:3005"));
        assertRoute(configuredRoutes, "locations-http", URI.create("http://locations-service:3004"));
        assertRoute(configuredRoutes, "notifications-http", URI.create("http://notifications-service:3006"));
        assertRoute(configuredRoutes, "notifications-ws", URI.create("ws://notifications-service:3006"));
    }

    private void assertRoute(List<Route> routes, String routeId, URI expectedUri) {
        Route route = routes.stream()
                .filter(r -> r.getId().equals(routeId))
                .findFirst()
                .orElseThrow(() -> new AssertionError("No se encontro ruta: " + routeId));
        assertEquals(expectedUri, route.getUri());
    }
}
