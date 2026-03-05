package com.reservas.sk.auth_service.adapters.out.persistence;

import com.reservas.sk.auth_service.domain.model.User;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.TestPropertySource;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@Tag("integration")
@DataJpaTest
@Import(UserPersistenceAdapter.class)
@TestPropertySource(properties = "spring.jpa.hibernate.ddl-auto=create-drop")
class UserPersistenceAdapterTest {

    @Autowired
    private UserPersistenceAdapter adapter;

    @Test
    void saveYFindYExists_operanCorrectamente() {
        User saved = adapter.save("Juan", "juan@email.com", "hash-123");

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getName()).isEqualTo("Juan");
        assertThat(saved.getEmail()).isEqualTo("juan@email.com");
        assertThat(saved.getPasswordHash()).isEqualTo("hash-123");

        assertThat(adapter.existsByEmail("juan@email.com")).isTrue();

        Optional<User> byEmail = adapter.findByEmail("juan@email.com");
        assertThat(byEmail).isPresent();
        assertThat(byEmail.get().getId()).isEqualTo(saved.getId());
        assertThat(byEmail.get().getName()).isEqualTo("Juan");

        Optional<User> byId = adapter.findById(saved.getId());
        assertThat(byId).isPresent();
        assertThat(byId.get().getEmail()).isEqualTo("juan@email.com");
    }

    @Test
    void findByEmailYExists_retornaVacioCuandoNoExiste() {
        assertThat(adapter.existsByEmail("missing@email.com")).isFalse();
        assertThat(adapter.findByEmail("missing@email.com")).isEmpty();
    }
}
