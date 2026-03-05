package com.reservas.sk.api_gateway.infrastructure.config;

import org.junit.jupiter.api.Test;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class GatewayProxyConfigUnitTest {
    private static final String ASSERT_MSG = "PMD UnitTestAssertionsShouldIncludeMessage";

    @Test
    void sanitize_throwsWhenValueIsNull() {
        IllegalStateException ex = assertThrows(
                IllegalStateException.class,
                () -> invokeSanitize(null)
        );

        assertEquals("Gateway route URL no configurada", ex.getMessage(), ASSERT_MSG);
    }

    @Test
    void sanitize_throwsWhenValueIsBlank() {
        IllegalStateException ex = assertThrows(
                IllegalStateException.class,
                () -> invokeSanitize("   ")
        );

        assertEquals("Gateway route URL no configurada", ex.getMessage(), ASSERT_MSG);
    }

    @Test
    void sanitize_removesTrailingSlash() {
        String result = invokeSanitize("http://auth-service:3001/");

        assertEquals("http://auth-service:3001", result, ASSERT_MSG);
    }

    @Test
    void sanitize_keepsValueWithoutTrailingSlash() {
        String result = invokeSanitize("http://auth-service:3001");

        assertEquals("http://auth-service:3001", result, ASSERT_MSG);
    }

    private String invokeSanitize(String value) {
        try {
            GatewayProxyConfig config = new GatewayProxyConfig();
            Method sanitize = GatewayProxyConfig.class.getDeclaredMethod("sanitize", String.class);
            sanitize.setAccessible(true);
            return (String) sanitize.invoke(config, value);
        } catch (InvocationTargetException ex) {
            Throwable target = ex.getTargetException();
            if (target instanceof IllegalStateException state) {
                throw state;
            }
            throw new RuntimeException(target);
        } catch (ReflectiveOperationException ex) {
            throw new RuntimeException(ex);
        }
    }
}
