package com.reservas.sk.locations_service.adapters.out.persistence;

import com.reservas.sk.locations_service.domain.model.City;
import com.reservas.sk.locations_service.domain.model.Space;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.JdbcTest;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@JdbcTest
class JdbcLocationsPersistenceAdapterTest {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private JdbcLocationsPersistenceAdapter adapter;

    @BeforeEach
    void setUp() {
        adapter = new JdbcLocationsPersistenceAdapter(jdbcTemplate);

        jdbcTemplate.execute("DROP TABLE IF EXISTS spaces");
        jdbcTemplate.execute("DROP TABLE IF EXISTS cities");

        jdbcTemplate.execute("""
                CREATE TABLE cities (
                    id BIGINT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(120) NOT NULL,
                    country VARCHAR(120) NOT NULL,
                    created_at TIMESTAMP NULL,
                    updated_at TIMESTAMP NULL
                )
                """);

        jdbcTemplate.execute("""
                CREATE TABLE spaces (
                    id BIGINT AUTO_INCREMENT PRIMARY KEY,
                    city_id BIGINT NOT NULL,
                    name VARCHAR(120) NOT NULL,
                    capacity INT,
                    floor VARCHAR(30),
                    description VARCHAR(255),
                    image_url VARCHAR(255),
                    is_active BOOLEAN NOT NULL,
                    created_at TIMESTAMP NULL,
                    updated_at TIMESTAMP NULL
                )
                """);
    }

    @Test
    void cityCrud_insertFindUpdateDeleteAndExists() {
        long cityId = adapter.insertCity("Bogotá", "Colombia");
        assertThat(cityId).isPositive();
        assertThat(adapter.existsCity(cityId)).isTrue();

        Optional<City> created = adapter.findCityById(cityId);
        assertThat(created).isPresent();
        assertThat(created.get().getName()).isEqualTo("Bogotá");
        assertThat(created.get().getCountry()).isEqualTo("Colombia");

        adapter.updateCity(cityId, "Bogotá D.C.", null);
        Optional<City> updated = adapter.findCityById(cityId);
        assertThat(updated).isPresent();
        assertThat(updated.get().getName()).isEqualTo("Bogotá D.C.");
        assertThat(updated.get().getCountry()).isEqualTo("Colombia");

        List<City> cities = adapter.listCities();
        assertThat(cities).extracting(City::getId).contains(cityId);

        int deleted = adapter.deleteCity(cityId);
        assertThat(deleted).isEqualTo(1);
        assertThat(adapter.findCityById(cityId)).isEmpty();
        assertThat(adapter.existsCity(cityId)).isFalse();
    }

    @Test
    void spaceCrudAndFilters_listSpacesByCityAndActiveOnly() {
        long city1 = adapter.insertCity("Bogotá", "Colombia");
        long city2 = adapter.insertCity("Medellín", "Colombia");

        long space1 = adapter.insertSpace(city1, "Sala A", 10, "1", "Principal", null, true);
        long space2 = adapter.insertSpace(city1, "Sala B", 8, "2", "Secundaria", null, false);
        long space3 = adapter.insertSpace(city2, "Sala C", 12, "3", "Remota", null, true);

        Optional<Space> found = adapter.findSpaceById(space1);
        assertThat(found).isPresent();
        assertThat(found.get().getCityId()).isEqualTo(city1);
        assertThat(found.get().isActive()).isTrue();

        adapter.updateSpace(space2, "Sala B2", 9, null, null, null, true);
        Optional<Space> updated = adapter.findSpaceById(space2);
        assertThat(updated).isPresent();
        assertThat(updated.get().getName()).isEqualTo("Sala B2");
        assertThat(updated.get().getCapacity()).isEqualTo(9);
        assertThat(updated.get().isActive()).isTrue();

        List<Space> byCity = adapter.listSpaces(city1, null);
        assertThat(byCity).hasSize(2);
        assertThat(byCity).extracting(Space::getCityId).containsOnly(city1);

        List<Space> activeByCity = adapter.listSpaces(city1, true);
        assertThat(activeByCity).hasSize(2);
        assertThat(activeByCity).allMatch(Space::isActive);

        List<Space> activeGlobal = adapter.listSpaces(null, true);
        assertThat(activeGlobal).hasSize(3);
        assertThat(activeGlobal).allMatch(Space::isActive);

        int deleted = adapter.deleteSpace(space3);
        assertThat(deleted).isEqualTo(1);
        assertThat(adapter.findSpaceById(space3)).isEmpty();
    }
}
