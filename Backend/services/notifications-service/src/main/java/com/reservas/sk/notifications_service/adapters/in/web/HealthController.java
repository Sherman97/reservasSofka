package com.reservas.sk.notifications_service.adapters.in.web;

import com.reservas.sk.notifications_service.adapters.in.web.dto.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class HealthController {
    @GetMapping("/notifications/health")
    public ApiResponse<Map<String, Object>> health() {
        return ApiResponse.success(Map.of(
                "status", "ok",
                "service", "notifications-service",
                "wsEndpoint", "/notifications/ws",
                "topics", "/topic/events"
        ));
    }
}






