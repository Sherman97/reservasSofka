package com.reservas.sk.locations_service.application.service;

import com.reservas.sk.locations_service.application.port.out.LocationEventPublisherPort;
import com.reservas.sk.locations_service.application.port.out.LocationsPersistencePort;
import com.reservas.sk.locations_service.application.usecase.*;
import com.reservas.sk.locations_service.domain.model.City;
import com.reservas.sk.locations_service.domain.model.Space;
import com.reservas.sk.locations_service.exception.ApiException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class LocationsApplicationServiceTest {
    @Mock
    private LocationsPersistencePort persistencePort;
    @Mock
    private LocationEventPublisherPort eventPublisherPort;
    @InjectMocks
    private LocationsApplicationService service;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void createCity_ok() {
        CreateCityCommand cmd = new CreateCityCommand("Bogotá", "Colombia");
        when(persistencePort.insertCity(anyString(), anyString())).thenReturn(1L);
        City city = new City(1L, "Bogotá", "Colombia", Instant.now(), Instant.now());
        when(persistencePort.findCityById(1L)).thenReturn(Optional.of(city));
        City result = service.createCity(cmd);
        assertEquals("Bogotá", result.getName());
        verify(eventPublisherPort).publishCityCreated(any(CityCreatedEvent.class));
    }

    @Test
    void createCity_requiredFields() {
        CreateCityCommand cmd = new CreateCityCommand(null, "Colombia");
        ApiException ex = assertThrows(ApiException.class, () -> service.createCity(cmd));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
        assertEquals("REQUIRED_FIELD", ex.getErrorCode());
    }

    @Test
    void getCityById_notFound() {
        when(persistencePort.findCityById(99L)).thenReturn(Optional.empty());
        ApiException ex = assertThrows(ApiException.class, () -> service.getCityById(99L));
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatus());
        assertEquals("CITY_NOT_FOUND", ex.getErrorCode());
    }

    @Test
    void createSpace_ok() {
        CreateSpaceCommand cmd = new CreateSpaceCommand(1L, "Sala 1", 10, "1", "desc", "img", true);
        when(persistencePort.existsCity(1L)).thenReturn(true);
        when(persistencePort.insertSpace(anyLong(), anyString(), anyInt(), any(), any(), any(), anyBoolean())).thenReturn(2L);
        Space space = new Space(2L, 1L, "Sala 1", 10, "1", "desc", "img", true, Instant.now(), Instant.now());
        when(persistencePort.findSpaceById(2L)).thenReturn(Optional.of(space));

        SpaceCreatedEvent event = new SpaceCreatedEvent(2L, 1L, "Sala 1", true, any());
        Space result = service.createSpace(cmd);
        assertEquals("Sala 1", result.getName());
        verify(eventPublisherPort).publishSpaceCreated(any(SpaceCreatedEvent.class));
    }

    @Test
    void createSpace_cityNotFound() {
        CreateSpaceCommand cmd = new CreateSpaceCommand(99L, "Sala 1", 10, null, null, null, true);
        when(persistencePort.existsCity(99L)).thenReturn(false);
        ApiException ex = assertThrows(ApiException.class, () -> service.createSpace(cmd));
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatus());
        assertEquals("CITY_NOT_FOUND", ex.getErrorCode());
    }

    @Test
    void createSpace_invalidCapacity() {
        CreateSpaceCommand cmd = new CreateSpaceCommand(1L, "Sala 1", 0, null, null, null, true);
        when(persistencePort.existsCity(1L)).thenReturn(true);
        ApiException ex = assertThrows(ApiException.class, () -> service.createSpace(cmd));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
        assertEquals("INVALID_CAPACITY", ex.getErrorCode());
    }

    @Test
    void updateCity_ok() {
        City city = new City(1L, "Bogotá", "Colombia", Instant.now(), Instant.now());
        when(persistencePort.findCityById(1L)).thenReturn(Optional.of(city));
        UpdateCityCommand cmd = new UpdateCityCommand("Bogotá D.C.", "Colombia");
        City updated = new City(1L, "Bogotá D.C.", "Colombia", Instant.now(), Instant.now());
        when(persistencePort.findCityById(1L)).thenReturn(Optional.of(updated));
        City result = service.updateCity(1L, cmd);
        assertEquals("Bogotá D.C.", result.getName());
        verify(eventPublisherPort).publishCityUpdated(any(CityUpdatedEvent.class));
    }

    @Test
    void deleteCity_ok() {
        City city = new City(1L, "Bogotá", "Colombia", Instant.now(), Instant.now());
        when(persistencePort.findCityById(1L)).thenReturn(Optional.of(city));
        when(persistencePort.deleteCity(1L)).thenReturn(1);
        service.deleteCity(1L);
        verify(eventPublisherPort).publishCityDeleted(any(CityDeletedEvent.class));
    }

    @Test
    void deleteCity_notFound() {
        City city = new City(1L, "Bogotá", "Colombia", Instant.now(), Instant.now());
        when(persistencePort.findCityById(1L)).thenReturn(Optional.of(city));
        when(persistencePort.deleteCity(1L)).thenReturn(0);
        ApiException ex = assertThrows(ApiException.class, () -> service.deleteCity(1L));
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatus());
        assertEquals("CITY_NOT_FOUND", ex.getErrorCode());
    }
}
