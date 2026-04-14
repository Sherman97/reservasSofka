package com.reservas.sk.bookings_service.adapters.in.web.dto;

import java.util.List;

public record AdminReservationsPageResponse(List<AdminReservationResponse> items,
                                            Integer page,
                                            Integer size,
                                            Long totalItems,
                                            Integer totalPages) {
}

