package com.reservas.sk.inventory_service.adapters.in.web;

import com.reservas.sk.inventory_service.adapters.in.web.dto.CreateEquipmentRequest;
import com.reservas.sk.inventory_service.adapters.in.web.dto.UpdateEquipmentRequest;
import com.reservas.sk.inventory_service.application.port.in.InventoryUseCase;
import com.reservas.sk.inventory_service.application.usecase.DeleteEquipmentResult;
import com.reservas.sk.inventory_service.domain.model.Equipment;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class EquipmentsControllerUnitTest {

    private InventoryUseCase useCase;
    private EquipmentsController controller;

    @BeforeEach
    void setUp() {
        useCase = mock(InventoryUseCase.class);
        controller = new EquipmentsController(useCase, new InventoryHttpMapper());
    }

    @Test
    void createListGetUpdateDelete_coverMainEndpoints() {
        when(useCase.createEquipment(any())).thenReturn(equipment(1L, "available"));
        when(useCase.listEquipments(any())).thenReturn(List.of(equipment(1L, "available"), equipment(2L, "maintenance")));
        when(useCase.getEquipmentById(1L)).thenReturn(equipment(1L, "available"));
        when(useCase.updateEquipment(any(), any())).thenReturn(equipment(1L, "retired"));
        when(useCase.deleteEquipment(1L)).thenReturn(new DeleteEquipmentResult(1L));

        var created = controller.create(new CreateEquipmentRequest(5L, "Laptop", "SN", "BC", "Lenovo", "available", "ok", null));
        var listed = controller.list(5L, "available");
        var fetched = controller.getById(1L);
        var updated = controller.update(1L, new UpdateEquipmentRequest("Laptop", "SN", "BC", "Lenovo", "retired", "ok", null));
        var deleted = controller.delete(1L);

        assertEquals(HttpStatus.CREATED, created.getStatusCode());
        assertTrue(created.getBody().ok());
        assertEquals(2, listed.data().size());
        assertEquals(1L, fetched.data().id());
        assertEquals("retired", updated.data().status());
        assertEquals(1L, deleted.data().get("id"));

        verify(useCase).deleteEquipment(1L);
    }

    private Equipment equipment(long id, String status) {
        return new Equipment(
                id,
                5L,
                "Laptop",
                "SN",
                "BC",
                "Lenovo",
                status,
                "ok",
                null,
                Instant.parse("2026-03-01T10:00:00Z"),
                Instant.parse("2026-03-01T10:00:00Z")
        );
    }
}
