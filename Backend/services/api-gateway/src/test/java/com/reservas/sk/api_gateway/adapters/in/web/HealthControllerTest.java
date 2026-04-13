package com.reservas.sk.api_gateway.adapters.in.web;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.reactive.server.WebTestClient;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@Tag("integration")
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureWebTestClient
class HealthControllerTest {
    private static final String ASSERT_MSG = "PMD UnitTestAssertionsShouldIncludeMessage";

    @Autowired
    private WebTestClient webTestClient;

    @Test
    void healthEndpoint_returns200() {
        var result = webTestClient.get()
                .uri("/health")
                .exchange()
                .expectStatus().isOk()
                .expectBody(Map.class)
                .returnResult();

        @SuppressWarnings("unchecked")
        Map<String, Object> body = result.getResponseBody();
        assertNotNull(body, ASSERT_MSG);
        assertEquals(true, body.get("ok"), ASSERT_MSG);
        assertEquals("gateway", body.get("service"), ASSERT_MSG);
    }
}
