package com.reservas.sk.inventory_service.adapters.in.web;

import com.reservas.sk.inventory_service.adapters.in.web.dto.EquipmentResponse;
import com.reservas.sk.inventory_service.domain.model.Equipment;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
public class InventoryHttpMapper {
    public EquipmentResponse toResponse(Equipment equipment) {
        return new EquipmentResponse(
                equipment.getId(),
                equipment.getCityId(),
                equipment.getName(),
                equipment.getSerial(),
                equipment.getBarcode(),
                equipment.getModel(),
                equipment.getStatus(),
                equipment.getNotes(),
                toIso(equipment.getCreatedAt()),
                toIso(equipment.getUpdatedAt())
        );
    }

    private String toIso(Instant value) {
        return value == null ? null : value.toString();
    }
}






