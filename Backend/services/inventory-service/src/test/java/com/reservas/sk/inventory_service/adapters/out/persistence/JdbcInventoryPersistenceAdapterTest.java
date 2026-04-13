package com.reservas.sk.inventory_service.adapters.out.persistence;

import com.reservas.sk.inventory_service.domain.model.Equipment;
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
class JdbcInventoryPersistenceAdapterTest {
    private static final String EQUIPMENT_NAME = "Laptop";
    private static final String SERIAL = "SN-11";
    private static final String BARCODE = "BAR-11";
    private static final String STATUS_AVAILABLE = "available";
    private static final String STATUS_MAINTENANCE = "maintenance";

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private JdbcInventoryPersistenceAdapter adapter;

    @BeforeEach
    void setUp() {
        adapter = new JdbcInventoryPersistenceAdapter(jdbcTemplate);

        jdbcTemplate.execute("DROP TABLE IF EXISTS equipments");
        jdbcTemplate.execute("DROP TABLE IF EXISTS cities");

        jdbcTemplate.execute("""
                CREATE TABLE cities (
                    id BIGINT PRIMARY KEY,
                    name VARCHAR(120) NOT NULL
                )
                """);

        jdbcTemplate.execute("""
                CREATE TABLE equipments (
                    id BIGINT AUTO_INCREMENT PRIMARY KEY,
                    city_id BIGINT NOT NULL,
                    name VARCHAR(120) NOT NULL,
                    serial VARCHAR(120),
                    barcode VARCHAR(120),
                    model VARCHAR(120),
                    status VARCHAR(20),
                    notes VARCHAR(255),
                    image_url VARCHAR(255),
                    created_at TIMESTAMP,
                    updated_at TIMESTAMP
                )
                """);

        jdbcTemplate.update("INSERT INTO cities (id, name) VALUES (?, ?)", 1L, "Bogotá");
        jdbcTemplate.update("INSERT INTO cities (id, name) VALUES (?, ?)", 2L, "Medellín");
    }

    @Test
    void cityExistsReturnsTrueForPersistedCity() {
        assertThat(adapter.cityExists(1L)).isTrue();
        assertThat(adapter.cityExists(999L)).isFalse();
    }

    @Test
    void insertAndFindByIdPersistEquipmentData() {
        long id = adapter.insertEquipment(
                1L,
                EQUIPMENT_NAME,
                SERIAL,
                BARCODE,
                "Lenovo",
                STATUS_AVAILABLE,
                "Operativo",
                null
        );

        Optional<Equipment> found = adapter.findEquipmentById(id);

        assertThat(found).isPresent();
        assertThat(found.get().getCityId()).isEqualTo(1L);
        assertThat(found.get().getName()).isEqualTo(EQUIPMENT_NAME);
        assertThat(found.get().getStatus()).isEqualTo(STATUS_AVAILABLE);
    }

    @Test
    void listEquipmentsAppliesCityAndStatusFilters() {
        adapter.insertEquipment(1L, "Projector", null, null, null, STATUS_AVAILABLE, null, null);
        adapter.insertEquipment(1L, "Speaker", null, null, null, STATUS_MAINTENANCE, null, null);
        adapter.insertEquipment(2L, "Tablet", null, null, null, STATUS_AVAILABLE, null, null);

        List<Equipment> filtered = adapter.listEquipments(1L, STATUS_AVAILABLE);

        assertThat(filtered).hasSize(1);
        assertThat(filtered.get(0).getCityId()).isEqualTo(1L);
        assertThat(filtered.get(0).getStatus()).isEqualTo(STATUS_AVAILABLE);
        assertThat(filtered.get(0).getName()).isEqualTo("Projector");
    }

    @Test
    void listEquipmentsWithoutFiltersReturnsAll() {
        adapter.insertEquipment(1L, "Mic", null, null, null, STATUS_AVAILABLE, null, null);
        adapter.insertEquipment(2L, "Camera", null, null, null, STATUS_MAINTENANCE, null, null);

        List<Equipment> all = adapter.listEquipments(null, null);

        assertThat(all).hasSize(2);
    }

    @Test
    void updateEquipmentUpdatesOnlyProvidedFields() {
        long id = adapter.insertEquipment(1L, EQUIPMENT_NAME, SERIAL, BARCODE, "Lenovo", STATUS_AVAILABLE, "n1", "img1");

        adapter.updateEquipment(id, "Laptop Pro", null, null, null, STATUS_MAINTENANCE, null, null);

        Equipment updated = adapter.findEquipmentById(id).orElseThrow();
        assertThat(updated.getName()).isEqualTo("Laptop Pro");
        assertThat(updated.getStatus()).isEqualTo(STATUS_MAINTENANCE);
        assertThat(updated.getSerial()).isEqualTo(SERIAL);
        assertThat(updated.getBarcode()).isEqualTo(BARCODE);
    }

    @Test
    void updateEquipmentWithNoFieldsDoesNothing() {
        long id = adapter.insertEquipment(1L, EQUIPMENT_NAME, SERIAL, BARCODE, "Lenovo", STATUS_AVAILABLE, "n1", "img1");

        adapter.updateEquipment(id, null, null, null, null, null, null, null);

        Equipment same = adapter.findEquipmentById(id).orElseThrow();
        assertThat(same.getName()).isEqualTo(EQUIPMENT_NAME);
        assertThat(same.getStatus()).isEqualTo(STATUS_AVAILABLE);
    }

    @Test
    void deleteEquipmentRemovesRowAndReturnsAffected() {
        long id = adapter.insertEquipment(1L, "Tablet", null, null, null, STATUS_AVAILABLE, null, null);

        int affected = adapter.deleteEquipment(id);
        Optional<Equipment> missing = adapter.findEquipmentById(id);

        assertThat(affected).isEqualTo(1);
        assertThat(missing).isEmpty();
    }
}

