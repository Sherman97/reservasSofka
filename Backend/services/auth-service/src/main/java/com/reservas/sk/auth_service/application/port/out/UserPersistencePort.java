package com.reservas.sk.auth_service.application.port.out;

import com.reservas.sk.auth_service.domain.model.User;

import java.util.Optional;

public interface UserPersistencePort {
    boolean existsByEmail(String email);

    Optional<User> findByEmail(String email);

    Optional<User> findById(Long id);

    User save(String name, String email, String passwordHash);
}





