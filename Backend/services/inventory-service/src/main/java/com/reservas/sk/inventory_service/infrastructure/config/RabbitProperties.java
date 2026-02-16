package com.reservas.sk.inventory_service.infrastructure.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.rabbit")
public class RabbitProperties {
    private boolean enabled = false;
    private String exchange = "reservas.events";
    private String equipmentCreatedRoutingKey = "inventory.equipment.created";
    private String equipmentUpdatedRoutingKey = "inventory.equipment.updated";
    private String equipmentDeletedRoutingKey = "inventory.equipment.deleted";

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

    public String getEquipmentCreatedRoutingKey() {
        return equipmentCreatedRoutingKey;
    }

    public void setEquipmentCreatedRoutingKey(String equipmentCreatedRoutingKey) {
        this.equipmentCreatedRoutingKey = equipmentCreatedRoutingKey;
    }

    public String getEquipmentUpdatedRoutingKey() {
        return equipmentUpdatedRoutingKey;
    }

    public void setEquipmentUpdatedRoutingKey(String equipmentUpdatedRoutingKey) {
        this.equipmentUpdatedRoutingKey = equipmentUpdatedRoutingKey;
    }

    public String getEquipmentDeletedRoutingKey() {
        return equipmentDeletedRoutingKey;
    }

    public void setEquipmentDeletedRoutingKey(String equipmentDeletedRoutingKey) {
        this.equipmentDeletedRoutingKey = equipmentDeletedRoutingKey;
    }
}




