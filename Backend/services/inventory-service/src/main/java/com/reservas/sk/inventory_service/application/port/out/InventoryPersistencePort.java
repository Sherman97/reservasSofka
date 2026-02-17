package com.reservas.sk.inventory_service.application.port.out;

import com.reservas.sk.inventory_service.domain.model.Equipment;

import java.util.List;
import java.util.Optional;

public interface InventoryPersistencePort {
    boolean cityExists(long cityId);

    long insertEquipment(long cityId,
                         String name,
                         String serial,
                         String barcode,
                         String model,
                         String status,
                         String notes);

    List<Equipment> listEquipments(Long cityId, String status);

    Optional<Equipment> findEquipmentById(long id);

    void updateEquipment(long id,
                         String name,
                         String serial,
                         String barcode,
                         String model,
                         String status,
                         String notes);

    int deleteEquipment(long id);
}






