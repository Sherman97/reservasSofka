package com.reservas.sk.bookings_service.adapters.in.web.dto;

// Human Check 🛡️: se agrega errorCode para que frontend distinga errores sin depender del texto.
public record ApiResponse<T>(boolean ok, T data, String message, String errorCode) {
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, data, null, null);
    }

    public static ApiResponse<Void> error(String message) {
        return new ApiResponse<>(false, null, message, null);
    }

    public static ApiResponse<Void> error(String message, String errorCode) {
        return new ApiResponse<>(false, null, message, errorCode);
    }
}








