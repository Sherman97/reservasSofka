package com.reservas.sk.locations_service.adapters.out.persistence;

import com.reservas.sk.locations_service.domain.model.City;
import com.reservas.sk.locations_service.domain.model.Space;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.JdbcTest;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@Tag("integration")
@JdbcTest
class JdbcLocationsPersistenceAdapterTest {
    private static final String COUNTRY = "Colombia";

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
        long cityId = adapter.insertCity("BogotÃƒÂ¡", COUNTRY);
        assertThat(cityId).isPositive();
        assertThat(adapter.existsCity(cityId)).isTrue();


        adapter.updateCity(cityId, "BogotÃƒÂ¡ D.C.", null);
        Optional<City> updated = adapter.findCityById(cityId);
        assertThat(updated.get().getName()).isEqualTo("BogotÃƒÂ¡ D.C.");


        int deleted = adapter.deleteCity(cityId);
        assertThat(deleted).isEqualTo(1);
        assertThat(adapter.existsCity(cityId)).isFalse();
    }

    @Test
    void spaceCrudAndFilters_listSpacesByCityAndActiveOnly() {
        long city1 = adapter.insertCity("BogotÃƒÂ¡", COUNTRY);
        long city2 = adapter.insertCity("MedellÃƒÂ­n", COUNTRY);

        long space1 = adapter.insertSpace(city1, "Sala A", 10, "1", "Principal", null, true);
        long space2 = adapter.insertSpace(city1, "Sala B", 8, "2", "Secundaria", null, false);
        long space3 = adapter.insertSpace(city2, "Sala C", 12, "3", "Remota", null, true);

        Optional<Space> found = adapter.findSpaceById(space1);
        assertThat(found).isPresent();

        adapter.updateSpace(space2, "Sala B2", 9, null, null, null, true);
        Optional<Space> updated = adapter.findSpaceById(space2);
        assertThat(updated.get().isActive()).isTrue();

        List<Space> byCity = adapter.listSpaces(city1, null);
        assertThat(byCity).hasSize(2);


        List<Space> activeGlobal = adapter.listSpaces(null, true);
        assertThat(activeGlobal).hasSize(3);

        int deleted = adapter.deleteSpace(space3);
        assertThat(deleted).isEqualTo(1);
    }

    @Test
    void updateMethods_withNoFields_doNotChangeData() {
        long cityId = adapter.insertCity("Cali", COUNTRY);
        long spaceId = adapter.insertSpace(cityId, "Sala X", 20, "3", "desc", "img", true);

        adapter.updateCity(cityId, null, null);
        adapter.updateSpace(spaceId, null, null, null, null, null, null);

        City city = adapter.findCityById(cityId).orElseThrow();
        Space space = adapter.findSpaceById(spaceId).orElseThrow();

        assertThat(city.getName()).isEqualTo("Cali");
        assertThat(city.getCountry()).isEqualTo(COUNTRY);
        assertThat(space.getName()).isEqualTo("Sala X");
        assertThat(space.getCapacity()).isEqualTo(20);
        assertThat(space.getDescription()).isEqualTo("desc");
    }

    @Test
    void listSpaces_whenActiveOnlyFalse_returnsAllSpacesForCityFilter() {
        long cityId = adapter.insertCity("Barranquilla", COUNTRY);
        adapter.insertSpace(cityId, "Sala 1", 10, "1", null, null, true);
        adapter.insertSpace(cityId, "Sala 2", 8, "2", null, null, false);

        List<Space> allByCity = adapter.listSpaces(cityId, false);

        assertThat(allByCity).hasSize(2);
    }

    @Test
    void findMethods_returnEmptyWhenEntityDoesNotExist() {
        assertThat(adapter.findCityById(999L)).isEmpty();
        assertThat(adapter.findSpaceById(999L)).isEmpty();
    }
}
