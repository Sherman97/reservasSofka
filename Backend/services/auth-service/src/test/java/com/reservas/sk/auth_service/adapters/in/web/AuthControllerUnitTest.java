package com.reservas.sk.auth_service.adapters.in.web;

import com.reservas.sk.auth_service.application.port.in.AuthUseCase;
import com.reservas.sk.auth_service.application.usecase.AuthenticatedUser;
import com.reservas.sk.auth_service.domain.model.User;
import com.reservas.sk.auth_service.exception.ApiException;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AuthControllerUnitTest {
    private static final String ASSERT_MSG = "PMD UnitTestAssertionsShouldIncludeMessage";

    @Test
    void me_throwsUnauthorizedWhenAuthenticationIsNull() {
        AuthController controller = new AuthController(mock(AuthUseCase.class), mock(AuthHttpMapper.class));

        ApiException ex = assertThrows(ApiException.class, () -> controller.me(null));

        assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatus(), ASSERT_MSG);
        assertEquals("UNAUTHORIZED", ex.getErrorCode(), ASSERT_MSG);
    }

    @Test
    void me_throwsUnauthorizedWhenPrincipalTypeIsInvalid() {
        AuthController controller = new AuthController(mock(AuthUseCase.class), mock(AuthHttpMapper.class));
        Authentication authentication = new UsernamePasswordAuthenticationToken("plain-user", null);

        ApiException ex = assertThrows(ApiException.class, () -> controller.me(authentication));

        assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatus(), ASSERT_MSG);
        assertEquals("UNAUTHORIZED", ex.getErrorCode(), ASSERT_MSG);
    }

    @Test
    void me_returnsMappedUserWhenPrincipalIsAuthenticatedUser() {
        AuthUseCase authUseCase = mock(AuthUseCase.class);
        AuthHttpMapper mapper = mock(AuthHttpMapper.class);
        AuthController controller = new AuthController(authUseCase, mapper);

        Authentication authentication = new UsernamePasswordAuthenticationToken(
                new AuthenticatedUser(7L, "juan@email.com"),
                null
        );
        User user = new User(7L, "Juan", "juan@email.com", "hash", LocalDateTime.now());
        com.reservas.sk.auth_service.adapters.in.web.dto.UserResponse response =
                new com.reservas.sk.auth_service.adapters.in.web.dto.UserResponse(
                        7L,
                        "Juan",
                        "juan@email.com",
                        LocalDateTime.now()
                );
        when(authUseCase.getMe(7L)).thenReturn(user);
        when(mapper.toUserResponse(user)).thenReturn(response);

        var result = controller.me(authentication);

        assertNotNull(result.data(), ASSERT_MSG);
        assertEquals(7L, result.data().id(), ASSERT_MSG);
        verify(authUseCase).getMe(7L);
    }
}
