package com.reservas.sk.auth_service.adapters.out.persistence;

import com.reservas.sk.auth_service.domain.model.User;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.TestPropertySource;

import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

@Tag("integration")
@DataJpaTest
@Import(UserPersistenceAdapter.class)
@TestPropertySource(properties = "spring.jpa.hibernate.ddl-auto=create-drop")
class UserPersistenceAdapterTest {

    @Autowired
    private UserPersistenceAdapter adapter;
    @Autowired
    private SpringDataUserRepository userRepository;
    @Autowired
    private SpringDataRoleRepository roleRepository;

    @Test
    void saveYFindYExists_operanCorrectamente() {
        ensureUserRole();
        User saved = adapter.save("Juan", "juan@email.com", "hash-123");

        assertThat(saved.getId()).isNotNull();
        assertThat(adapter.existsByEmail("juan@email.com")).isTrue();

        Optional<User> byEmail = adapter.findByEmail("juan@email.com");
        assertThat(byEmail).isPresent();
        assertThat(byEmail.get().getId()).isEqualTo(saved.getId());
    }

    @Test
    void findByEmailYExists_retornaVacioCuandoNoExiste() {
        assertThat(adapter.existsByEmail("missing@email.com")).isFalse();
        assertThat(adapter.findByEmail("missing@email.com")).isEmpty();
    }

    @Test
    void listNonAdminUsers_excluyeAdmins_yPermiteFiltrarPorTexto() {
        RoleJpaEntity userRole = ensureRole("USER", "Rol base");
        RoleJpaEntity adminRole = ensureRole("ADMIN", "Rol administrador");

        UserJpaEntity user = new UserJpaEntity();
        user.setUsername("Laura User");
        user.setEmail("laura@demo.com");
        user.setPasswordHash("hash-user");
        user.setRoles(Set.of(userRole));
        userRepository.save(user);

        UserJpaEntity admin = new UserJpaEntity();
        admin.setUsername("Carlos Admin");
        admin.setEmail("carlos.admin@demo.com");
        admin.setPasswordHash("hash-admin");
        admin.setRoles(Set.of(adminRole));
        userRepository.save(admin);

        var allNonAdmins = adapter.listNonAdminUsers("");
        assertThat(allNonAdmins).extracting(User::getEmail).contains("laura@demo.com");
        assertThat(allNonAdmins).extracting(User::getEmail).doesNotContain("carlos.admin@demo.com");

        var filtered = adapter.listNonAdminUsers("laura");
        assertThat(filtered).hasSize(1);
        assertThat(filtered.get(0).getEmail()).isEqualTo("laura@demo.com");
    }

    private void ensureUserRole() {
        ensureRole("USER", "Rol base para pruebas");
    }

    private RoleJpaEntity ensureRole(String name, String description) {
        var existing = roleRepository.findByName(name);
        if (existing.isPresent()) {
            return existing.get();
        }
        RoleJpaEntity role = new RoleJpaEntity();
        role.setName(name);
        role.setDescription(description);
        return roleRepository.save(role);
    }
}
