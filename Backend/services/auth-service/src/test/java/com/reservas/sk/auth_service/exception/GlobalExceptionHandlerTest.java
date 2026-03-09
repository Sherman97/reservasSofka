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
    private static final String ASSERT_MSG = "PMD UnitTestAssertionsShouldIncludeMessage";

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void handlesApiException_withFallbackCode() {
        ApiException ex = new ApiException(HttpStatus.CONFLICT, "error", " ");
        var response = handler.handleApiException(ex);
        assertEquals(HttpStatus.CONFLICT, response.getStatusCode(), ASSERT_MSG);
        assertEquals("BUSINESS_ERROR", response.getBody().errorCode(), ASSERT_MSG);
    }

    @Test
    void handlesApiException_withProvidedCode() {
        ApiException ex = new ApiException(HttpStatus.BAD_REQUEST, "error", "CUSTOM_CODE");

        var response = handler.handleApiException(ex);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode(), ASSERT_MSG);
        assertEquals("CUSTOM_CODE", response.getBody().errorCode(), ASSERT_MSG);
    }

    @Test
    void handlesValidationAndRequestErrors() throws Exception {
        MethodArgumentNotValidException validationEx = mock(MethodArgumentNotValidException.class);
        BindingResult bindingResult = mock(BindingResult.class);
        when(validationEx.getBindingResult()).thenReturn(bindingResult);
        when(bindingResult.getFieldErrors()).thenReturn(List.of(new FieldError("obj", "name", "name requerido")));

        var validation = handler.handleValidation(validationEx);
        assertEquals(HttpStatus.BAD_REQUEST, validation.getStatusCode(), ASSERT_MSG);
        assertEquals("VALIDATION_ERROR", validation.getBody().errorCode(), ASSERT_MSG);

        var missing = handler.handleMissingParam(new MissingServletRequestParameterException("id", "Long"));
        assertEquals("MISSING_PARAMETER", missing.getBody().errorCode(), ASSERT_MSG);

        MethodArgumentTypeMismatchException mismatchException =
                new MethodArgumentTypeMismatchException(
                        "x",
                        Long.class,
                        "id",
                        null,
                        new IllegalArgumentException()
                );
        var mismatch = handler.handleTypeMismatch(mismatchException);
        assertEquals("INVALID_PARAMETER_TYPE", mismatch.getBody().errorCode(), ASSERT_MSG);

        org.springframework.http.converter.HttpMessageNotReadableException invalidJsonException =
                new org.springframework.http.converter.HttpMessageNotReadableException("bad json");
        var invalidBody = handler.handleInvalidBody(invalidJsonException);
        assertEquals("INVALID_JSON", invalidBody.getBody().errorCode(), ASSERT_MSG);
    }

    @Test
    void handlesUnexpectedException() {
        var response = handler.handleUnexpected(new RuntimeException("boom"));
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode(), ASSERT_MSG);
        assertEquals("INTERNAL_ERROR", response.getBody().errorCode(), ASSERT_MSG);
    }

    @Test
    void handlesValidation_withoutFieldError_usesDefaultMessage() {
        MethodArgumentNotValidException validationEx = mock(MethodArgumentNotValidException.class);
        BindingResult bindingResult = mock(BindingResult.class);
        when(validationEx.getBindingResult()).thenReturn(bindingResult);
        when(bindingResult.getFieldErrors()).thenReturn(List.of());

        var response = handler.handleValidation(validationEx);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode(), ASSERT_MSG);
        assertEquals("Datos invalidos", response.getBody().message(), ASSERT_MSG);
    }
}

