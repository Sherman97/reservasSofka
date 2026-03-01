package com.reservas.sk.bookings_service.adapters.in.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.reservas.sk.bookings_service.adapters.in.web.dto.CreateReservationRequest;
import com.reservas.sk.bookings_service.application.port.in.BookingUseCase;
import com.reservas.sk.bookings_service.application.port.out.TokenPort;
import com.reservas.sk.bookings_service.application.usecase.CreateReservationCommand;
import com.reservas.sk.bookings_service.domain.model.Reservation;
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

import java.security.Principal;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(value = BookingController.class, excludeAutoConfiguration = {
        org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class,
        org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration.class
})
@AutoConfigureMockMvc(addFilters = false)
@Import(BookingControllerTest.TestConfig.class)
class BookingControllerTest {
    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private BookingUseCase bookingUseCase;
    @Autowired
    private BookingHttpMapper bookingHttpMapper;

    private CreateReservationRequest validRequest;

    @TestConfiguration
    static class TestConfig {
        @Bean
        public BookingUseCase bookingUseCase() {
            return Mockito.mock(BookingUseCase.class);
        }
        @Bean
        public BookingHttpMapper bookingHttpMapper() {
            return Mockito.mock(BookingHttpMapper.class);
        }
        @Bean
        public TokenPort tokenPort() {
            return Mockito.mock(TokenPort.class);
        }
    }

    @BeforeEach
    void setUp() {
        validRequest = new CreateReservationRequest(1L, "2026-03-01T10:00:00Z", "2026-03-01T12:00:00Z", "Reserva", 2, null, List.of());
        // Ya no es necesario mockear Authentication ni SecurityContextHolder
    }

    @Test
    void createReservation_201_payloadOk() throws Exception {
        Reservation reservation = Mockito.mock(Reservation.class);
        when(bookingUseCase.createReservation(any(CreateReservationCommand.class))).thenReturn(reservation);
        when(bookingHttpMapper.toResponse(any(Reservation.class))).thenReturn(null); // Simplificado

        mockMvc.perform(post("/bookings/reservations")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validRequest))
                .principal((Principal) () -> "1")) // Principal dummy, Spring Security poblará el @AuthenticationPrincipal
                .andExpect(status().isCreated());
    }

    @Test
    void createReservation_400_validacionDTO() throws Exception {
        CreateReservationRequest invalidRequest = new CreateReservationRequest(null, "", "", null, null, null, null);
        mockMvc.perform(post("/bookings/reservations")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());
    }
}
