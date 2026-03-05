package com.reservas.sk.locations_service.adapters.out.messaging;

import com.reservas.sk.locations_service.application.usecase.CityCreatedEvent;
import com.reservas.sk.locations_service.application.usecase.CityDeletedEvent;
import com.reservas.sk.locations_service.application.usecase.CityUpdatedEvent;
import com.reservas.sk.locations_service.application.usecase.SpaceCreatedEvent;
import com.reservas.sk.locations_service.application.usecase.SpaceDeletedEvent;
import com.reservas.sk.locations_service.application.usecase.SpaceUpdatedEvent;
import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

class NoOpLocationEventPublisherAdapterTest {

    @Test
    void cityNoOpMethodsDoNotThrow() {
        NoOpLocationEventPublisherAdapter adapter = new NoOpLocationEventPublisherAdapter();

        assertDoesNotThrow(() -> adapter.publishCityCreated(new CityCreatedEvent(1L, "Bogota", "Colombia", Instant.now())));
        assertDoesNotThrow(() -> adapter.publishCityUpdated(new CityUpdatedEvent(1L, "Bogota D.C.", "Colombia", Instant.now())));
        assertDoesNotThrow(() -> adapter.publishCityDeleted(new CityDeletedEvent(1L, Instant.now())));
    }

    @Test
    void spaceNoOpMethodsDoNotThrow() {
        NoOpLocationEventPublisherAdapter adapter = new NoOpLocationEventPublisherAdapter();

        assertDoesNotThrow(() -> adapter.publishSpaceCreated(new SpaceCreatedEvent(10L, 1L, "Sala", true, Instant.now())));
        assertDoesNotThrow(() -> adapter.publishSpaceUpdated(new SpaceUpdatedEvent(10L, 1L, "Sala 2", false, Instant.now())));
        assertDoesNotThrow(() -> adapter.publishSpaceDeleted(new SpaceDeletedEvent(10L, 1L, Instant.now())));
    }
}
