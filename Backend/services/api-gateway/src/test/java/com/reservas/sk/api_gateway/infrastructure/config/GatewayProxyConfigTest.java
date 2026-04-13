package com.reservas.sk.api_gateway.infrastructure.config;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cloud.gateway.route.Route;
import org.springframework.cloud.gateway.route.RouteLocator;

import java.net.URI;
import java.util.List;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertAll;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@Tag("integration")
@SpringBootTest(properties = {
        "gateway.routes.auth=http://auth-service:3001",
        "gateway.routes.bookings=http://bookings-service:3003",
        "gateway.routes.inventory=http://inventory-service:3005",
        "gateway.routes.locations=http://locations-service:3004",
        "gateway.routes.notifications=http://notifications-service:3006",
        "gateway.routes.notifications-ws=ws://notifications-service:3006"
})
class GatewayProxyConfigTest {
    private static final String ASSERT_MSG = "PMD UnitTestAssertionsShouldIncludeMessage";

    @Autowired
    private RouteLocator routeLocator;

    @Test
    void routeLocator_configuresExpectedRoutesCount() {
        List<Route> configuredRoutes = routeLocator.getRoutes().collectList().block();

        assertAll(
                () -> assertNotNull(configuredRoutes, ASSERT_MSG),
                () -> assertEquals(6, configuredRoutes.size(), ASSERT_MSG)
        );
    }

    @ParameterizedTest
    @MethodSource("expectedRoutes")
    void routeLocator_configuresEachExpectedRoute(String routeId, URI expectedUri) {
        List<Route> configuredRoutes = routeLocator.getRoutes().collectList().block();

        assertNotNull(configuredRoutes, ASSERT_MSG);
        verifyRoute(configuredRoutes, routeId, expectedUri);
    }

    private void verifyRoute(List<Route> routes, String routeId, URI expectedUri) {
        Route route = routes.stream()
                .filter(r -> r.getId().equals(routeId))
                .findFirst()
                .orElseThrow(() -> new AssertionError("No se encontro ruta: " + routeId));
        assertEquals(expectedUri, route.getUri(), ASSERT_MSG);
    }

    private static Stream<org.junit.jupiter.params.provider.Arguments> expectedRoutes() {
        return Stream.of(
                org.junit.jupiter.params.provider.Arguments.of("auth-http", URI.create("http://auth-service:3001")),
                org.junit.jupiter.params.provider.Arguments.of("bookings-http", URI.create("http://bookings-service:3003")),
                org.junit.jupiter.params.provider.Arguments.of("inventory-http", URI.create("http://inventory-service:3005")),
                org.junit.jupiter.params.provider.Arguments.of("locations-http", URI.create("http://locations-service:3004")),
                org.junit.jupiter.params.provider.Arguments.of("notifications-http", URI.create("http://notifications-service:3006")),
                org.junit.jupiter.params.provider.Arguments.of("notifications-ws", URI.create("ws://notifications-service:3006"))
        );
    }
}

