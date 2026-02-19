package com.reservas.sk.inventory_service.application.service;

import com.reservas.sk.inventory_service.application.port.in.InventoryUseCase;
import com.reservas.sk.inventory_service.application.port.out.EquipmentEventPublisherPort;
import com.reservas.sk.inventory_service.application.port.out.InventoryPersistencePort;
import com.reservas.sk.inventory_service.application.usecase.CreateEquipmentCommand;
import com.reservas.sk.inventory_service.application.usecase.DeleteEquipmentResult;
import com.reservas.sk.inventory_service.application.usecase.EquipmentCreatedEvent;
import com.reservas.sk.inventory_service.application.usecase.EquipmentDeletedEvent;
import com.reservas.sk.inventory_service.application.usecase.EquipmentUpdatedEvent;
import com.reservas.sk.inventory_service.application.usecase.ListEquipmentsQuery;
import com.reservas.sk.inventory_service.application.usecase.UpdateEquipmentCommand;
import com.reservas.sk.inventory_service.domain.model.Equipment;
import com.reservas.sk.inventory_service.exception.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;

@Service
public class InventoryApplicationService implements InventoryUseCase {
    private static final List<String> VALID_STATUSES = List.of("available", "maintenance", "retired");

    private final InventoryPersistencePort persistencePort;
    private final EquipmentEventPublisherPort eventPublisherPort;

    public InventoryApplicationService(InventoryPersistencePort persistencePort,
                                       EquipmentEventPublisherPort eventPublisherPort) {
        this.persistencePort = persistencePort;
        this.eventPublisherPort = eventPublisherPort;
    }

    @Override
    public Equipment createEquipment(CreateEquipmentCommand command) {
        long cityId = requirePositive(command.cityId(), "cityId es obligatorio");
        if (!persistencePort.cityExists(cityId)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Ciudad no encontrada");
        }

        String name = normalizeRequired(command.name(), "name es obligatorio");
        String status = normalizeStatus(command.status(), true);

        long id = persistencePort.insertEquipment(
                cityId,
                name,
                normalizeNullable(command.serial()),
                normalizeNullable(command.barcode()),
                normalizeNullable(command.model()),
                status,
                normalizeNullable(command.notes()),
                normalizeNullable(command.imageUrl())
        );
        Equipment created = getEquipmentById(id);
        eventPublisherPort.publishEquipmentCreated(new EquipmentCreatedEvent(
                created.getId(),
                created.getCityId(),
                created.getName(),
                created.getStatus(),
                java.time.Instant.now()
        ));
        return created;
    }

    @Override
    public List<Equipment> listEquipments(ListEquipmentsQuery query) {
        String status = normalizeStatus(query.status(), false);
        return persistencePort.listEquipments(query.cityId(), status);
    }

    @Override
    public Equipment getEquipmentById(Long id) {
        long equipmentId = requirePositive(id, "equipmentId es invalido");
        return persistencePort.findEquipmentById(equipmentId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Equipo no encontrado"));
    }

    @Override
    public Equipment updateEquipment(Long id, UpdateEquipmentCommand command) {
        Equipment existing = getEquipmentById(id);

        String name = normalizeNullable(command.name());
        String status = normalizeStatus(command.status(), false);

        persistencePort.updateEquipment(
                existing.getId(),
                name,
                normalizeNullable(command.serial()),
                normalizeNullable(command.barcode()),
                normalizeNullable(command.model()),
                status,
                normalizeNullable(command.notes()),
                normalizeNullable(command.imageUrl())
        );

        Equipment updated = getEquipmentById(existing.getId());
        eventPublisherPort.publishEquipmentUpdated(new EquipmentUpdatedEvent(
                updated.getId(),
                updated.getCityId(),
                updated.getName(),
                updated.getStatus(),
                java.time.Instant.now()
        ));
        return updated;
    }

    @Override
    public DeleteEquipmentResult deleteEquipment(Long id) {
        Equipment existing = getEquipmentById(id);
        int affected = persistencePort.deleteEquipment(existing.getId());
        if (affected == 0) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Equipo no encontrado");
        }
        eventPublisherPort.publishEquipmentDeleted(new EquipmentDeletedEvent(
                existing.getId(),
                existing.getCityId(),
                java.time.Instant.now()
        ));
        return new DeleteEquipmentResult(existing.getId());
    }

    private long requirePositive(Long value, String message) {
        if (value == null || value <= 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, message);
        }
        return value;
    }

    private String normalizeRequired(String value, String message) {
        String normalized = normalizeNullable(value);
        if (normalized == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, message);
        }
        return normalized;
    }

    private String normalizeNullable(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim();
        return normalized.isEmpty() ? null : normalized;
    }

    private String normalizeStatus(String status, boolean withDefault) {
        if (status == null || status.isBlank()) {
            return withDefault ? "available" : null;
        }

        String normalized = status.trim().toLowerCase(Locale.ROOT);
        if (!VALID_STATUSES.contains(normalized)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "status invalido. Use: available, maintenance, retired");
        }
        return normalized;
    }
}





