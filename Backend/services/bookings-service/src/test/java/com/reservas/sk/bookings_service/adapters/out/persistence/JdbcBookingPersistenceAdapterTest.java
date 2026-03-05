package com.reservas.sk.bookings_service.adapters.out.persistence;

import com.reservas.sk.bookings_service.domain.model.Reservation;
import com.reservas.sk.bookings_service.domain.model.ReservationEquipment;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.JdbcTest;
import org.springframework.jdbc.core.JdbcTemplate;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@Tag("integration")
@JdbcTest
class JdbcBookingPersistenceAdapterTest {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private JdbcBookingPersistenceAdapter adapter;

    @BeforeEach
    void setUp() {
        adapter = new JdbcBookingPersistenceAdapter(jdbcTemplate);

        jdbcTemplate.execute("DROP TABLE IF EXISTS reservation_handover_logs");
        jdbcTemplate.execute("DROP TABLE IF EXISTS reservation_equipments");
        jdbcTemplate.execute("DROP TABLE IF EXISTS reservations");
        jdbcTemplate.execute("DROP TABLE IF EXISTS equipments");
        jdbcTemplate.execute("DROP TABLE IF EXISTS spaces");
        jdbcTemplate.execute("DROP TABLE IF EXISTS users");

        jdbcTemplate.execute("CREATE TABLE users (id BIGINT PRIMARY KEY)");
        jdbcTemplate.execute("CREATE TABLE spaces (id BIGINT PRIMARY KEY, city_id BIGINT NOT NULL, is_active BOOLEAN NOT NULL)");
        jdbcTemplate.execute("CREATE TABLE equipments (id BIGINT PRIMARY KEY, city_id BIGINT NOT NULL, status VARCHAR(30) NOT NULL)");
        jdbcTemplate.execute("""
                CREATE TABLE reservations (
                    id BIGINT AUTO_INCREMENT PRIMARY KEY,
                    user_id BIGINT NOT NULL,
                    space_id BIGINT NOT NULL,
                    start_datetime TIMESTAMP NOT NULL,
                    end_datetime TIMESTAMP NOT NULL,
                    status VARCHAR(30) NOT NULL,
                    title VARCHAR(255),
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
                    status VARCHAR(30) NOT NULL,
                    delivered_at TIMESTAMP,
                    delivered_by BIGINT,
                    returned_at TIMESTAMP,
                    returned_by BIGINT,
                    condition_notes VARCHAR(255)
                )
                """);
        jdbcTemplate.execute("""
                CREATE TABLE reservation_handover_logs (
                    id BIGINT AUTO_INCREMENT PRIMARY KEY,
                    reservation_id BIGINT NOT NULL,
                    space_id BIGINT NOT NULL,
                    user_id BIGINT NOT NULL,
                    staff_id BIGINT NOT NULL,
                    action VARCHAR(30) NOT NULL,
                    novelty VARCHAR(255),
                    event_at TIMESTAMP NOT NULL
                )
                """);

        jdbcTemplate.update("INSERT INTO users (id) VALUES (100)");
        jdbcTemplate.update("INSERT INTO users (id) VALUES (101)");
        jdbcTemplate.update("INSERT INTO spaces (id, city_id, is_active) VALUES (1, 10, TRUE)");
        jdbcTemplate.update("INSERT INTO spaces (id, city_id, is_active) VALUES (2, 20, FALSE)");

        jdbcTemplate.update("INSERT INTO equipments (id, city_id, status) VALUES (11, 10, 'available')");
        jdbcTemplate.update("INSERT INTO equipments (id, city_id, status) VALUES (12, 10, 'maintenance')");
        jdbcTemplate.update("INSERT INTO equipments (id, city_id, status) VALUES (13, 99, 'available')");
    }

    @Test
    void userAndSpaceQueries_workAsExpected() {
        assertThat(adapter.userExists(100L)).isTrue();
        assertThat(adapter.userExists(999L)).isFalse();

        assertThat(adapter.findSpaceCityId(1L)).contains(10L);
        assertThat(adapter.findSpaceCityId(2L)).isEmpty();
        assertThat(adapter.findSpaceCityId(999L)).isEmpty();
    }

    @Test
    void equipmentQueries_coverExistingUnavailableAndOutsideCity() {
        assertThat(adapter.findExistingEquipmentIds(List.of(11L, 12L, 404L))).containsExactlyInAnyOrder(11L, 12L);
        assertThat(adapter.findUnavailableEquipmentIds(List.of(11L, 12L, 13L))).containsExactly(12L);
        assertThat(adapter.findEquipmentIdsOutsideCity(List.of(11L, 13L), 10L)).containsExactly(13L);
        assertThat(adapter.findExistingEquipmentIds(List.of())).isEmpty();
    }

    @Test
    void countOverlappingReservations_considersEdgesAndOnlyActiveStatuses() {
        insertReservation(100L, 1L, "2026-03-01T09:00:00Z", "2026-03-01T11:00:00Z", "confirmed");
        insertReservation(100L, 1L, "2026-03-01T08:00:00Z", "2026-03-01T10:00:00Z", "confirmed");
        insertReservation(100L, 1L, "2026-03-01T12:00:00Z", "2026-03-01T13:00:00Z", "pending");
        insertReservation(100L, 1L, "2026-03-01T10:30:00Z", "2026-03-01T11:30:00Z", "cancelled");
        insertReservation(100L, 2L, "2026-03-01T10:30:00Z", "2026-03-01T11:30:00Z", "confirmed");

        int overlaps = adapter.countOverlappingReservations(
                1L,
                Instant.parse("2026-03-01T10:00:00Z"),
                Instant.parse("2026-03-01T12:00:00Z")
        );

        assertThat(overlaps).isEqualTo(1);
    }

    @Test
    void reservationInsertFindAndList_workWithFilters() {
        long reservationA = adapter.insertReservation(
                100L,
                1L,
                Instant.parse("2026-03-01T10:00:00Z"),
                Instant.parse("2026-03-01T12:00:00Z"),
                "confirmed",
                "Reserva A",
                5,
                "nota"
        );
        long reservationB = adapter.insertReservation(
                101L,
                1L,
                Instant.parse("2026-03-01T13:00:00Z"),
                Instant.parse("2026-03-01T14:00:00Z"),
                "pending",
                "Reserva B",
                null,
                null
        );

        Reservation found = adapter.findReservationById(reservationA).orElseThrow();
        assertThat(found.getUserId()).isEqualTo(100L);
        assertThat(found.getStatus()).isEqualTo("confirmed");
        assertThat(found.getAttendeesCount()).isEqualTo(5);

        List<Reservation> byUser = adapter.listReservations(100L, null, null);
        assertThat(byUser).extracting(Reservation::getId).contains(reservationA).doesNotContain(reservationB);

        List<Reservation> byStatus = adapter.listReservations(null, null, "pending");
        assertThat(byStatus).extracting(Reservation::getId).contains(reservationB).doesNotContain(reservationA);
    }

    @Test
    void reservationEquipments_insertFindGroupAndLifecycleUpdates() {
        long reservationId = adapter.insertReservation(
                100L,
                1L,
                Instant.parse("2026-03-01T10:00:00Z"),
                Instant.parse("2026-03-01T12:00:00Z"),
                "confirmed",
                "Reserva",
                null,
                null
        );

        adapter.insertReservationEquipment(reservationId, 11L, "requested");
        adapter.insertReservationEquipment(reservationId, 12L, "confirmed");

        List<ReservationEquipment> direct = adapter.findReservationEquipments(reservationId);
        assertThat(direct).hasSize(2);

        Map<Long, List<ReservationEquipment>> grouped = adapter.findReservationEquipmentsByReservationIds(List.of(reservationId));
        assertThat(grouped).containsKey(reservationId);
        assertThat(grouped.get(reservationId)).hasSize(2);

        Instant deliveredAt = Instant.parse("2026-03-01T10:15:00Z");
        Instant returnedAt = Instant.parse("2026-03-01T11:50:00Z");
        adapter.markReservationEquipmentsDelivered(reservationId, 900L, deliveredAt, "entrega");
        adapter.markReservationEquipmentsReturned(reservationId, 901L, returnedAt, "devolucion");

        List<ReservationEquipment> after = adapter.findReservationEquipments(reservationId);
        assertThat(after).allMatch(eq -> "returned".equals(eq.getStatus()));
        assertThat(after).allMatch(eq -> eq.getDeliveredBy() != null);
        assertThat(after).allMatch(eq -> eq.getReturnedBy() != null);
    }

    @Test
    void cancellationStatusAndHandoverLog_arePersisted() {
        long reservationId = adapter.insertReservation(
                100L,
                1L,
                Instant.parse("2026-03-01T10:00:00Z"),
                Instant.parse("2026-03-01T12:00:00Z"),
                "confirmed",
                "Reserva",
                null,
                null
        );

        adapter.updateReservationCancellation(reservationId, "cancelled", "usuario solicita");
        adapter.updateReservationStatus(reservationId, "completed");
        adapter.insertReservationHandoverLog(reservationId, 1L, 100L, 200L, "RETURNED", "ok", Instant.parse("2026-03-01T12:01:00Z"));

        String status = jdbcTemplate.queryForObject("SELECT status FROM reservations WHERE id = ?", String.class, reservationId);
        String reason = jdbcTemplate.queryForObject("SELECT cancellation_reason FROM reservations WHERE id = ?", String.class, reservationId);
        Integer logs = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM reservation_handover_logs WHERE reservation_id = ?", Integer.class, reservationId);

        assertThat(status).isEqualTo("completed");
        assertThat(reason).isEqualTo("usuario solicita");
        assertThat(logs).isEqualTo(1);
    }

    private void insertReservation(long userId, long spaceId, String startAt, String endAt, String status) {
        jdbcTemplate.update(
                """
                INSERT INTO reservations (user_id, space_id, start_datetime, end_datetime, status, title, attendees_count, notes, cancellation_reason, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                userId,
                spaceId,
                Timestamp.from(Instant.parse(startAt)),
                Timestamp.from(Instant.parse(endAt)),
                status,
                "t",
                1,
                null,
                null,
                Timestamp.from(Instant.parse("2026-03-01T09:00:00Z"))
        );
    }
}
