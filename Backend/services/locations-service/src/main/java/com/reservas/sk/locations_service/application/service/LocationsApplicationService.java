package com.reservas.sk.locations_service.application.service;

import com.reservas.sk.locations_service.application.port.in.LocationsUseCase;
import com.reservas.sk.locations_service.application.port.out.LocationEventPublisherPort;
import com.reservas.sk.locations_service.application.port.out.LocationsPersistencePort;
import com.reservas.sk.locations_service.application.usecase.*;
import com.reservas.sk.locations_service.domain.model.City;
import com.reservas.sk.locations_service.domain.model.Space;
import com.reservas.sk.locations_service.exception.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LocationsApplicationService implements LocationsUseCase {
    private final LocationsPersistencePort persistencePort;
    private final LocationEventPublisherPort eventPublisherPort;

    public LocationsApplicationService(LocationsPersistencePort persistencePort,
                                       LocationEventPublisherPort eventPublisherPort) {
        this.persistencePort = persistencePort;
        this.eventPublisherPort = eventPublisherPort;
    }

    @Override
    public City createCity(CreateCityCommand command) {
        String name = normalizeRequired(command.name(), "name es obligatorio");
        String country = normalizeRequired(command.country(), "country es obligatorio");

        long id = persistencePort.insertCity(name, country);
        City created = getCityById(id);
        eventPublisherPort.publishCityCreated(new CityCreatedEvent(
                created.getId(),
                created.getName(),
                created.getCountry(),
                java.time.Instant.now()
        ));
        return created;
    }

    @Override
    public List<City> listCities() {
        return persistencePort.listCities();
    }

    @Override
    public City getCityById(Long id) {
        long cityId = requirePositive(id, "id es invalido");
        return persistencePort.findCityById(cityId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Ciudad no encontrada"));
    }

    @Override
    public City updateCity(Long id, UpdateCityCommand command) {
        City existing = getCityById(id);
        persistencePort.updateCity(existing.getId(), normalizeNullable(command.name()), normalizeNullable(command.country()));
        City updated = getCityById(existing.getId());
        eventPublisherPort.publishCityUpdated(new CityUpdatedEvent(
                updated.getId(),
                updated.getName(),
                updated.getCountry(),
                java.time.Instant.now()
        ));
        return updated;
    }

    @Override
    public void deleteCity(Long id) {
        City existing = getCityById(id);
        int affected = persistencePort.deleteCity(existing.getId());
        if (affected == 0) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Ciudad no encontrada");
        }
        eventPublisherPort.publishCityDeleted(new CityDeletedEvent(existing.getId(), java.time.Instant.now()));
    }

    @Override
    public Space createSpace(CreateSpaceCommand command) {
        long cityId = requirePositive(command.cityId(), "cityId es obligatorio");
        if (!persistencePort.existsCity(cityId)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Ciudad no encontrada");
        }

        String name = normalizeRequired(command.name(), "name es obligatorio");
        boolean isActive = command.isActive() == null || command.isActive();

        long id = persistencePort.insertSpace(
                cityId,
                name,
                command.capacity(),
                normalizeNullable(command.floor()),
                normalizeNullable(command.description()),
                normalizeNullable(command.imageUrl()),
                isActive
        );

        Space created = getSpaceById(id);
        eventPublisherPort.publishSpaceCreated(new SpaceCreatedEvent(
                created.getId(),
                created.getCityId(),
                created.getName(),
                created.isActive(),
                java.time.Instant.now()
        ));
        return created;
    }

    @Override
    public List<Space> listSpaces(ListSpacesQuery query) {
        return persistencePort.listSpaces(query.cityId(), query.activeOnly());
    }

    @Override
    public Space getSpaceById(Long id) {
        long spaceId = requirePositive(id, "id es invalido");
        return persistencePort.findSpaceById(spaceId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Espacio no encontrado"));
    }

    @Override
    public Space updateSpace(Long id, UpdateSpaceCommand command) {
        Space existing = getSpaceById(id);
        persistencePort.updateSpace(
                existing.getId(),
                normalizeNullable(command.name()),
                command.capacity(),
                normalizeNullable(command.floor()),
                normalizeNullable(command.description()),
                normalizeNullable(command.imageUrl()),
                command.isActive()
        );
        Space updated = getSpaceById(existing.getId());
        eventPublisherPort.publishSpaceUpdated(new SpaceUpdatedEvent(
                updated.getId(),
                updated.getCityId(),
                updated.getName(),
                updated.isActive(),
                java.time.Instant.now()
        ));
        return updated;
    }

    @Override
    public void deleteSpace(Long id) {
        Space existing = getSpaceById(id);
        int affected = persistencePort.deleteSpace(existing.getId());
        if (affected == 0) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Espacio no encontrado");
        }
        eventPublisherPort.publishSpaceDeleted(new SpaceDeletedEvent(
                existing.getId(),
                existing.getCityId(),
                java.time.Instant.now()
        ));
    }

    private long requirePositive(Long value, String message) {
        if (value == null || value <= 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, message);
        }
        return value;
    }

    private String normalizeRequired(String value, String message) {
        String normalized = normalizeNullable(value);
        if (normalized == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, message);
        }
        return normalized;
    }

    private String normalizeNullable(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim();
        return normalized.isEmpty() ? null : normalized;
    }
}





