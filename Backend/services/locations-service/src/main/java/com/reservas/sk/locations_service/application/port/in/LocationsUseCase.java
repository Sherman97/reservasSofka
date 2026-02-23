package com.reservas.sk.locations_service.application.port.in;

import com.reservas.sk.locations_service.application.usecase.*;
import com.reservas.sk.locations_service.domain.model.City;
import com.reservas.sk.locations_service.domain.model.Space;

import java.util.List;

public interface LocationsUseCase {
    City createCity(CreateCityCommand command);

    List<City> listCities();

    City getCityById(Long id);

    City updateCity(Long id, UpdateCityCommand command);

    void deleteCity(Long id);

    Space createSpace(CreateSpaceCommand command);

    List<Space> listSpaces(ListSpacesQuery query);

    Space getSpaceById(Long id);

    Space updateSpace(Long id, UpdateSpaceCommand command);

    void deleteSpace(Long id);
}






