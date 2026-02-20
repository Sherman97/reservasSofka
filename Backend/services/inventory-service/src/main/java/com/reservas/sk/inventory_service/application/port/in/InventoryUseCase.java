package com.reservas.sk.inventory_service.application.port.in;

import com.reservas.sk.inventory_service.application.usecase.CreateEquipmentCommand;
import com.reservas.sk.inventory_service.application.usecase.DeleteEquipmentResult;
import com.reservas.sk.inventory_service.application.usecase.ListEquipmentsQuery;
import com.reservas.sk.inventory_service.application.usecase.UpdateEquipmentCommand;
import com.reservas.sk.inventory_service.domain.model.Equipment;

import java.util.List;

public interface InventoryUseCase {
    Equipment createEquipment(CreateEquipmentCommand command);

    List<Equipment> listEquipments(ListEquipmentsQuery query);

    Equipment getEquipmentById(Long id);

    Equipment updateEquipment(Long id, UpdateEquipmentCommand command);

    DeleteEquipmentResult deleteEquipment(Long id);
}






