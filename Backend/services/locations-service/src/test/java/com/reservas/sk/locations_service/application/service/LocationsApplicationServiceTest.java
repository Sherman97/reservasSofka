package com.reservas.sk.locations_service.application.service;

import com.reservas.sk.locations_service.application.port.out.LocationEventPublisherPort;
import com.reservas.sk.locations_service.application.port.out.LocationsPersistencePort;
import com.reservas.sk.locations_service.application.usecase.CityCreatedEvent;
import com.reservas.sk.locations_service.application.usecase.CityDeletedEvent;
import com.reservas.sk.locations_service.application.usecase.CityUpdatedEvent;
import com.reservas.sk.locations_service.application.usecase.CreateCityCommand;
import com.reservas.sk.locations_service.application.usecase.CreateSpaceCommand;
import com.reservas.sk.locations_service.application.usecase.ListSpacesQuery;
import com.reservas.sk.locations_service.application.usecase.SpaceCreatedEvent;
import com.reservas.sk.locations_service.application.usecase.SpaceDeletedEvent;
import com.reservas.sk.locations_service.application.usecase.SpaceUpdatedEvent;
import com.reservas.sk.locations_service.application.usecase.UpdateCityCommand;
import com.reservas.sk.locations_service.application.usecase.UpdateSpaceCommand;
import com.reservas.sk.locations_service.domain.model.City;
import com.reservas.sk.locations_service.domain.model.Space;
import com.reservas.sk.locations_service.exception.ApiException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.any;
import static org.mockito.Mockito.anyBoolean;
import static org.mockito.Mockito.anyInt;
import static org.mockito.Mockito.anyLong;
import static org.mockito.Mockito.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class LocationsApplicationServiceTest {
    private static final String ASSERT_MSG = "PMD UnitTestAssertionsShouldIncludeMessage";
    private static final String BOGOTA = "BogotÃƒÂ¡";

    private static final String COLOMBIA = "Colombia";
    private static final String CITY_NOT_FOUND = "CITY_NOT_FOUND";
    private static final String SPACE_1 = "Sala 1";
    private static final String SPACE_A = "Sala A";
    private static final String SPACE_B = "Sala B";
    private static final String DESC = "desc";
    private static final String IMG = "img";
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
        CreateCityCommand cmd = new CreateCityCommand(BOGOTA, COLOMBIA);
        when(persistencePort.insertCity(anyString(), anyString())).thenReturn(1L);
        City city = new City(1L, BOGOTA, COLOMBIA, Instant.now(), Instant.now());
        when(persistencePort.findCityById(1L)).thenReturn(Optional.of(city));
        City result = service.createCity(cmd);
        assertEquals(BOGOTA, result.getName(), ASSERT_MSG);
        verify(eventPublisherPort).publishCityCreated(any(CityCreatedEvent.class));
    }

    @Test
    void createCity_requiredFields() {
        CreateCityCommand cmd = new CreateCityCommand(null, COLOMBIA);
        ApiException ex = assertThrows(ApiException.class, () -> service.createCity(cmd));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus(), ASSERT_MSG);
        assertEquals("REQUIRED_FIELD", ex.getErrorCode(), ASSERT_MSG);
    }

    @Test
    void createCity_requiredFields_whenBlank() {
        CreateCityCommand cmd = new CreateCityCommand("   ", "   ");
        ApiException ex = assertThrows(ApiException.class, () -> service.createCity(cmd));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus(), ASSERT_MSG);
        assertEquals("REQUIRED_FIELD", ex.getErrorCode(), ASSERT_MSG);
    }

    @Test
    void getCityById_notFound() {
        when(persistencePort.findCityById(99L)).thenReturn(Optional.empty());
        ApiException ex = assertThrows(ApiException.class, () -> service.getCityById(99L));
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatus(), ASSERT_MSG);
        assertEquals(CITY_NOT_FOUND, ex.getErrorCode(), ASSERT_MSG);
    }

    @Test
    void createSpace_ok() {
        CreateSpaceCommand cmd = new CreateSpaceCommand(1L, SPACE_1, 10, "1", DESC, IMG, true);
        when(persistencePort.existsCity(1L)).thenReturn(true);
        when(persistencePort.insertSpace(anyLong(), anyString(), anyInt(), any(), any(), any(), anyBoolean())).thenReturn(2L);
        Space space = new Space(2L, 1L, SPACE_1, 10, "1", DESC, IMG, true, Instant.now(), Instant.now());
        when(persistencePort.findSpaceById(2L)).thenReturn(Optional.of(space));

        Space result = service.createSpace(cmd);
        assertEquals(SPACE_1, result.getName(), ASSERT_MSG);
        verify(eventPublisherPort).publishSpaceCreated(any(SpaceCreatedEvent.class));
    }

    @Test
    void createSpace_cityNotFound() {
        CreateSpaceCommand cmd = new CreateSpaceCommand(99L, SPACE_1, 10, null, null, null, true);
        when(persistencePort.existsCity(99L)).thenReturn(false);
        ApiException ex = assertThrows(ApiException.class, () -> service.createSpace(cmd));
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatus(), ASSERT_MSG);
        assertEquals(CITY_NOT_FOUND, ex.getErrorCode(), ASSERT_MSG);
    }

    @Test
    void createSpace_invalidCapacity() {
        CreateSpaceCommand cmd = new CreateSpaceCommand(1L, SPACE_1, 0, null, null, null, true);
        when(persistencePort.existsCity(1L)).thenReturn(true);
        ApiException ex = assertThrows(ApiException.class, () -> service.createSpace(cmd));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus(), ASSERT_MSG);
        assertEquals("INVALID_CAPACITY", ex.getErrorCode(), ASSERT_MSG);
    }

    @Test
    void createSpace_invalidCityId() {
        CreateSpaceCommand cmd = new CreateSpaceCommand(0L, SPACE_1, 10, null, null, null, true);
        ApiException ex = assertThrows(ApiException.class, () -> service.createSpace(cmd));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus(), ASSERT_MSG);
        assertEquals("INVALID_ARGUMENT", ex.getErrorCode(), ASSERT_MSG);
    }

    @Test
    void createSpace_requiredName() {
        CreateSpaceCommand cmd = new CreateSpaceCommand(1L, "   ", 10, null, null, null, true);
        when(persistencePort.existsCity(1L)).thenReturn(true);
        ApiException ex = assertThrows(ApiException.class, () -> service.createSpace(cmd));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus(), ASSERT_MSG);
        assertEquals("REQUIRED_FIELD", ex.getErrorCode(), ASSERT_MSG);
    }

    @Test
    void updateCity_ok() {
        City city = new City(1L, BOGOTA, COLOMBIA, Instant.now(), Instant.now());
        UpdateCityCommand cmd = new UpdateCityCommand("BogotÃƒÂ¡ D.C.", COLOMBIA);
        City updated = new City(1L, "BogotÃƒÂ¡ D.C.", COLOMBIA, Instant.now(), Instant.now());
        when(persistencePort.findCityById(1L)).thenReturn(Optional.of(city), Optional.of(updated));
        City result = service.updateCity(1L, cmd);
        assertEquals("BogotÃƒÂ¡ D.C.", result.getName(), ASSERT_MSG);
        verify(eventPublisherPort).publishCityUpdated(any(CityUpdatedEvent.class));
    }

    @Test
    void updateCity_notFound() {
        when(persistencePort.findCityById(99L)).thenReturn(Optional.empty());

        ApiException ex = assertThrows(ApiException.class,
                () -> service.updateCity(99L, new UpdateCityCommand("Nueva", COLOMBIA)));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatus(), ASSERT_MSG);
        assertEquals(CITY_NOT_FOUND, ex.getErrorCode(), ASSERT_MSG);
        verify(eventPublisherPort, never()).publishCityUpdated(any(CityUpdatedEvent.class));
        verify(persistencePort, never()).updateCity(anyLong(), any(), any());
    }

    @Test
    void deleteCity_ok() {
        City city = new City(1L, BOGOTA, COLOMBIA, Instant.now(), Instant.now());
        when(persistencePort.findCityById(1L)).thenReturn(Optional.of(city));
        when(persistencePort.deleteCity(1L)).thenReturn(1);
        service.deleteCity(1L);
        verify(eventPublisherPort).publishCityDeleted(any(CityDeletedEvent.class));
    }

    @Test
    void deleteCity_notFound() {
        City city = new City(1L, BOGOTA, COLOMBIA, Instant.now(), Instant.now());
        when(persistencePort.findCityById(1L)).thenReturn(Optional.of(city));
        when(persistencePort.deleteCity(1L)).thenReturn(0);
        ApiException ex = assertThrows(ApiException.class, () -> service.deleteCity(1L));
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatus(), ASSERT_MSG);
        assertEquals(CITY_NOT_FOUND, ex.getErrorCode(), ASSERT_MSG);
    }

    @Test
    void listCities_returnsPersistenceResult() {
        when(persistencePort.listCities()).thenReturn(List.of(
                new City(1L, BOGOTA, COLOMBIA, Instant.now(), Instant.now()),
                new City(2L, "MedellÃƒÂ­n", COLOMBIA, Instant.now(), Instant.now())
        ));

        List<City> result = service.listCities();

        assertEquals(2, result.size(), ASSERT_MSG);
    }

    @Test
    void getSpaceById_notFound() {
        when(persistencePort.findSpaceById(99L)).thenReturn(Optional.empty());

        ApiException ex = assertThrows(ApiException.class, () -> service.getSpaceById(99L));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatus(), ASSERT_MSG);
        assertEquals("SPACE_NOT_FOUND", ex.getErrorCode(), ASSERT_MSG);
    }

    @Test
    void getSpaceById_invalidId() {
        ApiException ex = assertThrows(ApiException.class, () -> service.getSpaceById(0L));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus(), ASSERT_MSG);
        assertEquals("INVALID_ARGUMENT", ex.getErrorCode(), ASSERT_MSG);
    }

    @Test
    void listSpaces_returnsPersistenceResult() {
        when(persistencePort.listSpaces(1L, true)).thenReturn(List.of(
                new Space(10L, 1L, SPACE_A, 10, "1", null, null, true, Instant.now(), Instant.now())
        ));

        List<Space> result = service.listSpaces(new ListSpacesQuery(1L, true));

        assertEquals(1, result.size(), ASSERT_MSG);
        assertEquals(SPACE_A, result.get(0).getName(), ASSERT_MSG);
    }

    @Test
    void updateSpace_ok_publishesEvent() {
        Space existing = new Space(10L, 1L, SPACE_A, 10, "1", null, null, true, Instant.now(), Instant.now());
        Space updated = new Space(10L, 1L, SPACE_B, 20, "2", DESC, IMG, false, Instant.now(), Instant.now());
        when(persistencePort.findSpaceById(10L)).thenReturn(Optional.of(existing), Optional.of(updated));

        Space result = service.updateSpace(10L, new UpdateSpaceCommand(SPACE_B, 20, "2", DESC, IMG, false));

        assertEquals(SPACE_B, result.getName(), ASSERT_MSG);
        verify(persistencePort).updateSpace(10L, SPACE_B, 20, "2", DESC, IMG, false);
        verify(eventPublisherPort).publishSpaceUpdated(any(SpaceUpdatedEvent.class));
    }

    @Test
    void updateSpace_invalidCapacity() {
        Space existing = new Space(10L, 1L, SPACE_A, 10, "1", null, null, true, Instant.now(), Instant.now());
        when(persistencePort.findSpaceById(10L)).thenReturn(Optional.of(existing));

        ApiException ex = assertThrows(ApiException.class,
                () -> service.updateSpace(10L, new UpdateSpaceCommand(SPACE_B, 0, null, null, null, true)));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus(), ASSERT_MSG);
        assertEquals("INVALID_CAPACITY", ex.getErrorCode(), ASSERT_MSG);
    }

    @Test
    void deleteSpace_ok_publishesEvent() {
        Space existing = new Space(10L, 1L, SPACE_A, 10, "1", null, null, true, Instant.now(), Instant.now());
        when(persistencePort.findSpaceById(10L)).thenReturn(Optional.of(existing));
        when(persistencePort.deleteSpace(10L)).thenReturn(1);

        service.deleteSpace(10L);

        verify(eventPublisherPort).publishSpaceDeleted(any(SpaceDeletedEvent.class));
    }

    @Test
    void deleteSpace_notFoundOnDelete() {
        Space existing = new Space(10L, 1L, SPACE_A, 10, "1", null, null, true, Instant.now(), Instant.now());
        when(persistencePort.findSpaceById(10L)).thenReturn(Optional.of(existing));
        when(persistencePort.deleteSpace(10L)).thenReturn(0);

        ApiException ex = assertThrows(ApiException.class, () -> service.deleteSpace(10L));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatus(), ASSERT_MSG);
        assertEquals("SPACE_NOT_FOUND", ex.getErrorCode(), ASSERT_MSG);
    }

    @Test
    void createSpace_defaultActiveTrueWhenNull() {
        when(persistencePort.existsCity(1L)).thenReturn(true);
        when(persistencePort.insertSpace(anyLong(), anyString(), any(), any(), any(), any(), anyBoolean())).thenReturn(3L);
        when(persistencePort.findSpaceById(3L)).thenReturn(Optional.of(
                new Space(3L, 1L, "Sala C", 8, null, null, null, true, Instant.now(), Instant.now())
        ));

        Space result = service.createSpace(new CreateSpaceCommand(1L, "Sala C", 8, null, null, null, null));

        assertTrue(result.isActive(), ASSERT_MSG);
        verify(persistencePort).insertSpace(1L, "Sala C", 8, null, null, null, true);
    }

    @Test
    void createSpace_preservesFalseWhenProvided() {
        when(persistencePort.existsCity(1L)).thenReturn(true);
        when(persistencePort.insertSpace(anyLong(), anyString(), any(), any(), any(), any(), anyBoolean())).thenReturn(4L);
        when(persistencePort.findSpaceById(4L)).thenReturn(Optional.of(
                new Space(4L, 1L, "Sala D", 6, null, null, null, false, Instant.now(), Instant.now())
        ));

        Space result = service.createSpace(new CreateSpaceCommand(1L, "Sala D", 6, null, null, null, false));

        assertEquals(false, result.isActive(), ASSERT_MSG);
        verify(persistencePort).insertSpace(1L, "Sala D", 6, null, null, null, false);
    }
}



