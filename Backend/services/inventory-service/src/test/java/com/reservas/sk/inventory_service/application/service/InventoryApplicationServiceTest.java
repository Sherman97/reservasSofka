package com.reservas.sk.inventory_service.application.service;

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
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class InventoryApplicationServiceTest {
    private static final String EQUIPMENT_NAME = "Laptop";
    private static final String STATUS_AVAILABLE = "available";
    private static final String CREATED_AT = "2026-01-01T00:00:00Z";

    @Mock
    private InventoryPersistencePort persistencePort;

    @Mock
    private EquipmentEventPublisherPort eventPublisherPort;

    @InjectMocks
    private InventoryApplicationService service;

    @Test
    void createEquipmentFailsWhenCityDoesNotExist() {
        when(persistencePort.cityExists(99L)).thenReturn(false);

        assertThatThrownBy(() -> service.createEquipment(new CreateEquipmentCommand(
                99L,
                "Proyector",
                null,
                null,
                null,
                null,
                null,
                null
        )))
                .isInstanceOf(ApiException.class)
                .satisfies(ex -> {
                    ApiException apiException = (ApiException) ex;
                    assertThat(apiException.getStatus()).isEqualTo(HttpStatus.NOT_FOUND);
                    assertThat(apiException.getErrorCode()).isEqualTo("CITY_NOT_FOUND");
                });
    }

    @Test
    void createEquipmentFailsWhenCityIdIsNull() {
        assertThatThrownBy(() -> service.createEquipment(new CreateEquipmentCommand(
                null,
                "Proyector",
                null,
                null,
                null,
                null,
                null,
                null
        )))
                .isInstanceOf(ApiException.class)
                .satisfies(ex -> {
                    ApiException apiException = (ApiException) ex;
                    assertThat(apiException.getStatus()).isEqualTo(HttpStatus.BAD_REQUEST);
                    assertThat(apiException.getErrorCode()).isEqualTo("INVALID_ARGUMENT");
                });
    }

    @Test
    void createEquipmentFailsWhenNameIsBlank() {
        when(persistencePort.cityExists(10L)).thenReturn(true);

        assertThatThrownBy(() -> service.createEquipment(new CreateEquipmentCommand(
                10L,
                "   ",
                null,
                null,
                null,
                null,
                null,
                null
        )))
                .isInstanceOf(ApiException.class)
                .satisfies(ex -> {
                    ApiException apiException = (ApiException) ex;
                    assertThat(apiException.getStatus()).isEqualTo(HttpStatus.BAD_REQUEST);
                    assertThat(apiException.getErrorCode()).isEqualTo("REQUIRED_FIELD");
                });
    }

    @Test
    void createEquipmentNormalizesDataAndPublishesCreatedEvent() {
        Equipment storedEquipment = new Equipment(
                7L,
                10L,
                EQUIPMENT_NAME,
                "SN-123",
                null,
                null,
                STATUS_AVAILABLE,
                null,
                null,
                Instant.parse(CREATED_AT),
                Instant.parse(CREATED_AT)
        );

        when(persistencePort.cityExists(10L)).thenReturn(true);
        when(persistencePort.insertEquipment(
                eq(10L),
                eq(EQUIPMENT_NAME),
                eq("SN-123"),
                eq(null),
                eq(null),
                eq(STATUS_AVAILABLE),
                eq(null),
                eq(null)
        )).thenReturn(7L);
        when(persistencePort.findEquipmentById(7L)).thenReturn(Optional.of(storedEquipment));

        Equipment result = service.createEquipment(new CreateEquipmentCommand(
                10L,
                "  Laptop  ",
                "  SN-123  ",
                " ",
                null,
                null,
                " ",
                null
        ));

        assertThat(result.getId()).isEqualTo(7L);
        assertThat(result.getStatus()).isEqualTo(STATUS_AVAILABLE);

        ArgumentCaptor<EquipmentCreatedEvent> captor = ArgumentCaptor.forClass(EquipmentCreatedEvent.class);
        verify(eventPublisherPort).publishEquipmentCreated(captor.capture());

        EquipmentCreatedEvent event = captor.getValue();
        assertThat(event.equipmentId()).isEqualTo(7L);
    }

    @Test
    void createEquipmentFailsForInvalidStatus() {
        when(persistencePort.cityExists(10L)).thenReturn(true);

        assertThatThrownBy(() -> service.createEquipment(new CreateEquipmentCommand(
                10L,
                EQUIPMENT_NAME,
                null,
                null,
                null,
                "broken",
                null,
                null
        )))
                .isInstanceOf(ApiException.class)
                .satisfies(ex -> assertThat(((ApiException) ex).getErrorCode()).isEqualTo("INVALID_STATUS"));
    }

    @Test
    void listEquipmentsNormalizesStatusAndReturnsData() {
        Equipment e1 = equipment(1L, STATUS_AVAILABLE);
        when(persistencePort.listEquipments(10L, "maintenance")).thenReturn(List.of(e1));

        List<Equipment> list = service.listEquipments(new ListEquipmentsQuery(10L, " MAINTENANCE "));

        assertThat(list).hasSize(1);
        verify(persistencePort).listEquipments(10L, "maintenance");
    }

    @Test
    void listEquipmentsWithBlankStatusPassesNullStatusToPersistence() {
        when(persistencePort.listEquipments(10L, null)).thenReturn(List.of());

        List<Equipment> list = service.listEquipments(new ListEquipmentsQuery(10L, "  "));

        assertThat(list).isEmpty();
        verify(persistencePort).listEquipments(10L, null);
    }

    @Test
    void getEquipmentByIdFailsWhenInvalidIdOrNotFound() {
        assertThatThrownBy(() -> service.getEquipmentById(0L))
                .isInstanceOf(ApiException.class)
                .satisfies(ex -> assertThat(((ApiException) ex).getErrorCode()).isEqualTo("INVALID_ARGUMENT"));

        when(persistencePort.findEquipmentById(99L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.getEquipmentById(99L))
                .isInstanceOf(ApiException.class)
                .satisfies(ex -> assertThat(((ApiException) ex).getErrorCode()).isEqualTo("EQUIPMENT_NOT_FOUND"));
    }

    @Test
    void updateEquipmentPublishesEventAndNormalizesFields() {
        Equipment before = equipment(7L, STATUS_AVAILABLE);
        Equipment after = equipment(7L, "retired");
        when(persistencePort.findEquipmentById(7L)).thenReturn(Optional.of(before), Optional.of(after));

        Equipment updated = service.updateEquipment(7L, new UpdateEquipmentCommand(
                "  Laptop  ",
                "  SN-1  ",
                " ",
                null,
                " RETIRED ",
                " ",
                null
        ));

        assertThat(updated.getStatus()).isEqualTo("retired");
        verify(persistencePort).updateEquipment(7L, EQUIPMENT_NAME, "SN-1", null, null, "retired", null, null);

        ArgumentCaptor<EquipmentUpdatedEvent> captor = ArgumentCaptor.forClass(EquipmentUpdatedEvent.class);
        verify(eventPublisherPort).publishEquipmentUpdated(captor.capture());
        assertThat(captor.getValue().equipmentId()).isEqualTo(7L);
    }

    @Test
    void deleteEquipmentPublishesEventAndReturnsResult() {
        Equipment existing = equipment(5L, STATUS_AVAILABLE);
        when(persistencePort.findEquipmentById(5L)).thenReturn(Optional.of(existing));
        when(persistencePort.deleteEquipment(5L)).thenReturn(1);

        DeleteEquipmentResult result = service.deleteEquipment(5L);

        assertThat(result.id()).isEqualTo(5L);
        ArgumentCaptor<EquipmentDeletedEvent> captor = ArgumentCaptor.forClass(EquipmentDeletedEvent.class);
        verify(eventPublisherPort).publishEquipmentDeleted(captor.capture());
        assertThat(captor.getValue().equipmentId()).isEqualTo(5L);
    }

    @Test
    void deleteEquipmentFailsWhenRowWasNotDeleted() {
        Equipment existing = equipment(8L, STATUS_AVAILABLE);
        when(persistencePort.findEquipmentById(8L)).thenReturn(Optional.of(existing));
        when(persistencePort.deleteEquipment(8L)).thenReturn(0);

        assertThatThrownBy(() -> service.deleteEquipment(8L))
                .isInstanceOf(ApiException.class)
                .satisfies(ex -> assertThat(((ApiException) ex).getErrorCode()).isEqualTo("EQUIPMENT_NOT_FOUND"));

        verify(eventPublisherPort, never()).publishEquipmentDeleted(any());
    }

    private Equipment equipment(long id, String status) {
        return new Equipment(
                id,
                10L,
                EQUIPMENT_NAME,
                "SN-1",
                null,
                null,
                status,
                null,
                null,
                Instant.parse(CREATED_AT),
                Instant.parse(CREATED_AT)
        );
    }
}

