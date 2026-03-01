package com.reservas.sk.auth_service.adapters.in.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.reservas.sk.auth_service.adapters.in.web.dto.RegisterRequest;
import com.reservas.sk.auth_service.adapters.in.web.dto.LoginRequest;
import com.reservas.sk.auth_service.application.port.in.AuthUseCase;
import com.reservas.sk.auth_service.application.usecase.AuthResult;
import com.reservas.sk.auth_service.application.usecase.LoginCommand;
import com.reservas.sk.auth_service.application.usecase.RegisterCommand;
import com.reservas.sk.auth_service.exception.ApiException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(value = AuthController.class, excludeAutoConfiguration = {
        org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class,
        org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration.class
})
@AutoConfigureMockMvc(addFilters = false)
@Import(AuthControllerTest.TestConfig.class)
class AuthControllerTest {
    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private AuthUseCase authUseCase;
    @Autowired
    private AuthHttpMapper authHttpMapper;

    private RegisterRequest validRegisterRequest;
    private LoginRequest validLoginRequest;

    @TestConfiguration
    static class TestConfig {
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
        validRegisterRequest = new RegisterRequest("Juan", "juan@email.com", "123456");
        validLoginRequest = new LoginRequest("juan@email.com", "123456");
    }

    @Test
    void register_201_payloadOk() throws Exception {
        when(authUseCase.register(any(RegisterCommand.class))).thenReturn(Mockito.mock(AuthResult.class));
        when(authHttpMapper.toAuthResponse(any())).thenReturn(null); // Simplificado

        mockMvc.perform(post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validRegisterRequest)))
                .andExpect(status().isCreated());
    }

    @Test
    void register_400_validacionDTO() throws Exception {
        RegisterRequest invalidRequest = new RegisterRequest("", "", "");
        mockMvc.perform(post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void login_200_payloadOk() throws Exception {
        when(authUseCase.login(any(LoginCommand.class))).thenReturn(Mockito.mock(AuthResult.class));
        when(authHttpMapper.toAuthResponse(any())).thenReturn(null); // Simplificado

        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validLoginRequest)))
                .andExpect(status().isOk());
    }

    @Test
    void login_401_invalidCredentials() throws Exception {
        when(authUseCase.login(any(LoginCommand.class))).thenThrow(new ApiException(org.springframework.http.HttpStatus.UNAUTHORIZED, "Credenciales inválidas", "INVALID_CREDENTIALS"));
        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validLoginRequest)))
                .andExpect(status().isUnauthorized());
    }
}
