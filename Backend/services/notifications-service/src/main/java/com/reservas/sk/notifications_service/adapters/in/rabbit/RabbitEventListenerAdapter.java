package com.reservas.sk.notifications_service.adapters.in.rabbit;

import com.reservas.sk.notifications_service.application.port.in.EventBroadcastUseCase;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.support.AmqpHeaders;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@ConditionalOnProperty(prefix = "app.rabbit", name = "enabled", havingValue = "true", matchIfMissing = true)
public class RabbitEventListenerAdapter {
    private final EventBroadcastUseCase eventBroadcastUseCase;

    public RabbitEventListenerAdapter(EventBroadcastUseCase eventBroadcastUseCase) {
        this.eventBroadcastUseCase = eventBroadcastUseCase;
    }

    @RabbitListener(queues = "${app.rabbit.queue}")
    public void onEvent(Map<String, Object> payload,
                        @Header(AmqpHeaders.RECEIVED_ROUTING_KEY) String routingKey) {
        eventBroadcastUseCase.broadcast(routingKey, payload);
    }
}






