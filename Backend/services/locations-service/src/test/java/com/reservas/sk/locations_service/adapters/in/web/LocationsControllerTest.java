package com.reservas.sk.locations_service.adapters.in.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.reservas.sk.locations_service.adapters.in.web.dto.CreateCityRequest;
import com.reservas.sk.locations_service.application.port.in.LocationsUseCase;
import com.reservas.sk.locations_service.application.usecase.CreateCityCommand;
import com.reservas.sk.locations_service.domain.model.City;
import com.reservas.sk.locations_service.infrastructure.security.JwtAuthenticationFilter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.boot.test.mock.mockito.MockBean;

import java.time.Instant;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(value = LocationsController.class, excludeAutoConfiguration = {
        org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class,
        org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration.class
})
@AutoConfigureMockMvc(addFilters = false)
@Import(LocationsControllerTest.TestConfig.class)
class LocationsControllerTest {
    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private LocationsUseCase locationsUseCase;
    @Autowired
    private LocationsHttpMapper locationsHttpMapper;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    private CreateCityRequest validRequest;

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
        validRequest = new CreateCityRequest("Bogotá", "Colombia");
    }

    @Test
    void createCity_201_payloadOk() throws Exception {
        City city = new City(1L, "Bogotá", "Colombia", Instant.now(), Instant.now());
        when(locationsUseCase.createCity(any(CreateCityCommand.class))).thenReturn(city);
        when(locationsHttpMapper.toResponse(any(City.class))).thenReturn(null); // Simplificado

        mockMvc.perform(post("/locations/cities")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isCreated());
    }

    @Test
    void createCity_400_validacionDTO() throws Exception {
        CreateCityRequest invalidRequest = new CreateCityRequest("", "");
        mockMvc.perform(post("/locations/cities")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());
    }
}
