package com.reservas.sk.notifications_service.infrastructure.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.annotation.EnableRabbit;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableRabbit
@ConditionalOnProperty(prefix = "app.rabbit", name = "enabled", havingValue = "true", matchIfMissing = true)
public class RabbitConfig {
    @Bean
    TopicExchange notificationsExchange(RabbitProperties properties) {
        return new TopicExchange(properties.getExchange(), true, false);
    }

    @Bean
    Queue notificationsQueue(RabbitProperties properties) {
        return new Queue(properties.getQueue(), true);
    }

    @Bean
    List<Binding> notificationsBindings(Queue notificationsQueue,
                                        TopicExchange notificationsExchange,
                                        RabbitProperties properties) {
        return Arrays.stream(properties.getRoutingKeys().split(","))
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .map(key -> BindingBuilder.bind(notificationsQueue).to(notificationsExchange).with(key))
                .toList();
    }

    @Bean
    MessageConverter rabbitMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}






