package com.reservas.sk.locations_service;

import com.reservas.sk.locations_service.application.port.out.LocationEventPublisherPort;
import com.reservas.sk.locations_service.application.port.out.LocationsPersistencePort;
import com.reservas.sk.locations_service.application.usecase.CityCreatedEvent;
import com.reservas.sk.locations_service.application.usecase.CityDeletedEvent;
import com.reservas.sk.locations_service.application.usecase.CityUpdatedEvent;
import com.reservas.sk.locations_service.application.usecase.SpaceCreatedEvent;
import com.reservas.sk.locations_service.application.usecase.SpaceDeletedEvent;
import com.reservas.sk.locations_service.application.usecase.SpaceUpdatedEvent;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Bean;

@Tag("integration")
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:locations_ctx;MODE=MySQL;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "app.jwt.secret=test-secret-key-for-locations-service-1234567890-abcdef"
})
class LocationsServiceApplicationTests {
    private static final String ASSERT_MSG = "PMD UnitTestAssertionsShouldIncludeMessage";
    @Autowired
    private LocationsPersistencePort locationsPersistencePort;

    @Test
    void applicationTestPlaceholder() {
        assertNotNull(locationsPersistencePort, ASSERT_MSG);
    }

    @TestConfiguration
    static class StubConfig {
        @Bean
        LocationEventPublisherPort locationEventPublisherPort() {
            return new LocationEventPublisherPort() {
                @Override
                public void publishCityCreated(CityCreatedEvent event) {
                }

                @Override
                public void publishCityUpdated(CityUpdatedEvent event) {
                }

                @Override
                public void publishCityDeleted(CityDeletedEvent event) {
                }

                @Override
                public void publishSpaceCreated(SpaceCreatedEvent event) {
                }

                @Override
                public void publishSpaceUpdated(SpaceUpdatedEvent event) {
                }

                @Override
                public void publishSpaceDeleted(SpaceDeletedEvent event) {
                }
            };
        }
    }
}




