package com.reservas.sk.bookings_service.adapters.in.web.dto;

public record AdminReservationResponse(Long id,
                                       Long userId,
                                       String userName,
                                       String userEmail,
                                       Long spaceId,
                                       String spaceName,
                                       Long siteId,
                                       String siteName,
                                       String startAt,
                                       String endAt,
                                       String status,
                                       Integer attendeesCount,
                                       String notes) {
}

