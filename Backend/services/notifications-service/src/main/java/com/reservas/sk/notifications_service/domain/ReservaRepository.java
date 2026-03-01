package com.reservas.sk.notifications_service.domain;

import java.util.Optional;

public interface ReservaRepository {
    Optional<Reserva> findById(Long id);
}

