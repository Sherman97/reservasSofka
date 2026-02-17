package com.reservas.sk.bookings_service.adapters.out.messaging;

import com.reservas.sk.bookings_service.application.port.out.ReservationEventPublisherPort;
import com.reservas.sk.bookings_service.application.usecase.ReservationCancelledEvent;
import com.reservas.sk.bookings_service.application.usecase.ReservationCreatedEvent;
import com.reservas.sk.bookings_service.infrastructure.config.RabbitProperties;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(prefix = "app.rabbit", name = "enabled", havingValue = "true")
public class RabbitReservationEventPublisherAdapter implements ReservationEventPublisherPort {
    private final RabbitTemplate rabbitTemplate;
    private final RabbitProperties rabbitProperties;

    public RabbitReservationEventPublisherAdapter(RabbitTemplate rabbitTemplate, RabbitProperties rabbitProperties) {
        this.rabbitTemplate = rabbitTemplate;
        this.rabbitProperties = rabbitProperties;
    }

    @Override
    public void publishReservationCreated(ReservationCreatedEvent event) {
        rabbitTemplate.convertAndSend(
                rabbitProperties.getExchange(),
                rabbitProperties.getReservationCreatedRoutingKey(),
                event
        );
    }

    @Override
    public void publishReservationCancelled(ReservationCancelledEvent event) {
        rabbitTemplate.convertAndSend(
                rabbitProperties.getExchange(),
                rabbitProperties.getReservationCancelledRoutingKey(),
                event
        );
    }
}




