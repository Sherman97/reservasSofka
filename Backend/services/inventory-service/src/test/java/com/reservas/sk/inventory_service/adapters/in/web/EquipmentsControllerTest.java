package com.reservas.sk.inventory_service.adapters.in.web;

import com.reservas.sk.inventory_service.application.port.in.InventoryUseCase;
import com.reservas.sk.inventory_service.application.usecase.CreateEquipmentCommand;
import com.reservas.sk.inventory_service.domain.model.Equipment;
import com.reservas.sk.inventory_service.exception.ApiException;
import com.reservas.sk.inventory_service.exception.GlobalExceptionHandler;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class EquipmentsControllerTest {
    private static final String ASSERT_MSG = "PMD UnitTestAssertionsShouldIncludeMessage";

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

        MvcResult result = mockMvc.perform(post("/inventory/equipments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.ok").value(false))
                .andExpect(jsonPath("$.errorCode").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.message").isNotEmpty())
                .andReturn();

        verify(useCase, never()).createEquipment(any(CreateEquipmentCommand.class));
        assertEquals(400, result.getResponse().getStatus(), ASSERT_MSG);
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

        MvcResult result = mockMvc.perform(get("/inventory/equipments/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ok").value(true))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.cityId").value(5))
                .andExpect(jsonPath("$.data.name").value("Proyector"))
                .andExpect(jsonPath("$.data.status").value("available"))
                .andReturn();

        verify(useCase).getEquipmentById(1L);
        assertEquals(200, result.getResponse().getStatus(), ASSERT_MSG);
    }

    @Test
    void getByIdReturns404WhenNotFound() throws Exception {
        when(useCase.getEquipmentById(99L)).thenThrow(
                new ApiException(
                        HttpStatus.NOT_FOUND,
                        "No encontrado",
                        "EQUIPMENT_NOT_FOUND"
                )
        );
        MvcResult result = mockMvc.perform(get("/inventory/equipments/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.ok").value(false))
                .andExpect(jsonPath("$.errorCode").value("EQUIPMENT_NOT_FOUND"))
                .andReturn();

        verify(useCase).getEquipmentById(99L);
        assertEquals(404, result.getResponse().getStatus(), ASSERT_MSG);
    }
}

