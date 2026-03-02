package com.reservas.sk.locations_service.infrastructure.security;

import com.reservas.sk.locations_service.application.port.out.TokenPort;
import com.reservas.sk.locations_service.application.usecase.AuthenticatedUser;
import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class JwtAuthenticationFilterTest {

    private TokenPort tokenPort;
    private JwtAuthenticationFilter filter;

    @BeforeEach
    void setUp() {
        tokenPort = mock(TokenPort.class);
        filter = new JwtAuthenticationFilter(tokenPort);
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void doFilterInternal_conTokenValido_seteaAutenticacion() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer valid-token");
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        AuthenticatedUser principal = new AuthenticatedUser(11L, "locations@email.com");
        when(tokenPort.parse("valid-token")).thenReturn(principal);

        filter.doFilter(request, response, chain);

        var authentication = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(authentication);
        assertInstanceOf(UsernamePasswordAuthenticationToken.class, authentication);
        assertEquals(principal, authentication.getPrincipal());
    }

    @Test
    void doFilterInternal_conTokenInvalido_limpiaAutenticacion() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer invalid-token");
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("old-principal", null)
        );
        when(tokenPort.parse("invalid-token")).thenThrow(new JwtException("invalid"));

        filter.doFilter(request, response, chain);

        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }
}
