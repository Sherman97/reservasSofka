package com.reservas.sk.locations_service.adapters.in.web;

import com.reservas.sk.locations_service.adapters.in.web.dto.CityResponse;
import com.reservas.sk.locations_service.adapters.in.web.dto.SpaceResponse;
import com.reservas.sk.locations_service.domain.model.City;
import com.reservas.sk.locations_service.domain.model.Space;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
public class LocationsHttpMapper {
    public CityResponse toResponse(City city) {
        return new CityResponse(
                city.getId(),
                city.getName(),
                city.getCountry(),
                toIso(city.getCreatedAt()),
                toIso(city.getUpdatedAt())
        );
    }

    public SpaceResponse toResponse(Space space) {
        return new SpaceResponse(
                space.getId(),
                space.getCityId(),
                space.getName(),
                space.getCapacity(),
                space.getFloor(),
                space.getDescription(),
                space.getImageUrl(),
                space.isActive(),
                toIso(space.getCreatedAt()),
                toIso(space.getUpdatedAt())
        );
    }

    private String toIso(Instant value) {
        return value == null ? null : value.toString();
    }
}





