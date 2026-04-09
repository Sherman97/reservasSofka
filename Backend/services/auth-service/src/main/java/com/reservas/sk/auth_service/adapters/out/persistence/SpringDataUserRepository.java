package com.reservas.sk.auth_service.adapters.out.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

import java.util.Optional;

public interface SpringDataUserRepository extends JpaRepository<UserJpaEntity, Long> {
    Optional<UserJpaEntity> findByEmail(String email);

    boolean existsByEmail(String email);

    @Query("""
            SELECT DISTINCT u
            FROM UserJpaEntity u
            WHERE (:query = ''
                OR LOWER(u.username) LIKE LOWER(CONCAT('%', :query, '%'))
                OR LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%')))
              AND NOT EXISTS (
                SELECT r
                FROM u.roles r
                WHERE UPPER(r.name) = 'ADMIN'
              )
            ORDER BY u.username ASC
            """)
    List<UserJpaEntity> findNonAdminUsers(@Param("query") String query);
}





