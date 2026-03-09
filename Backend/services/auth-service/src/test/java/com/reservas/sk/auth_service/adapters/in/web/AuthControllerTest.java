package com.reservas.sk.auth_service.adapters.in.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.reservas.sk.auth_service.adapters.in.web.dto.AuthResponse;
import com.reservas.sk.auth_service.adapters.in.web.dto.LoginRequest;
import com.reservas.sk.auth_service.adapters.in.web.dto.RegisterRequest;
import com.reservas.sk.auth_service.adapters.in.web.dto.UserResponse;
import com.reservas.sk.auth_service.application.port.in.AuthUseCase;
import com.reservas.sk.auth_service.application.port.out.TokenPort;
import com.reservas.sk.auth_service.application.usecase.AuthResult;
import com.reservas.sk.auth_service.application.usecase.LoginCommand;
import com.reservas.sk.auth_service.application.usecase.RegisterCommand;
import com.reservas.sk.auth_service.exception.ApiException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(value = AuthController.class, excludeAutoConfiguration = {
        org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class,
        org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration.class
})
@AutoConfigureMockMvc(addFilters = false)
@Import(AuthControllerTest.MockBeansConfig.class)
class AuthControllerTest {
    private static final String ASSERT_MSG = "PMD UnitTestAssertionsShouldIncludeMessage";
    private static final String JUAN_EMAIL = "juan@email.com";
    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private AuthUseCase authUseCase;
    @Autowired
    private AuthHttpMapper authHttpMapper;
    @MockBean
    private TokenPort tokenPort;

    private RegisterRequest validRegisterRequest;
    private LoginRequest validLoginRequest;

    @TestConfiguration
    static class MockBeansConfig {
        @Bean
        public AuthUseCase authUseCase() {
            return Mockito.mock(AuthUseCase.class);
        }

        @Bean
        public AuthHttpMapper authHttpMapper() {
            return Mockito.mock(AuthHttpMapper.class);
        }
    }

    @BeforeEach
    void setUp() {
        reset(authUseCase, authHttpMapper);
        validRegisterRequest = new RegisterRequest("Juan", JUAN_EMAIL, "123456");
        validLoginRequest = new LoginRequest(JUAN_EMAIL, "123456");
    }

    @Test
    void register_201_payloadOk() throws Exception {
        AuthResult authResult = Mockito.mock(AuthResult.class);
        AuthResponse authResponse = new AuthResponse(
                new UserResponse(1L, "Juan", JUAN_EMAIL, LocalDateTime.of(2026, 3, 1, 10, 0)),
                "jwt-token"
        );
        when(authUseCase.register(any(RegisterCommand.class))).thenReturn(authResult);
        when(authHttpMapper.toAuthResponse(authResult)).thenReturn(authResponse);

        MvcResult mvcResult = mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRegisterRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        ArgumentCaptor<RegisterCommand> commandCaptor = ArgumentCaptor.forClass(RegisterCommand.class);
        verify(authUseCase).register(commandCaptor.capture());
        verify(authHttpMapper).toAuthResponse(authResult);
        assertEquals(201, mvcResult.getResponse().getStatus(), ASSERT_MSG);
        assertEquals(JUAN_EMAIL, commandCaptor.getValue().email(), ASSERT_MSG);
    }

    @Test
    void register_400_validacionDTO() throws Exception {
        RegisterRequest invalidRequest = new RegisterRequest("", "", "");
        MvcResult mvcResult = mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andReturn();

        verify(authUseCase, never()).register(any(RegisterCommand.class));
        verify(authHttpMapper, never()).toAuthResponse(any());
        assertEquals(400, mvcResult.getResponse().getStatus(), ASSERT_MSG);
    }

    @Test
    void login_200_payloadOk() throws Exception {
        AuthResult authResult = Mockito.mock(AuthResult.class);
        AuthResponse authResponse = new AuthResponse(
                new UserResponse(1L, "Juan", JUAN_EMAIL, LocalDateTime.of(2026, 3, 1, 10, 0)),
                "jwt-login"
        );
        when(authUseCase.login(any(LoginCommand.class))).thenReturn(authResult);
        when(authHttpMapper.toAuthResponse(authResult)).thenReturn(authResponse);

        MvcResult mvcResult = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validLoginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        ArgumentCaptor<LoginCommand> commandCaptor = ArgumentCaptor.forClass(LoginCommand.class);
        verify(authUseCase).login(commandCaptor.capture());
        verify(authHttpMapper).toAuthResponse(authResult);
        assertEquals(200, mvcResult.getResponse().getStatus(), ASSERT_MSG);
        assertEquals(JUAN_EMAIL, commandCaptor.getValue().email(), ASSERT_MSG);
        assertEquals("123456", commandCaptor.getValue().password(), ASSERT_MSG);
    }

    @Test
    void login_401_invalidCredentials() throws Exception {
        when(authUseCase.login(any(LoginCommand.class))).thenThrow(
                new ApiException(org.springframework.http.HttpStatus.UNAUTHORIZED, "Credenciales invalidas", "INVALID_CREDENTIALS")
        );
        MvcResult mvcResult = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validLoginRequest)))
                .andExpect(status().isUnauthorized())
                .andReturn();

        verify(authUseCase, atLeastOnce()).login(any(LoginCommand.class));
        verify(authHttpMapper, never()).toAuthResponse(any());
        assertEquals(401, mvcResult.getResponse().getStatus(), ASSERT_MSG);
    }
}


