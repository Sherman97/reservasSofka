package com.reservas.sk.bookings_service.adapters.out.persistence;

import com.reservas.sk.bookings_service.application.usecase.AdminListReservationsQuery;
import com.reservas.sk.bookings_service.domain.model.Reservation;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.JdbcTest;
import org.springframework.jdbc.core.JdbcTemplate;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@Tag("integration")
@JdbcTest
class JdbcBookingPersistenceAdapterAdminQueryIntegrationTest {
    @Autowired
    private JdbcTemplate jdbcTemplate;

    private JdbcBookingPersistenceAdapter adapter;

    @BeforeEach
    void setUp() {
        adapter = new JdbcBookingPersistenceAdapter(jdbcTemplate);

        jdbcTemplate.execute("DROP TABLE IF EXISTS reservation_equipments");
        jdbcTemplate.execute("DROP TABLE IF EXISTS reservations");
        jdbcTemplate.execute("DROP TABLE IF EXISTS spaces");
        jdbcTemplate.execute("DROP TABLE IF EXISTS cities");
        jdbcTemplate.execute("DROP TABLE IF EXISTS users");

        jdbcTemplate.execute("CREATE TABLE users (id BIGINT PRIMARY KEY, username VARCHAR(120), email VARCHAR(150))");
        jdbcTemplate.execute("CREATE TABLE cities (id BIGINT PRIMARY KEY, name VARCHAR(120))");
        jdbcTemplate.execute(
                "CREATE TABLE spaces (id BIGINT PRIMARY KEY, city_id BIGINT NOT NULL, name VARCHAR(120), is_active BOOLEAN NOT NULL)"
        );
        jdbcTemplate.execute("""
                CREATE TABLE reservations (
                    id BIGINT AUTO_INCREMENT PRIMARY KEY,
                    user_id BIGINT NOT NULL,
                    space_id BIGINT NOT NULL,
                    start_datetime TIMESTAMP NOT NULL,
                    end_datetime TIMESTAMP NOT NULL,
                    status VARCHAR(30) NOT NULL,
                    title VARCHAR(150),
                    attendees_count INT,
                    notes VARCHAR(255),
                    cancellation_reason VARCHAR(255),
                    created_at TIMESTAMP
                )
                """);
        jdbcTemplate.execute("""
                CREATE TABLE reservation_equipments (
                    id BIGINT AUTO_INCREMENT PRIMARY KEY,
                    reservation_id BIGINT NOT NULL,
                    equipment_id BIGINT NOT NULL,
                    status VARCHAR(30) NOT NULL
                )
                """);

        jdbcTemplate.update("INSERT INTO users (id, username, email) VALUES (100, 'ana.admin', 'ana.admin@test.com')");
        jdbcTemplate.update("INSERT INTO users (id, username, email) VALUES (101, 'juan.user', 'juan.user@test.com')");
        jdbcTemplate.update("INSERT INTO cities (id, name) VALUES (10, 'Bogota')");
        jdbcTemplate.update("INSERT INTO cities (id, name) VALUES (20, 'Medellin')");
        jdbcTemplate.update("INSERT INTO spaces (id, city_id, name, is_active) VALUES (1, 10, 'Sala A', TRUE)");
        jdbcTemplate.update("INSERT INTO spaces (id, city_id, name, is_active) VALUES (2, 20, 'Sala B', TRUE)");
    }

    @Test
    void listAdminReservations_appliesCombinedFiltersByExecutionDateStatusUserAndSite() {
        long expectedId = insertReservation(
                100L,
                1L,
                "2026-04-15T10:00:00Z",
                "2026-04-15T11:00:00Z",
                "confirmed"
        );
        insertReservation(100L, 2L, "2026-04-15T10:00:00Z", "2026-04-15T11:00:00Z", "confirmed");
        insertReservation(101L, 1L, "2026-04-15T10:00:00Z", "2026-04-15T11:00:00Z", "confirmed");
        insertReservation(100L, 1L, "2026-04-15T10:00:00Z", "2026-04-15T11:00:00Z", "cancelled");
        insertReservation(100L, 1L, "2026-05-02T10:00:00Z", "2026-05-02T11:00:00Z", "confirmed");

        AdminListReservationsQuery query = new AdminListReservationsQuery(
                "2026-04-01T00:00:00Z",
                "2026-04-30T23:59:59Z",
                "Confirmada",
                100L,
                10L,
                0,
                20
        );

        List<Reservation> results = adapter.listAdminReservations(query);

        assertThat(results).extracting(Reservation::getId).containsExactly(expectedId);
    }

    @Test
    void listAdminReservations_returnsTwentyRowsOrderedByExecutionDateDescByDefault() {
        for (int i = 0; i < 25; i++) {
            int day = i + 1;
            insertReservation(
                    100L,
                    1L,
                    String.format("2026-04-%02dT10:00:00Z", day),
                    String.format("2026-04-%02dT11:00:00Z", day),
                    "confirmed"
            );
        }

        AdminListReservationsQuery pageZero = new AdminListReservationsQuery(
                "2026-04-01T00:00:00Z",
                "2026-04-30T23:59:59Z",
                null,
                null,
                null,
                0,
                20
        );
        AdminListReservationsQuery pageOne = new AdminListReservationsQuery(
                "2026-04-01T00:00:00Z",
                "2026-04-30T23:59:59Z",
                null,
                null,
                null,
                1,
                20
        );

        List<Reservation> firstPage = adapter.listAdminReservations(pageZero);
        List<Reservation> secondPage = adapter.listAdminReservations(pageOne);

        assertThat(firstPage).hasSize(20);
        assertThat(secondPage).hasSize(5);
        assertThat(firstPage.get(0).getStartDatetime()).isAfter(firstPage.get(19).getStartDatetime());
    }

    private long insertReservation(long userId, long spaceId, String startAt, String endAt, String status) {
        jdbcTemplate.update(
                """
                INSERT INTO reservations (
                    user_id, space_id, start_datetime, end_datetime, status, title,
                    attendees_count, notes, cancellation_reason, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                userId,
                spaceId,
                Timestamp.from(Instant.parse(startAt)),
                Timestamp.from(Instant.parse(endAt)),
                status,
                "Reserva",
                4,
                null,
                null,
                Timestamp.from(Instant.parse("2026-03-01T00:00:00Z"))
        );

        return jdbcTemplate.queryForObject("SELECT MAX(id) FROM reservations", Long.class);
    }
}
