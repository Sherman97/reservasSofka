package com.reservas.sk.notifications_service.adapters.in.web.dto;

public record ApiResponse<T>(boolean ok, T data, String message) {
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, data, null);
    }

    public static ApiResponse<Void> error(String message) {
        return new ApiResponse<>(false, null, message);
    }
}






