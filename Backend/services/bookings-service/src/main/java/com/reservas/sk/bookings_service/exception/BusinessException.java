package com.reservas.sk.bookings_service.exception;

/**
 * Exception for business rule violations.
 * Used in domain and application layers to signal business logic errors.
 */
public class BusinessException extends RuntimeException {
    private static final long serialVersionUID = 1L;
    
    private final String code;
    
    public BusinessException(String code) {
        super(code);
        this.code = code;
    }
    
    public BusinessException(String code, String message) {
        super(message);
        this.code = code;
    }
    
    public BusinessException(String code, String message, Throwable cause) {
        super(message, cause);
        this.code = code;
    }
    
    public String getCode() {
        return code;
    }
}
