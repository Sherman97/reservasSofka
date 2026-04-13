package com.reservas.sk.locations_service.adapters.in.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.reservas.sk.locations_service.adapters.in.web.dto.CityResponse;
import com.reservas.sk.locations_service.adapters.in.web.dto.CreateCityRequest;
import com.reservas.sk.locations_service.application.port.in.LocationsUseCase;
import com.reservas.sk.locations_service.application.usecase.CreateCityCommand;
import com.reservas.sk.locations_service.domain.model.City;
import com.reservas.sk.locations_service.domain.model.Space;
import com.reservas.sk.locations_service.exception.ApiException;
import com.reservas.sk.locations_service.infrastructure.security.JwtAuthenticationFilter;
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
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(value = LocationsController.class, excludeAutoConfiguration = {
        org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class,
        org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration.class
})
@AutoConfigureMockMvc(addFilters = false)
@Import(LocationsControllerTest.MockBeansConfig.class)
class LocationsControllerTest {
    private static final String ASSERT_MSG = "PMD UnitTestAssertionsShouldIncludeMessage";
    private static final String CITY_NAME = "Bogota";
    private static final String COUNTRY_NAME = "Colombia";
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
        reset(locationsUseCase, locationsHttpMapper);
        validRequest = new CreateCityRequest(CITY_NAME, COUNTRY_NAME);
    }

    @Test
    void createCity_201_payloadOk() throws Exception {
        City city = new City(1L, CITY_NAME, COUNTRY_NAME, Instant.now(), Instant.now());
        CityResponse cityResponse = new CityResponse(1L, CITY_NAME, COUNTRY_NAME, "2026-03-01T10:00:00Z", "2026-03-01T10:00:00Z");
        when(locationsUseCase.createCity(any(CreateCityCommand.class))).thenReturn(city);
        when(locationsHttpMapper.toResponse(city)).thenReturn(cityResponse);

        MvcResult mvcResult = mockMvc.perform(post("/locations/cities")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        ArgumentCaptor<CreateCityCommand> commandCaptor = ArgumentCaptor.forClass(CreateCityCommand.class);
        verify(locationsUseCase).createCity(commandCaptor.capture());
        verify(locationsHttpMapper).toResponse(city);
        assertEquals(201, mvcResult.getResponse().getStatus(), ASSERT_MSG);
        assertEquals(CITY_NAME, commandCaptor.getValue().name(), ASSERT_MSG);
        assertEquals(COUNTRY_NAME, commandCaptor.getValue().country(), ASSERT_MSG);
    }

    @Test
    void createCity_400_validacionDTO() throws Exception {
        CreateCityRequest invalidRequest = new CreateCityRequest("", "");
        MvcResult mvcResult = mockMvc.perform(post("/locations/cities")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andReturn();

        verify(locationsUseCase, never()).createCity(any(CreateCityCommand.class));
        verify(locationsHttpMapper, never()).toResponse(any(City.class));
        assertEquals(400, mvcResult.getResponse().getStatus(), ASSERT_MSG);
    }

    @Test
    void getSpaceQrCode_shouldReturnQrImageWithCacheHeaders_whenQrExists() throws Exception {
        // Arrange
        Long spaceId = 1L;
        byte[] qrImageData = new byte[]{1, 2, 3, 4, 5}; // Mock QR image
        String etag = "abc123etag";
        
        Space space = new Space(
                spaceId,
                1L,
                "Conference Room A",
                10,
                "Floor 1",
                "Main conference room",
                "http://image.url",
                true,
                Instant.now(),
                Instant.now(),
                qrImageData,
                "mock-qr-token",
                etag
        );
        
        when(locationsUseCase.getSpaceWithQrCode(spaceId)).thenReturn(space);
        
        // Act & Assert
        mockMvc.perform(get("/locations/spaces/{id}/qr", spaceId))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.IMAGE_PNG))
                .andExpect(content().bytes(qrImageData))
                .andExpect(result -> {
                    String etagHeader = result.getResponse().getHeader(HttpHeaders.ETAG);
                    assertEquals("\"" + etag + "\"", etagHeader, ASSERT_MSG); // ETags include quotes per HTTP spec
                    
                    String cacheControl = result.getResponse().getHeader(HttpHeaders.CACHE_CONTROL);
                    // Spring CacheControl generates: max-age=31536000, public, immutable
                    assertTrue(cacheControl.contains("max-age=31536000"), ASSERT_MSG);
                    assertTrue(cacheControl.contains("public"), ASSERT_MSG);
                    assertTrue(cacheControl.contains("immutable"), ASSERT_MSG);
                });
        
        verify(locationsUseCase).getSpaceWithQrCode(spaceId);
    }

    @Test
    void getSpaceQrCode_shouldReturn304NotModified_whenIfNoneMatchMatches() throws Exception {
        // Arrange
        Long spaceId = 1L;
        String etag = "abc123etag";
        
        Space space = new Space(
                spaceId,
                1L,
                "Conference Room A",
                10,
                "Floor 1",
                "Main conference room",
                "http://image.url",
                true,
                Instant.now(),
                Instant.now(),
                new byte[]{1, 2, 3},
                "mock-qr-token",
                etag
        );
        
        when(locationsUseCase.getSpaceWithQrCode(spaceId)).thenReturn(space);
        
        // Act & Assert
        mockMvc.perform(get("/locations/spaces/{id}/qr", spaceId)
                        .header(HttpHeaders.IF_NONE_MATCH, "\"" + etag + "\"")) // Send ETag with quotes
                .andExpect(status().isNotModified())
                .andExpect(result -> {
                    String etagHeader = result.getResponse().getHeader(HttpHeaders.ETAG);
                    assertEquals("\"" + etag + "\"", etagHeader, ASSERT_MSG); // ETags include quotes per HTTP spec
                });
        
        verify(locationsUseCase).getSpaceWithQrCode(spaceId);
    }

    @Test
    void getSpaceQrCode_shouldReturn404_whenQrCodeNotGenerated() throws Exception {
        // Arrange
        Long spaceId = 1L;
        
        Space space = new Space(
                spaceId,
                1L,
                "Conference Room A",
                10,
                "Floor 1",
                "Main conference room",
                "http://image.url",
                true,
                Instant.now(),
                Instant.now(),
                null, // No QR code
                null,
                null
        );
        
        when(locationsUseCase.getSpaceWithQrCode(spaceId)).thenReturn(space);
        
        // Act & Assert
        mockMvc.perform(get("/locations/spaces/{id}/qr", spaceId))
                .andExpect(status().isNotFound());
        
        verify(locationsUseCase).getSpaceWithQrCode(spaceId);
    }

    @Test
    void getSpaceQrCode_shouldReturn404_whenSpaceNotFound() throws Exception {
        // Arrange
        Long spaceId = 999L;
        
        when(locationsUseCase.getSpaceWithQrCode(spaceId))
                .thenThrow(new ApiException(HttpStatus.NOT_FOUND, "Space not found", "SPACE_NOT_FOUND"));
        
        // Act & Assert
        mockMvc.perform(get("/locations/spaces/{id}/qr", spaceId))
                .andExpect(status().isNotFound());
        
        verify(locationsUseCase).getSpaceWithQrCode(spaceId);
    }
}



