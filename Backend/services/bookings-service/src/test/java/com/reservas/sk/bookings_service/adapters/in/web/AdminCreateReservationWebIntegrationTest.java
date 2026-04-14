package com.reservas.sk.bookings_service.adapters.in.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.reservas.sk.bookings_service.application.port.out.BookingPersistencePort;
import com.reservas.sk.bookings_service.application.port.out.ReservationEventPublisherPort;
import com.reservas.sk.bookings_service.application.port.out.TokenPort;
import com.reservas.sk.bookings_service.application.service.BookingApplicationService;
import com.reservas.sk.bookings_service.application.usecase.AuthenticatedUser;
import com.reservas.sk.bookings_service.application.service.CheckInReservationUseCase;
import com.reservas.sk.bookings_service.exception.GlobalExceptionHandler;
import com.reservas.sk.bookings_service.infrastructure.config.SecurityConfig;
import com.reservas.sk.bookings_service.infrastructure.security.JwtAuthenticationFilter;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;
import java.util.Set;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@Tag("integration")
@WebMvcTest(BookingController.class)
@Import({
        SecurityConfig.class,
        JwtAuthenticationFilter.class,
        GlobalExceptionHandler.class,
        BookingHttpMapper.class,
        BookingApplicationService.class
})
class AdminCreateReservationWebIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private TokenPort tokenPort;

    @MockBean
    private CheckInReservationUseCase checkInUseCase;

    @MockBean
    private BookingPersistencePort bookingPersistencePort;

    @MockBean
    private ReservationEventPublisherPort reservationEventPublisherPort;

    @Test
    void shouldReturn409WithExactConflictMessageOnCreateReservationEndpoint() throws Exception {
        when(tokenPort.parse("admin-token"))
                .thenReturn(new AuthenticatedUser(1L, "admin@test.com", Set.of("ADMIN")));
        when(bookingPersistencePort.userExists(22L)).thenReturn(true);
        when(bookingPersistencePort.findSpaceCityId(5L)).thenReturn(Optional.of(10L));
        when(bookingPersistencePort.acquireSpaceReservationLock(5L, 5)).thenReturn(true);
        when(bookingPersistencePort.countOverlappingReservations(anyLong(), any(), any())).thenReturn(1);

        mockMvc.perform(post("/bookings/reservations")
                        .header("Authorization", "Bearer admin-token")
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateReservationBody(
                                5L,
                                "2026-03-01T10:00:00Z",
                                "2026-03-01T11:00:00Z",
                                "Reserva admin",
                                22L
                        ))))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message")
                        .value("El espacio seleccionado ya se encuentra reservado en este horario"))
                .andExpect(jsonPath("$.errorCode").value("SPACE_ALREADY_RESERVED"));

        verify(bookingPersistencePort, never())
                .insertReservation(anyLong(), anyLong(), any(), any(), anyString(), any(), any(), any());
    }

    @Test
    void shouldReturn403WhenNonAdminTriesToCreateReservationForAnotherUser() throws Exception {
        when(tokenPort.parse("user-token"))
                .thenReturn(new AuthenticatedUser(9L, "user@test.com", Set.of("USER")));

        mockMvc.perform(post("/bookings/reservations")
                        .header("Authorization", "Bearer user-token")
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateReservationBody(
                                5L,
                                "2026-03-01T10:00:00Z",
                                "2026-03-01T11:00:00Z",
                                "Reserva no permitida",
                                22L
                        ))))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("No tiene permisos para crear reservas para otros usuarios"))
                .andExpect(jsonPath("$.errorCode").value("FORBIDDEN_TARGET_USER"));
    }

    private record CreateReservationBody(
            Long spaceId,
            String startAt,
            String endAt,
            String title,
            Long targetUserId
    ) {
    }
}
