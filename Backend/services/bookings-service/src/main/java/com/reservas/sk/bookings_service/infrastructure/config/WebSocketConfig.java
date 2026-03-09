package com.reservas.sk.bookings_service.infrastructure.config;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
@SuppressFBWarnings(
        value = "EI_EXPOSE_REP2",
        justification = "Configuration properties bean is injected by Spring container."
)
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    private final WebSocketProperties webSocketProperties;

    public WebSocketConfig(WebSocketProperties webSocketProperties) {
        this.webSocketProperties = webSocketProperties;
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic");
        registry.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Human Check 🛡️: endpoint STOMP para enviar eventos de reservas a pestañas concurrentes.
        registry.addEndpoint("/bookings/ws")
                .setAllowedOriginPatterns(webSocketProperties.getAllowedOrigins().split(","));
    }
}

