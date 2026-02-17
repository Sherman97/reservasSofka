package com.reservas.sk.auth_service.infrastructure.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.rabbit")
public class RabbitProperties {
    private boolean enabled = false;
    private String exchange = "reservas.events";
    private String userCreatedRoutingKey = "auth.user.created";

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

    public String getUserCreatedRoutingKey() {
        return userCreatedRoutingKey;
    }

    public void setUserCreatedRoutingKey(String userCreatedRoutingKey) {
        this.userCreatedRoutingKey = userCreatedRoutingKey;
    }
}





