---
name: TDD Red
description: Escribe tests que describen comportamiento AÚN NO IMPLEMENTADO. Los tests deben fallar activamente al ejecutarse.
tools: ['codebase', 'editFiles', 'usages', 'problems']
user-invokable: true
---

# TDD Red — Escribe la especificación como tests fallidos

Tu único trabajo es escribir tests que:
1. Describan claramente qué debe hacer el código.
2. Fallen al ejecutarse porque la implementación no existe aún.
3. Sean lo suficientemente concretos para guiar a TDD Green.

## ⛔ Prohibido
- No implementes nada en el código fuente del componente.
- No uses `it.skip` ni `it.todo` — los tests deben ejecutarse y fallar activamente.
- No escribas tests que ya pasen con el código actual.

## Proceso

1. Usa `service` para entender la estructura del proyecto y los archivos existentes.
2. Usa `editFiles` para crear el archivo `.test.tsx` con todos los tests.
3. Importa desde la ruta donde **debería** existir el servicio, aunque todavía no esté.

## Estructura de cada archivo de test para Services:
```java
package com.reservas.sk.inventory_service.application.service;

import com.reservas.sk.inventory_service.application.port.out.EquipmentEventPublisherPort;
import com.reservas.sk.inventory_service.application.port.out.InventoryPersistencePort;
import com.reservas.sk.inventory_service.application.usecase.CreateEquipmentCommand;
import com.reservas.sk.inventory_service.application.usecase.EquipmentCreatedEvent;
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
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class InventoryApplicationServiceTest {

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
    void createEquipmentNormalizesDataAndPublishesCreatedEvent() {
        Equipment storedEquipment = new Equipment(
                7L,
                10L,
                "Laptop",
                "SN-123",
                null,
                null,
                "available",
                null,
                null,
                Instant.parse("2026-01-01T00:00:00Z"),
                Instant.parse("2026-01-01T00:00:00Z")
        );

        when(persistencePort.cityExists(10L)).thenReturn(true);
        when(persistencePort.insertEquipment(
                eq(10L),
                eq("Laptop"),
                eq("SN-123"),
                eq(null),
                eq(null),
                eq("available"),
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
        assertThat(result.getStatus()).isEqualTo("available");

        ArgumentCaptor<EquipmentCreatedEvent> captor = ArgumentCaptor.forClass(EquipmentCreatedEvent.class);
        verify(eventPublisherPort).publishEquipmentCreated(captor.capture());

        EquipmentCreatedEvent event = captor.getValue();
        assertThat(event.equipmentId()).isEqualTo(7L);
        assertThat(event.cityId()).isEqualTo(10L);
        assertThat(event.name()).isEqualTo("Laptop");
        assertThat(event.status()).isEqualTo("available");
        assertThat(event.occurredAt()).isNotNull();
    }
}
```

## Estructura de cada archivo de test para Adapters IN:
```Java
package com.reservas.sk.inventory_service.adapters.in.web;

import com.reservas.sk.inventory_service.application.port.in.InventoryUseCase;
import com.reservas.sk.inventory_service.domain.model.Equipment;
import com.reservas.sk.inventory_service.exception.GlobalExceptionHandler;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

import java.time.Instant;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class EquipmentsControllerTest {

    private MockMvc mockMvc;
    private InventoryUseCase useCase;

    @BeforeEach
    void setUp() {
        useCase = mock(InventoryUseCase.class);

        LocalValidatorFactoryBean validator = new LocalValidatorFactoryBean();
        validator.afterPropertiesSet();

        mockMvc = MockMvcBuilders.standaloneSetup(
                        new EquipmentsController(useCase, new InventoryHttpMapper())
                )
                .setControllerAdvice(new GlobalExceptionHandler())
                .setValidator(validator)
                .build();
    }

    @Test
    void createReturnsValidationErrorWhenCityIdIsMissing() throws Exception {
        String payload = """
                {
                  "name": "Micrófono",
                  "status": "available"
                }
                """;

        mockMvc.perform(post("/inventory/equipments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.ok").value(false))
                .andExpect(jsonPath("$.errorCode").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.message").isNotEmpty());
    }

    @Test
    void getByIdReturnsEquipmentPayload() throws Exception {
        Equipment equipment = new Equipment(
                1L,
                5L,
                "Proyector",
                "SER-1",
                "BAR-1",
                "Epson",
                "available",
                "Operativo",
                null,
                Instant.parse("2026-01-10T10:00:00Z"),
                Instant.parse("2026-01-10T10:00:00Z")
        );
        when(useCase.getEquipmentById(1L)).thenReturn(equipment);

        mockMvc.perform(get("/inventory/equipments/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ok").value(true))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.cityId").value(5))
                .andExpect(jsonPath("$.data.name").value("Proyector"))
                .andExpect(jsonPath("$.data.status").value("available"));
    }
}
```
## Estructura de cada archivo de test para Adapters OUT:
```java
package com.reservas.sk.inventory_service.adapters.out.persistence;

import com.reservas.sk.inventory_service.domain.model.Equipment;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.JdbcTest;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@JdbcTest
class JdbcInventoryPersistenceAdapterTest {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private JdbcInventoryPersistenceAdapter adapter;

    @BeforeEach
    void setUp() {
        adapter = new JdbcInventoryPersistenceAdapter(jdbcTemplate);

        jdbcTemplate.execute("DROP TABLE IF EXISTS equipments");
        jdbcTemplate.execute("DROP TABLE IF EXISTS cities");

        jdbcTemplate.execute("""
                CREATE TABLE cities (
                    id BIGINT PRIMARY KEY,
                    name VARCHAR(120) NOT NULL
                )
                """);

        jdbcTemplate.execute("""
                CREATE TABLE equipments (
                    id BIGINT AUTO_INCREMENT PRIMARY KEY,
                    city_id BIGINT NOT NULL,
                    name VARCHAR(120) NOT NULL,
                    serial VARCHAR(120),
                    barcode VARCHAR(120),
                    model VARCHAR(120),
                    status VARCHAR(20),
                    notes VARCHAR(255),
                    image_url VARCHAR(255),
                    created_at TIMESTAMP,
                    updated_at TIMESTAMP
                )
                """);

        jdbcTemplate.update("INSERT INTO cities (id, name) VALUES (?, ?)", 1L, "Bogotá");
        jdbcTemplate.update("INSERT INTO cities (id, name) VALUES (?, ?)", 2L, "Medellín");
    }

    @Test
    void cityExistsReturnsTrueForPersistedCity() {
        assertThat(adapter.cityExists(1L)).isTrue();
        assertThat(adapter.cityExists(999L)).isFalse();
    }

    @Test
    void insertAndFindByIdPersistEquipmentData() {
        long id = adapter.insertEquipment(
                1L,
                "Laptop",
                "SN-11",
                "BAR-11",
                "Lenovo",
                "available",
                "Operativo",
                null
        );

        Optional<Equipment> found = adapter.findEquipmentById(id);

        assertThat(found).isPresent();
        assertThat(found.get().getCityId()).isEqualTo(1L);
        assertThat(found.get().getName()).isEqualTo("Laptop");
        assertThat(found.get().getStatus()).isEqualTo("available");
    }

    @Test
    void listEquipmentsAppliesCityAndStatusFilters() {
        adapter.insertEquipment(1L, "Projector", null, null, null, "available", null, null);
        adapter.insertEquipment(1L, "Speaker", null, null, null, "maintenance", null, null);
        adapter.insertEquipment(2L, "Tablet", null, null, null, "available", null, null);

        List<Equipment> filtered = adapter.listEquipments(1L, "available");

        assertThat(filtered).hasSize(1);
        assertThat(filtered.get(0).getCityId()).isEqualTo(1L);
        assertThat(filtered.get(0).getStatus()).isEqualTo("available");
        assertThat(filtered.get(0).getName()).isEqualTo("Projector");
    }
}
```

## Al terminar
Confirma: **"🔴 Tests escritos en [ruta]. Deben fallar todos — el componente no existe aún."**
Lista cada test y por qué fallará en el estado actual del código.