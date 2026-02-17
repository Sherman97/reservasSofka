package com.reservas.sk.auth_service.adapters.out.persistence;

import com.reservas.sk.auth_service.application.port.out.UserPersistencePort;
import com.reservas.sk.auth_service.domain.model.User;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class UserPersistenceAdapter implements UserPersistencePort {
    private final SpringDataUserRepository repository;

    public UserPersistenceAdapter(SpringDataUserRepository repository) {
        this.repository = repository;
    }

    @Override
    public boolean existsByEmail(String email) {
        return repository.existsByEmail(email);
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return repository.findByEmail(email).map(this::toDomain);
    }

    @Override
    public Optional<User> findById(Long id) {
        return repository.findById(id).map(this::toDomain);
    }

    @Override
    public User save(String name, String email, String passwordHash) {
        UserJpaEntity entity = new UserJpaEntity();
        entity.setUsername(name);
        entity.setEmail(email);
        entity.setPasswordHash(passwordHash);

        UserJpaEntity saved = repository.save(entity);
        UserJpaEntity hydrated = repository.findById(saved.getId()).orElse(saved);
        return toDomain(hydrated);
    }

    private User toDomain(UserJpaEntity entity) {
        return new User(
                entity.getId(),
                entity.getUsername(),
                entity.getEmail(),
                entity.getPasswordHash(),
                entity.getCreatedAt()
        );
    }
}





