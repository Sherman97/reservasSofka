package com.reservas.sk.locations_service.application.port.out;

import com.reservas.sk.locations_service.application.usecase.CityCreatedEvent;
import com.reservas.sk.locations_service.application.usecase.CityDeletedEvent;
import com.reservas.sk.locations_service.application.usecase.CityUpdatedEvent;
import com.reservas.sk.locations_service.application.usecase.SpaceCreatedEvent;
import com.reservas.sk.locations_service.application.usecase.SpaceDeletedEvent;
import com.reservas.sk.locations_service.application.usecase.SpaceUpdatedEvent;

public interface LocationEventPublisherPort {
    void publishCityCreated(CityCreatedEvent event);

    void publishCityUpdated(CityUpdatedEvent event);

    void publishCityDeleted(CityDeletedEvent event);

    void publishSpaceCreated(SpaceCreatedEvent event);

    void publishSpaceUpdated(SpaceUpdatedEvent event);

    void publishSpaceDeleted(SpaceDeletedEvent event);
}




