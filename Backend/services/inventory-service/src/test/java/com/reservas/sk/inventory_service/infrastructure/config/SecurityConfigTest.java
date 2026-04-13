package com.reservas.sk.inventory_service.infrastructure.config;

import com.reservas.sk.inventory_service.adapters.in.web.EquipmentsController;
import com.reservas.sk.inventory_service.adapters.in.web.HealthController;
import com.reservas.sk.inventory_service.adapters.in.web.InventoryHttpMapper;
import com.reservas.sk.inventory_service.application.port.in.InventoryUseCase;
import com.reservas.sk.inventory_service.application.port.out.TokenPort;
import com.reservas.sk.inventory_service.application.usecase.AuthenticatedUser;
import com.reservas.sk.inventory_service.application.usecase.ListEquipmentsQuery;
import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = {HealthController.class, EquipmentsController.class})
@Import({SecurityConfig.class, InventoryHttpMapper.class})
class SecurityConfigTest {
    private static final String ASSERT_MSG = "PMD UnitTestAssertionsShouldIncludeMessage";
    private static final String JSON_OK = "$.ok";

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TokenPort tokenPort;

    @MockBean
    private InventoryUseCase inventoryUseCase;

    @Test
    void healthEndpoint_esPublicoSinToken() throws Exception {
        MvcResult result = mockMvc.perform(get("/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath(JSON_OK).value(true))
                .andReturn();
        verify(tokenPort, never()).parse(any());
        assertEquals(200, result.getResponse().getStatus(), ASSERT_MSG);
    }

    @Test
    void equipmentsEndpoint_sinToken_retorna401() throws Exception {
        MvcResult result = mockMvc.perform(get("/inventory/equipments"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath(JSON_OK).value(false))
                .andReturn();
        verify(tokenPort, never()).parse(any());
        verify(inventoryUseCase, never()).listEquipments(any(ListEquipmentsQuery.class));
        assertEquals(401, result.getResponse().getStatus(), ASSERT_MSG);
    }

    @Test
    void equipmentsEndpoint_tokenInvalido_retorna401() throws Exception {
        when(tokenPort.parse("invalid-token")).thenThrow(new JwtException("invalid"));

        MvcResult result = mockMvc.perform(get("/inventory/equipments")
                        .header("Authorization", "Bearer invalid-token"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath(JSON_OK).value(false))
                .andReturn();
        verify(tokenPort).parse("invalid-token");
        verify(inventoryUseCase, never()).listEquipments(any(ListEquipmentsQuery.class));
        assertEquals(401, result.getResponse().getStatus(), ASSERT_MSG);
    }

    @Test
    void equipmentsEndpoint_tokenValido_permiteAcceso() throws Exception {
        when(tokenPort.parse("valid-token")).thenReturn(new AuthenticatedUser(10L, "user@email.com"));
        when(inventoryUseCase.listEquipments(any(ListEquipmentsQuery.class))).thenReturn(List.of());

        MvcResult result = mockMvc.perform(get("/inventory/equipments")
                        .header("Authorization", "Bearer valid-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath(JSON_OK).value(true))
                .andReturn();
        verify(tokenPort).parse("valid-token");
        verify(inventoryUseCase).listEquipments(any(ListEquipmentsQuery.class));
        assertEquals(200, result.getResponse().getStatus(), ASSERT_MSG);
    }
}


