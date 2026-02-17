package com.reservas.sk.locations_service.infrastructure.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.rabbit")
public class RabbitProperties {
    private boolean enabled = false;
    private String exchange = "reservas.events";
    private String cityCreatedRoutingKey = "locations.city.created";
    private String cityUpdatedRoutingKey = "locations.city.updated";
    private String cityDeletedRoutingKey = "locations.city.deleted";
    private String spaceCreatedRoutingKey = "locations.space.created";
    private String spaceUpdatedRoutingKey = "locations.space.updated";
    private String spaceDeletedRoutingKey = "locations.space.deleted";

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public String getExchange() {
        return exchange;
    }

    public void setExchange(String exchange) {
        this.exchange = exchange;
    }

    public String getCityCreatedRoutingKey() {
        return cityCreatedRoutingKey;
    }

    public void setCityCreatedRoutingKey(String cityCreatedRoutingKey) {
        this.cityCreatedRoutingKey = cityCreatedRoutingKey;
    }

    public String getCityUpdatedRoutingKey() {
        return cityUpdatedRoutingKey;
    }

    public void setCityUpdatedRoutingKey(String cityUpdatedRoutingKey) {
        this.cityUpdatedRoutingKey = cityUpdatedRoutingKey;
    }

    public String getCityDeletedRoutingKey() {
        return cityDeletedRoutingKey;
    }

    public void setCityDeletedRoutingKey(String cityDeletedRoutingKey) {
        this.cityDeletedRoutingKey = cityDeletedRoutingKey;
    }

    public String getSpaceCreatedRoutingKey() {
        return spaceCreatedRoutingKey;
    }

    public void setSpaceCreatedRoutingKey(String spaceCreatedRoutingKey) {
        this.spaceCreatedRoutingKey = spaceCreatedRoutingKey;
    }

    public String getSpaceUpdatedRoutingKey() {
        return spaceUpdatedRoutingKey;
    }

    public void setSpaceUpdatedRoutingKey(String spaceUpdatedRoutingKey) {
        this.spaceUpdatedRoutingKey = spaceUpdatedRoutingKey;
    }

    public String getSpaceDeletedRoutingKey() {
        return spaceDeletedRoutingKey;
    }

    public void setSpaceDeletedRoutingKey(String spaceDeletedRoutingKey) {
        this.spaceDeletedRoutingKey = spaceDeletedRoutingKey;
    }
}




