package com.reservas.sk.bookings_service.adapters.in.web;

import com.reservas.sk.bookings_service.adapters.in.web.dto.*;
import com.reservas.sk.bookings_service.application.port.in.BookingUseCase;
import com.reservas.sk.bookings_service.application.usecase.AuthenticatedUser;
import com.reservas.sk.bookings_service.application.usecase.CheckSpaceAvailabilityQuery;
import com.reservas.sk.bookings_service.application.usecase.CreateReservationCommand;
import com.reservas.sk.bookings_service.application.usecase.ListReservationsQuery;
import com.reservas.sk.bookings_service.exception.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/bookings")
public class BookingController {
    private final BookingUseCase bookingUseCase;
    private final BookingHttpMapper mapper;

    public BookingController(BookingUseCase bookingUseCase, BookingHttpMapper mapper) {
        this.bookingUseCase = bookingUseCase;
        this.mapper = mapper;
    }

    @GetMapping("/spaces/{spaceId}/availability")
    public ApiResponse<SpaceAvailabilityResponse> checkAvailability(@PathVariable Long spaceId,
                                                                    @RequestParam String startAt,
                                                                    @RequestParam String endAt) {
        var availability = bookingUseCase.checkAvailability(new CheckSpaceAvailabilityQuery(spaceId, startAt, endAt));
        return ApiResponse.success(mapper.toAvailabilityResponse(availability));
    }

    @PostMapping("/reservations")
    public ResponseEntity<ApiResponse<ReservationResponse>> createReservation(@RequestBody CreateReservationRequest request,
                                                                              Authentication authentication) {
        AuthenticatedUser user = requireAuthenticatedUser(authentication);
        var reservation = bookingUseCase.createReservation(new CreateReservationCommand(
                user.userId(),
                request.spaceId(),
                request.startAt(),
                request.endAt(),
                request.title(),
                request.attendeesCount(),
                request.notes(),
                request.equipmentIds()
        ));

        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(mapper.toResponse(reservation)));
    }

    @GetMapping("/reservations")
    public ApiResponse<List<ReservationResponse>> listReservations(@RequestParam(required = false) Long userId,
                                                                   @RequestParam(required = false) Long spaceId,
                                                                   @RequestParam(required = false) String status) {
        var reservations = bookingUseCase.listReservations(new ListReservationsQuery(userId, spaceId, status));
        return ApiResponse.success(reservations.stream().map(mapper::toResponse).toList());
    }

    @GetMapping("/reservations/{id}")
    public ApiResponse<ReservationResponse> getById(@PathVariable Long id) {
        return ApiResponse.success(mapper.toResponse(bookingUseCase.getReservationById(id)));
    }

    @PatchMapping("/reservations/{id}/cancel")
    public ApiResponse<ReservationResponse> cancel(@PathVariable Long id,
                                                   @RequestBody(required = false) CancelReservationRequest request) {
        String reason = request == null ? null : request.reason();
        return ApiResponse.success(mapper.toResponse(bookingUseCase.cancelReservation(id, reason)));
    }

    private AuthenticatedUser requireAuthenticatedUser(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof AuthenticatedUser user)) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        return user;
    }
}






