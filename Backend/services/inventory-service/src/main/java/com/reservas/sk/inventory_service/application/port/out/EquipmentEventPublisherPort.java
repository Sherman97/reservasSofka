package com.reservas.sk.inventory_service.application.port.out;

import com.reservas.sk.inventory_service.application.usecase.EquipmentCreatedEvent;
import com.reservas.sk.inventory_service.application.usecase.EquipmentDeletedEvent;
import com.reservas.sk.inventory_service.application.usecase.EquipmentUpdatedEvent;

public interface EquipmentEventPublisherPort {
    void publishEquipmentCreated(EquipmentCreatedEvent event);

    void publishEquipmentUpdated(EquipmentUpdatedEvent event);

    void publishEquipmentDeleted(EquipmentDeletedEvent event);
}




