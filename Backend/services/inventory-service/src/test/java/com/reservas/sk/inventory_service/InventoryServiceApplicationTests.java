package com.reservas.sk.inventory_service;

import com.reservas.sk.inventory_service.application.port.out.EquipmentEventPublisherPort;
import com.reservas.sk.inventory_service.application.port.out.InventoryPersistencePort;
import com.reservas.sk.inventory_service.application.usecase.EquipmentCreatedEvent;
import com.reservas.sk.inventory_service.application.usecase.EquipmentDeletedEvent;
import com.reservas.sk.inventory_service.application.usecase.EquipmentUpdatedEvent;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Bean;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@Tag("integration")
@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:inventory_ctx;MODE=MySQL;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "app.jwt.secret=test-secret-key-for-inventory-service-1234567890-abcdef"
})
class InventoryServiceApplicationTests {
    private static final String ASSERT_MSG = "PMD UnitTestAssertionsShouldIncludeMessage";
    @Autowired
    private InventoryPersistencePort inventoryPersistencePort;

    @Test
    void contextLoads() {
        assertNotNull(inventoryPersistencePort, ASSERT_MSG);
    }

    @TestConfiguration
    static class StubConfig {
        @Bean
        EquipmentEventPublisherPort equipmentEventPublisherPort() {
            return new EquipmentEventPublisherPort() {
                @Override
                public void publishEquipmentCreated(EquipmentCreatedEvent event) {
                }

                @Override
                public void publishEquipmentUpdated(EquipmentUpdatedEvent event) {
                }

                @Override
                public void publishEquipmentDeleted(EquipmentDeletedEvent event) {
                }
            };
        }
    }
}




