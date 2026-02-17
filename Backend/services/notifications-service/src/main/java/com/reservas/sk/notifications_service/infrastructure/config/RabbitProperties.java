package com.reservas.sk.notifications_service.infrastructure.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.rabbit")
public class RabbitProperties {
    private boolean enabled = true;
    private String exchange = "reservas.events";
    private String queue = "notifications.events.q";
    private String routingKeys = "";

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

    public String getQueue() {
        return queue;
    }

    public void setQueue(String queue) {
        this.queue = queue;
    }

    public String getRoutingKeys() {
        return routingKeys;
    }

    public void setRoutingKeys(String routingKeys) {
        this.routingKeys = routingKeys;
    }
}






