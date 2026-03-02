package com.reservas.sk.auth_service.exception;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void handlesApiException_withFallbackCode() {
        ApiException ex = new ApiException(HttpStatus.CONFLICT, "error", " ");
        var response = handler.handleApiException(ex);
        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertEquals("BUSINESS_ERROR", response.getBody().errorCode());
    }

    @Test
    void handlesValidationAndRequestErrors() throws Exception {
        MethodArgumentNotValidException validationEx = mock(MethodArgumentNotValidException.class);
        BindingResult bindingResult = mock(BindingResult.class);
        when(validationEx.getBindingResult()).thenReturn(bindingResult);
        when(bindingResult.getFieldErrors()).thenReturn(List.of(new FieldError("obj", "name", "name requerido")));

        var validation = handler.handleValidation(validationEx);
        assertEquals(HttpStatus.BAD_REQUEST, validation.getStatusCode());
        assertEquals("VALIDATION_ERROR", validation.getBody().errorCode());

        var missing = handler.handleMissingParam(new MissingServletRequestParameterException("id", "Long"));
        assertEquals("MISSING_PARAMETER", missing.getBody().errorCode());

        var mismatch = handler.handleTypeMismatch(new MethodArgumentTypeMismatchException("x", Long.class, "id", null, new IllegalArgumentException()));
        assertEquals("INVALID_PARAMETER_TYPE", mismatch.getBody().errorCode());

        var invalidBody = handler.handleInvalidBody(new org.springframework.http.converter.HttpMessageNotReadableException("bad json"));
        assertEquals("INVALID_JSON", invalidBody.getBody().errorCode());
    }

    @Test
    void handlesUnexpectedException() {
        var response = handler.handleUnexpected(new RuntimeException("boom"));
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertEquals("INTERNAL_ERROR", response.getBody().errorCode());
    }
}
