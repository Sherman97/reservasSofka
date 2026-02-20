package com.reservas.sk.locations_service.adapters.out.messaging;

import com.reservas.sk.locations_service.application.port.out.LocationEventPublisherPort;
import com.reservas.sk.locations_service.application.usecase.CityCreatedEvent;
import com.reservas.sk.locations_service.application.usecase.CityDeletedEvent;
import com.reservas.sk.locations_service.application.usecase.CityUpdatedEvent;
import com.reservas.sk.locations_service.application.usecase.SpaceCreatedEvent;
import com.reservas.sk.locations_service.application.usecase.SpaceDeletedEvent;
import com.reservas.sk.locations_service.application.usecase.SpaceUpdatedEvent;
import com.reservas.sk.locations_service.infrastructure.config.RabbitProperties;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(prefix = "app.rabbit", name = "enabled", havingValue = "true")
public class RabbitLocationEventPublisherAdapter implements LocationEventPublisherPort {
    private final RabbitTemplate rabbitTemplate;
    private final RabbitProperties rabbitProperties;

    public RabbitLocationEventPublisherAdapter(RabbitTemplate rabbitTemplate, RabbitProperties rabbitProperties) {
        this.rabbitTemplate = rabbitTemplate;
        this.rabbitProperties = rabbitProperties;
    }

    @Override
    public void publishCityCreated(CityCreatedEvent event) {
        rabbitTemplate.convertAndSend(rabbitProperties.getExchange(), rabbitProperties.getCityCreatedRoutingKey(), event);
    }

    @Override
    public void publishCityUpdated(CityUpdatedEvent event) {
        rabbitTemplate.convertAndSend(rabbitProperties.getExchange(), rabbitProperties.getCityUpdatedRoutingKey(), event);
    }

    @Override
    public void publishCityDeleted(CityDeletedEvent event) {
        rabbitTemplate.convertAndSend(rabbitProperties.getExchange(), rabbitProperties.getCityDeletedRoutingKey(), event);
    }

    @Override
    public void publishSpaceCreated(SpaceCreatedEvent event) {
        rabbitTemplate.convertAndSend(rabbitProperties.getExchange(), rabbitProperties.getSpaceCreatedRoutingKey(), event);
    }

    @Override
    public void publishSpaceUpdated(SpaceUpdatedEvent event) {
        rabbitTemplate.convertAndSend(rabbitProperties.getExchange(), rabbitProperties.getSpaceUpdatedRoutingKey(), event);
    }

    @Override
    public void publishSpaceDeleted(SpaceDeletedEvent event) {
        rabbitTemplate.convertAndSend(rabbitProperties.getExchange(), rabbitProperties.getSpaceDeletedRoutingKey(), event);
    }
}




