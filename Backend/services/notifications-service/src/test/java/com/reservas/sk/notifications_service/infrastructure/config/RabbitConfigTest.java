package com.reservas.sk.notifications_service.infrastructure.config;

import org.junit.jupiter.api.Test;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class RabbitConfigTest {
    private static final String ASSERT_MSG = "PMD UnitTestAssertionsShouldIncludeMessage";

    private final RabbitConfig rabbitConfig = new RabbitConfig();

    @Test
    void createsExchangeQueueAndBindingsFilteringBlankRoutingKeys() {
        RabbitProperties properties = new RabbitProperties();
        properties.setExchange("reservas.events");
        properties.setQueue("notifications.events.q");
        properties.setRoutingKeys("bookings.reservation.created, ,bookings.reservation.cancelled,, ");

        TopicExchange exchange = rabbitConfig.notificationsExchange(properties);
        Queue queue = rabbitConfig.notificationsQueue(properties);
        List<Binding> bindings = rabbitConfig.notificationsBindings(queue, exchange, properties);

        assertEquals("reservas.events", exchange.getName(), ASSERT_MSG);
        assertEquals("notifications.events.q", queue.getName(), ASSERT_MSG);
        assertEquals(2, bindings.size(), ASSERT_MSG);
    }

    @Test
    void createsJacksonMessageConverter() {
        MessageConverter converter = rabbitConfig.rabbitMessageConverter();

        assertTrue(converter instanceof Jackson2JsonMessageConverter, ASSERT_MSG);
    }
}
