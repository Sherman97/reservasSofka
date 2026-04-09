package com.reservas.sk.auth_service.adapters.out.persistence;

import com.reservas.sk.auth_service.application.port.out.UserPersistencePort;
import com.reservas.sk.auth_service.domain.model.User;
import com.reservas.sk.auth_service.exception.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class UserPersistenceAdapter implements UserPersistencePort {
    private final SpringDataUserRepository repository;
    private final SpringDataRoleRepository roleRepository;

    public UserPersistenceAdapter(SpringDataUserRepository repository,
                                  SpringDataRoleRepository roleRepository) {
        this.repository = repository;
        this.roleRepository = roleRepository;
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
        RoleJpaEntity userRole = roleRepository.findByName("USER")
                .orElseThrow(() -> new ApiException(
                        HttpStatus.INTERNAL_SERVER_ERROR,
                        "Rol USER no configurado",
                        "ROLE_NOT_CONFIGURED"
                ));
        entity.setRoles(Set.of(userRole));

        UserJpaEntity saved = repository.save(entity);
        UserJpaEntity hydrated = repository.findById(saved.getId()).orElse(saved);
        return toDomain(hydrated);
    }

    @Override
    public List<User> listNonAdminUsers(String query) {
        String normalizedQuery = query == null ? "" : query.trim();
        return repository.findNonAdminUsers(normalizedQuery).stream()
                .map(this::toDomain)
                .toList();
    }

    private User toDomain(UserJpaEntity entity) {
        return new User(
                entity.getId(),
                entity.getUsername(),
                entity.getEmail(),
                entity.getPasswordHash(),
                entity.getCreatedAt(),
                entity.getRoles().stream()
                        .map(RoleJpaEntity::getName)
                        .map(role -> role.toUpperCase(Locale.ROOT))
                        .collect(Collectors.toUnmodifiableSet())
        );
    }
}





