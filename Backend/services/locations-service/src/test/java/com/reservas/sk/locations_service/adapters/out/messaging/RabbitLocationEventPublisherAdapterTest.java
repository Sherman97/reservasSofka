package com.reservas.sk.locations_service.adapters.out.messaging;

import com.reservas.sk.locations_service.application.usecase.CityCreatedEvent;
import com.reservas.sk.locations_service.application.usecase.CityDeletedEvent;
import com.reservas.sk.locations_service.application.usecase.CityUpdatedEvent;
import com.reservas.sk.locations_service.application.usecase.SpaceCreatedEvent;
import com.reservas.sk.locations_service.application.usecase.SpaceDeletedEvent;
import com.reservas.sk.locations_service.application.usecase.SpaceUpdatedEvent;
import com.reservas.sk.locations_service.infrastructure.config.RabbitProperties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

import java.time.Instant;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

class RabbitLocationEventPublisherAdapterTest {
    private static final String EXCHANGE = "reservas.events";

    private RabbitTemplate rabbitTemplate;
    private RabbitLocationEventPublisherAdapter adapter;

    @BeforeEach
    void setUp() {
        rabbitTemplate = mock(RabbitTemplate.class);

        RabbitProperties properties = new RabbitProperties();
        properties.setExchange(EXCHANGE);
        properties.setCityCreatedRoutingKey("locations.city.created");
        properties.setCityUpdatedRoutingKey("locations.city.updated");
        properties.setCityDeletedRoutingKey("locations.city.deleted");
        properties.setSpaceCreatedRoutingKey("locations.space.created");
        properties.setSpaceUpdatedRoutingKey("locations.space.updated");
        properties.setSpaceDeletedRoutingKey("locations.space.deleted");

        adapter = new RabbitLocationEventPublisherAdapter(rabbitTemplate, properties);
    }

    @Test
    void publishesCityEventsWithConfiguredRoutingKeys() {
        CityCreatedEvent cityCreated = new CityCreatedEvent(1L, "Bogota", "Colombia", Instant.now());
        CityUpdatedEvent cityUpdated = new CityUpdatedEvent(1L, "Bogota D.C.", "Colombia", Instant.now());
        CityDeletedEvent cityDeleted = new CityDeletedEvent(1L, Instant.now());

        adapter.publishCityCreated(cityCreated);
        adapter.publishCityUpdated(cityUpdated);
        adapter.publishCityDeleted(cityDeleted);

        verify(rabbitTemplate).convertAndSend(EXCHANGE, "locations.city.created", cityCreated);
        verify(rabbitTemplate).convertAndSend(EXCHANGE, "locations.city.updated", cityUpdated);
        verify(rabbitTemplate).convertAndSend(EXCHANGE, "locations.city.deleted", cityDeleted);
    }

    @Test
    void publishesSpaceEventsWithConfiguredRoutingKeys() {
        SpaceCreatedEvent spaceCreated = new SpaceCreatedEvent(10L, 1L, "Sala A", true, Instant.now());
        SpaceUpdatedEvent spaceUpdated = new SpaceUpdatedEvent(10L, 1L, "Sala B", false, Instant.now());
        SpaceDeletedEvent spaceDeleted = new SpaceDeletedEvent(10L, 1L, Instant.now());

        adapter.publishSpaceCreated(spaceCreated);
        adapter.publishSpaceUpdated(spaceUpdated);
        adapter.publishSpaceDeleted(spaceDeleted);

        verify(rabbitTemplate).convertAndSend(EXCHANGE, "locations.space.created", spaceCreated);
        verify(rabbitTemplate).convertAndSend(EXCHANGE, "locations.space.updated", spaceUpdated);
        verify(rabbitTemplate).convertAndSend(EXCHANGE, "locations.space.deleted", spaceDeleted);
    }
}



