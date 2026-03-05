package com.reservas.sk.locations_service.adapters.in.web;

import com.reservas.sk.locations_service.adapters.in.web.dto.CreateCityRequest;
import com.reservas.sk.locations_service.adapters.in.web.dto.CreateSpaceRequest;
import com.reservas.sk.locations_service.adapters.in.web.dto.UpdateCityRequest;
import com.reservas.sk.locations_service.adapters.in.web.dto.UpdateSpaceRequest;
import com.reservas.sk.locations_service.application.port.in.LocationsUseCase;
import com.reservas.sk.locations_service.domain.model.City;
import com.reservas.sk.locations_service.domain.model.Space;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class LocationsControllerUnitTest {
    private static final String ASSERT_MSG = "PMD UnitTestAssertionsShouldIncludeMessage";
    private static final String CITY_NAME = "Bogota";
    private static final String START_AT = "2026-03-01T10:00:00Z";

    private LocationsUseCase useCase;
    private LocationsController controller;

    @BeforeEach
    void setUp() {
        useCase = mock(LocationsUseCase.class);
        controller = new LocationsController(useCase, new LocationsHttpMapper());
    }

    @Test
    void cityEndpoints_coverCreateListGetUpdateDelete() {
        when(useCase.createCity(any())).thenReturn(city(1L, CITY_NAME));
        when(useCase.listCities()).thenReturn(List.of(city(1L, CITY_NAME), city(2L, "Medellin")));
        when(useCase.getCityById(1L)).thenReturn(city(1L, CITY_NAME));
        when(useCase.updateCity(any(), any())).thenReturn(city(1L, "Bogota D.C."));

        controller.createCity(new CreateCityRequest(CITY_NAME, "Colombia"));
        var listed = controller.listCities();
        var fetched = controller.getCity(1L);
        var updated = controller.updateCity(1L, new UpdateCityRequest("Bogota D.C.", "Colombia"));
        var deleted = controller.deleteCity(1L);

        assertEquals(2, listed.data().size(), ASSERT_MSG);
        assertEquals(CITY_NAME, fetched.data().name(), ASSERT_MSG);
        assertEquals("Bogota D.C.", updated.data().name(), ASSERT_MSG);
        assertEquals(HttpStatus.NO_CONTENT, deleted.getStatusCode(), ASSERT_MSG);

        verify(useCase).deleteCity(1L);
    }

    @Test
    void spaceEndpoints_coverCreateListGetUpdateDelete() {
        when(useCase.createSpace(any())).thenReturn(space(10L, true));
        when(useCase.listSpaces(any())).thenReturn(List.of(space(10L, true), space(11L, false)));
        when(useCase.getSpaceById(10L)).thenReturn(space(10L, true));
        when(useCase.updateSpace(any(), any())).thenReturn(space(10L, false));

        controller.createSpace(new CreateSpaceRequest(1L, "Sala A", 12, "1", "desc", null, true));
        var listed = controller.listSpaces(1L, true);
        var fetched = controller.getSpace(10L);
        var updated = controller.updateSpace(10L, new UpdateSpaceRequest("Sala A", 15, "2", "desc2", "img", false));
        var deleted = controller.deleteSpace(10L);

        assertEquals(2, listed.data().size(), ASSERT_MSG);
        assertEquals(10L, fetched.data().id(), ASSERT_MSG);
        assertEquals(false, updated.data().isActive(), ASSERT_MSG);
        assertEquals(HttpStatus.NO_CONTENT, deleted.getStatusCode(), ASSERT_MSG);

        verify(useCase).deleteSpace(10L);
    }

    private City city(long id, String name) {
        return new City(id, name, "Colombia", Instant.parse(START_AT), Instant.parse(START_AT));
    }

    private Space space(long id, boolean active) {
        return new Space(
                id,
                1L,
                "Sala",
                10,
                "1",
                "desc",
                null,
                active,
                Instant.parse(START_AT),
                Instant.parse(START_AT)
        );
    }
}


