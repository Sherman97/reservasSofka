package com.reservas.sk.locations_service.adapters.in.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.reservas.sk.locations_service.adapters.in.web.dto.CreateSpaceRequest;
import com.reservas.sk.locations_service.application.port.in.LocationsUseCase;
import com.reservas.sk.locations_service.application.port.out.TokenPort;
import com.reservas.sk.locations_service.application.usecase.CreateSpaceCommand;
import com.reservas.sk.locations_service.exception.ApiException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(value = LocationsController.class, excludeAutoConfiguration = {
        org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class,
        org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration.class
})
@AutoConfigureMockMvc(addFilters = false)
@Import(SpacesControllerTest.MockBeansConfig.class)
class SpacesControllerTest {
    private static final String ASSERT_MSG = "PMD UnitTestAssertionsShouldIncludeMessage";
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
    static class MockBeansConfig {
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
        reset(locationsUseCase);
        validRequest = new CreateSpaceRequest(1L, "Sala 1", 10, "1", "desc", "img", true);
    }

    @Test
    void createSpace_404_cityNotFound() throws Exception {
        when(locationsUseCase.createSpace(any(CreateSpaceCommand.class)))
                .thenThrow(new ApiException(HttpStatus.NOT_FOUND, "Ciudad no encontrada", "CITY_NOT_FOUND"));

        MvcResult mvcResult = mockMvc.perform(post("/locations/spaces")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isNotFound())
                .andReturn();

        ArgumentCaptor<CreateSpaceCommand> commandCaptor = ArgumentCaptor.forClass(CreateSpaceCommand.class);
        verify(locationsUseCase).createSpace(commandCaptor.capture());
        assertEquals(404, mvcResult.getResponse().getStatus(), ASSERT_MSG);
        assertEquals(1L, commandCaptor.getValue().cityId(), ASSERT_MSG);
        assertEquals("Sala 1", commandCaptor.getValue().name(), ASSERT_MSG);
    }
}


