package com.reservas.sk.locations_service.application.port.out;

import com.reservas.sk.locations_service.domain.model.City;
import com.reservas.sk.locations_service.domain.model.Space;

import java.util.List;
import java.util.Optional;

public interface LocationsPersistencePort {
    long insertCity(String name, String country);

    List<City> listCities();

    Optional<City> findCityById(long id);

    void updateCity(long id, String name, String country);

    int deleteCity(long id);

    boolean existsCity(long id);

    long insertSpace(long cityId, String name, Integer capacity, String floor, String description, boolean isActive);

    List<Space> listSpaces(Long cityId, Boolean activeOnly);

    Optional<Space> findSpaceById(long id);

    void updateSpace(long id, String name, Integer capacity, String floor, String description, Boolean isActive);

    int deleteSpace(long id);
}






