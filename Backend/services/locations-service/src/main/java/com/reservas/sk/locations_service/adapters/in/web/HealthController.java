package com.reservas.sk.locations_service.adapters.in.web;

import com.reservas.sk.locations_service.adapters.in.web.dto.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class HealthController {
    @GetMapping("/health")
    public ApiResponse<Map<String, String>> health() {
        return ApiResponse.success(Map.of("status", "ok", "service", "locations-service"));
    }
}






