package com.reservas.sk.locations_service.adapters.in.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.reservas.sk.locations_service.adapters.in.web.dto.CreateSpaceRequest;
import com.reservas.sk.locations_service.application.port.in.LocationsUseCase;
import com.reservas.sk.locations_service.application.port.out.TokenPort;
import com.reservas.sk.locations_service.application.usecase.CreateSpaceCommand;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(value = LocationsController.class, excludeAutoConfiguration = {
        org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class,
        org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration.class
})
@AutoConfigureMockMvc(addFilters = false)
@Import(SpacesControllerTest.TestConfig.class)
class SpacesControllerTest {
    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private LocationsUseCase locationsUseCase;
    @MockBean
    private TokenPort tokenPort;

    private CreateSpaceRequest validRequest;

    @TestConfiguration
    static class TestConfig {
        @Bean
        public LocationsUseCase locationsUseCase() {
            return Mockito.mock(LocationsUseCase.class);
        }
        @Bean
        public LocationsHttpMapper locationsHttpMapper() {
            return Mockito.mock(LocationsHttpMapper.class);
        }
    }

    @BeforeEach
    void setUp() {
        validRequest = new CreateSpaceRequest(1L, "Sala 1", 10, "1", "desc", "img", true);
    }

    @Test
    void createSpace_404_cityNotFound() throws Exception {
        when(locationsUseCase.createSpace(any(CreateSpaceCommand.class)))
                .thenThrow(new com.reservas.sk.locations_service.exception.ApiException(org.springframework.http.HttpStatus.NOT_FOUND, "Ciudad no encontrada", "CITY_NOT_FOUND"));

        mockMvc.perform(post("/locations/spaces")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isNotFound());
    }
}
