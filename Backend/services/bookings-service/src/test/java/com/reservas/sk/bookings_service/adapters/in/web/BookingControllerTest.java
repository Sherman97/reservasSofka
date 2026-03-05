package com.reservas.sk.bookings_service.adapters.in.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.reservas.sk.bookings_service.adapters.in.web.dto.CreateReservationRequest;
import com.reservas.sk.bookings_service.adapters.in.web.dto.ReservationResponse;
import com.reservas.sk.bookings_service.application.port.in.BookingUseCase;
import com.reservas.sk.bookings_service.application.port.out.TokenPort;
import com.reservas.sk.bookings_service.application.usecase.CreateReservationCommand;
import com.reservas.sk.bookings_service.domain.model.Reservation;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.security.Principal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(value = BookingController.class, excludeAutoConfiguration = {
        org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class,
        org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration.class
})
@AutoConfigureMockMvc(addFilters = false)
@Import(BookingControllerTest.MockBeansConfig.class)
class BookingControllerTest {
    private static final String ASSERT_MSG = "PMD UnitTestAssertionsShouldIncludeMessage";
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
    static class MockBeansConfig {
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
        reset(bookingUseCase, bookingHttpMapper);
        validRequest = new CreateReservationRequest(1L, "2026-03-01T10:00:00Z", "2026-03-01T12:00:00Z", "Reserva", 2, null, List.of());
    }

    @Test
    void createReservation_201_payloadOk() throws Exception {
        Reservation reservation = Mockito.mock(Reservation.class);
        ReservationResponse response = new ReservationResponse(
                20L, 1L, 1L, "2026-03-01T10:00:00Z", "2026-03-01T12:00:00Z",
                "confirmed", "Reserva", 2, null, null, "2026-03-01T09:00:00Z", List.of()
        );
        when(bookingUseCase.createReservation(any(CreateReservationCommand.class))).thenReturn(reservation);
        when(bookingHttpMapper.toResponse(reservation)).thenReturn(response);

        MvcResult mvcResult = mockMvc.perform(post("/bookings/reservations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest))
                        .principal((Principal) () -> "1"))
                .andExpect(status().isCreated())
                .andReturn();

        ArgumentCaptor<CreateReservationCommand> commandCaptor = ArgumentCaptor.forClass(CreateReservationCommand.class);
        verify(bookingUseCase).createReservation(commandCaptor.capture());
        verify(bookingHttpMapper).toResponse(reservation);
        assertEquals(201, mvcResult.getResponse().getStatus(), ASSERT_MSG);
        assertEquals(1L, commandCaptor.getValue().spaceId(), ASSERT_MSG);
        assertEquals("Reserva", commandCaptor.getValue().title(), ASSERT_MSG);
    }

    @Test
    void createReservation_400_validacionDTO() throws Exception {
        CreateReservationRequest invalidRequest = new CreateReservationRequest(null, "", "", null, null, null, null);
        MvcResult mvcResult = mockMvc.perform(post("/bookings/reservations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andReturn();

        verify(bookingUseCase, never()).createReservation(any(CreateReservationCommand.class));
        verify(bookingHttpMapper, never()).toResponse(any());
        assertEquals(400, mvcResult.getResponse().getStatus(), ASSERT_MSG);
    }
}


