package com.reservas.sk.bookings_service.adapters.in.web;

import com.reservas.sk.bookings_service.adapters.in.web.dto.ApiResponse;
import com.reservas.sk.bookings_service.adapters.in.web.dto.AdminReservationResponse;
import com.reservas.sk.bookings_service.adapters.in.web.dto.AdminReservationsPageResponse;
import com.reservas.sk.bookings_service.adapters.in.web.dto.CancelReservationRequest;
import com.reservas.sk.bookings_service.adapters.in.web.dto.CreateReservationRequest;
import com.reservas.sk.bookings_service.adapters.in.web.dto.UpdateReservationRequest;
import com.reservas.sk.bookings_service.adapters.in.web.dto.HandoverReservationRequest;
import com.reservas.sk.bookings_service.adapters.in.web.dto.ReservationResponse;
import com.reservas.sk.bookings_service.adapters.in.web.dto.SpaceAvailabilityResponse;
import com.reservas.sk.bookings_service.application.port.in.BookingUseCase;
import com.reservas.sk.bookings_service.application.usecase.AuthenticatedUser;
import com.reservas.sk.bookings_service.application.usecase.CheckSpaceAvailabilityQuery;
import com.reservas.sk.bookings_service.application.usecase.CreateReservationCommand;
import com.reservas.sk.bookings_service.application.usecase.UpdateReservationCommand;
import com.reservas.sk.bookings_service.application.usecase.HandoverReservationCommand;
import com.reservas.sk.bookings_service.application.usecase.ListReservationsQuery;
import com.reservas.sk.bookings_service.application.usecase.AdminListReservationsQuery;
import com.reservas.sk.bookings_service.exception.ApiException;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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
    // Human Check 🛡️: se usa @Valid para activar validaciones de entrada y responder 400 de forma consistente.
    public ResponseEntity<ApiResponse<ReservationResponse>> createReservation(@Valid @RequestBody CreateReservationRequest request,
                                                                              @AuthenticationPrincipal AuthenticatedUser user) {
        Long effectiveUserId = resolveEffectiveUserId(user, request.targetUserId());
        var reservation = bookingUseCase.createReservation(new CreateReservationCommand(
                effectiveUserId,
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

    @GetMapping("/admin/reservations")
    public ApiResponse<AdminReservationsPageResponse> listAdminReservations(
            @RequestParam(required = false) String desde,
            @RequestParam(required = false) String hasta,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) Long usuario,
            @RequestParam(required = false) Long sede,
            @RequestParam(required = false, defaultValue = "0") Integer page,
            @RequestParam(required = false, defaultValue = "20") Integer size) {
        var normalizedQuery = new AdminListReservationsQuery(
                desde,
                hasta,
                estado,
                usuario,
                sede,
                page,
                size
        );
        var reservations = bookingUseCase.listAdminReservations(normalizedQuery);
        long totalItems = bookingUseCase.countAdminReservations(normalizedQuery);
        int safeSize = size == null || size <= 0 ? 20 : size;
        int safePage = page == null || page < 0 ? 0 : page;
        int totalPages = totalItems == 0 ? 0 : (int) Math.ceil((double) totalItems / safeSize);

        return ApiResponse.success(new AdminReservationsPageResponse(
                reservations.stream().map(mapper::toAdminResponse).toList(),
                safePage,
                safeSize,
                totalItems,
                totalPages
        ));
    }

    @PutMapping("/reservations/{id}")
    public ResponseEntity<ApiResponse<ReservationResponse>> updateReservation(@PathVariable Long id,
                                                                              @Valid @RequestBody UpdateReservationRequest request,
                                                                              @AuthenticationPrincipal AuthenticatedUser user) {
        var reservation = bookingUseCase.updateReservation(new UpdateReservationCommand(
                id,
                user.userId(),
                request.title(),
                request.startAt(),
                request.endAt(),
                request.attendeesCount(),
                request.notes()
        ));

        return ResponseEntity.ok(ApiResponse.success(mapper.toResponse(reservation)));
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

    @PatchMapping("/reservations/{id}/deliver")
    public ApiResponse<ReservationResponse> deliver(@PathVariable Long id,
                                                    @RequestBody(required = false) HandoverReservationRequest request,
                                                    @AuthenticationPrincipal AuthenticatedUser user) {
        String novelty = request == null ? null : request.novelty();
        return ApiResponse.success(mapper.toResponse(bookingUseCase.deliverReservation(
                new HandoverReservationCommand(id, user.userId(), novelty)
        )));
    }

    @PatchMapping("/reservations/{id}/return")
    public ApiResponse<ReservationResponse> markReturned(@PathVariable Long id,
                                                         @RequestBody(required = false) HandoverReservationRequest request,
                                                         @AuthenticationPrincipal AuthenticatedUser user) {
        String novelty = request == null ? null : request.novelty();
        return ApiResponse.success(mapper.toResponse(bookingUseCase.returnReservation(
                new HandoverReservationCommand(id, user.userId(), novelty)
        )));
    }

    private Long resolveEffectiveUserId(AuthenticatedUser user, Long targetUserId) {
        if (targetUserId == null) {
            return user.userId();
        }
        if (user.hasRole("ADMIN")) {
            return targetUserId;
        }
        if (!user.userId().equals(targetUserId)) {
            throw new ApiException(HttpStatus.FORBIDDEN,
                    "No tiene permisos para crear reservas para otros usuarios",
                    "FORBIDDEN_TARGET_USER");
        }
        return user.userId();
    }
}
