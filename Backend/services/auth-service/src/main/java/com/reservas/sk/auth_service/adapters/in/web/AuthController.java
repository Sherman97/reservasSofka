package com.reservas.sk.auth_service.adapters.in.web;

import com.reservas.sk.auth_service.adapters.in.web.dto.ApiResponse;
import com.reservas.sk.auth_service.adapters.in.web.dto.AuthResponse;
import com.reservas.sk.auth_service.adapters.in.web.dto.LoginRequest;
import com.reservas.sk.auth_service.adapters.in.web.dto.RegisterRequest;
import com.reservas.sk.auth_service.adapters.in.web.dto.UserResponse;
import com.reservas.sk.auth_service.application.port.in.AuthUseCase;
import com.reservas.sk.auth_service.application.usecase.AuthenticatedUser;
import com.reservas.sk.auth_service.application.usecase.LoginCommand;
import com.reservas.sk.auth_service.application.usecase.RegisterCommand;
import com.reservas.sk.auth_service.exception.ApiException;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {
    private final AuthUseCase authUseCase;
    private final AuthHttpMapper mapper;

    public AuthController(AuthUseCase authUseCase, AuthHttpMapper mapper) {
        this.authUseCase = authUseCase;
        this.mapper = mapper;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = mapper.toAuthResponse(
                authUseCase.register(new RegisterCommand(request.name(), request.email(), request.password()))
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = mapper.toAuthResponse(
                authUseCase.login(new LoginCommand(request.email(), request.password()))
        );
        return ApiResponse.success(response);
    }

    @GetMapping("/me")
    public ApiResponse<UserResponse> me(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof AuthenticatedUser principal)) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }

        return ApiResponse.success(mapper.toUserResponse(authUseCase.getMe(principal.userId())));
    }
}





