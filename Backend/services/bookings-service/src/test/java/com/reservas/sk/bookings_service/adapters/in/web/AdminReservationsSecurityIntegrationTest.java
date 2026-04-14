package com.reservas.sk.bookings_service.adapters.in.web;

import com.reservas.sk.bookings_service.application.port.in.BookingUseCase;
import com.reservas.sk.bookings_service.application.port.out.TokenPort;
import com.reservas.sk.bookings_service.application.service.CheckInReservationUseCase;
import com.reservas.sk.bookings_service.application.usecase.AuthenticatedUser;
import com.reservas.sk.bookings_service.exception.GlobalExceptionHandler;
import com.reservas.sk.bookings_service.infrastructure.config.SecurityConfig;
import com.reservas.sk.bookings_service.infrastructure.security.JwtAuthenticationFilter;
import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Set;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@Tag("integration")
@WebMvcTest(BookingController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class, GlobalExceptionHandler.class, BookingHttpMapper.class})
class AdminReservationsSecurityIntegrationTest {
    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TokenPort tokenPort;

    @MockBean
    private BookingUseCase bookingUseCase;

    @MockBean
    private CheckInReservationUseCase checkInUseCase;

    @Test
    void adminReservationsEndpoint_allowsAdminAndRejectsNonAdmin() throws Exception {
        when(tokenPort.parse("user-token"))
                .thenReturn(new AuthenticatedUser(10L, "user@test.com", Set.of("USER")));
        when(tokenPort.parse("admin-token"))
                .thenReturn(new AuthenticatedUser(1L, "admin@test.com", Set.of("ADMIN")));
        when(tokenPort.parse("bad-token"))
                .thenThrow(new JwtException("invalid"));
        when(bookingUseCase.listAdminReservations(any())).thenReturn(List.of());

        mockMvc.perform(get("/bookings/admin/reservations")
                        .header("Authorization", "Bearer user-token"))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/bookings/admin/reservations")
                        .header("Authorization", "Bearer admin-token"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/bookings/admin/reservations")
                        .header("Authorization", "Bearer bad-token"))
                .andExpect(status().isUnauthorized());
    }
}
