package com.reservas.sk.locations_service.adapters.out.messaging;

import com.reservas.sk.locations_service.application.port.out.LocationEventPublisherPort;
import com.reservas.sk.locations_service.application.usecase.CityCreatedEvent;
import com.reservas.sk.locations_service.application.usecase.CityDeletedEvent;
import com.reservas.sk.locations_service.application.usecase.CityUpdatedEvent;
import com.reservas.sk.locations_service.application.usecase.SpaceCreatedEvent;
import com.reservas.sk.locations_service.application.usecase.SpaceDeletedEvent;
import com.reservas.sk.locations_service.application.usecase.SpaceUpdatedEvent;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnMissingBean(LocationEventPublisherPort.class)
public class NoOpLocationEventPublisherAdapter implements LocationEventPublisherPort {
    @Override
    public void publishCityCreated(CityCreatedEvent event) {
        // RabbitMQ disabled.
    }

    @Override
    public void publishCityUpdated(CityUpdatedEvent event) {
        // RabbitMQ disabled.
    }

    @Override
    public void publishCityDeleted(CityDeletedEvent event) {
        // RabbitMQ disabled.
    }

    @Override
    public void publishSpaceCreated(SpaceCreatedEvent event) {
        // RabbitMQ disabled.
    }

    @Override
    public void publishSpaceUpdated(SpaceUpdatedEvent event) {
        // RabbitMQ disabled.
    }

    @Override
    public void publishSpaceDeleted(SpaceDeletedEvent event) {
        // RabbitMQ disabled.
    }
}




