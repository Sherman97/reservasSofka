package com.reservas.sk.bookings_service.adapters.out.persistence;

import com.reservas.sk.bookings_service.application.port.out.BookingPersistencePort;
import com.reservas.sk.bookings_service.domain.model.Reservation;
import com.reservas.sk.bookings_service.domain.model.ReservationEquipment;
import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.simple.SimpleJdbcInsert;
import org.springframework.stereotype.Component;

import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
@SuppressFBWarnings(
        value = "EI_EXPOSE_REP2",
        justification = "Spring-managed dependencies are injected and not defensively copied."
)
public class JdbcBookingPersistenceAdapter implements BookingPersistencePort {
    private static final String ACTIVE_RESERVATION_FILTER = "status IN ('pending','confirmed','in_progress')";
    private static final String STATUS_AVAILABLE = "available";
    private static final String COLUMN_STATUS = "status";
    private static final String COLUMN_DELIVERED_BY = "delivered_by";
    private static final String COLUMN_RETURNED_BY = "returned_by";
    private static final String SQL_CLOSE_IN_CLAUSE = ")\n";
    private static final int RESERVATION_QUERY_CAPACITY = 256;

    private final JdbcTemplate jdbcTemplate;
    private final SimpleJdbcInsert reservationInsert;

    public JdbcBookingPersistenceAdapter(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
        this.reservationInsert = new SimpleJdbcInsert(jdbcTemplate)
                .withTableName("reservations")
                .usingGeneratedKeyColumns("id");
    }

    @Override
    public boolean userExists(long userId) {
        Integer row = jdbcTemplate.query(
                "SELECT id FROM users WHERE id = ? LIMIT 1",
                (rs, rowNum) -> rs.getInt("id"),
                userId
        ).stream().findFirst().orElse(null);
        return row != null;
    }

    @Override
    public Optional<Long> findSpaceCityId(long spaceId) {
        List<Long> rows = jdbcTemplate.query(
                "SELECT city_id FROM spaces WHERE id = ? AND is_active = TRUE LIMIT 1",
                (rs, rowNum) -> rs.getLong("city_id"),
                spaceId
        );
        return rows.isEmpty() ? Optional.empty() : Optional.of(rows.get(0));
    }

    @Override
    public int countOverlappingReservations(long spaceId, Instant startAt, Instant endAt) {
        Integer count = jdbcTemplate.queryForObject(
                """
                SELECT COUNT(*)
                FROM reservations
                WHERE space_id = ?
                  AND start_datetime < ?
                  AND end_datetime > ?
                  AND
                """ + ACTIVE_RESERVATION_FILTER,
                Integer.class,
                spaceId,
                Timestamp.from(endAt),
                Timestamp.from(startAt)
        );
        return count == null ? 0 : count;
    }

    @Override
    public List<Long> findExistingEquipmentIds(List<Long> equipmentIds) {
        if (equipmentIds == null || equipmentIds.isEmpty()) {
            return List.of();
        }

        String placeholders = String.join(",", Collections.nCopies(equipmentIds.size(), "?"));
        String sql = "SELECT id\n"
                + "FROM equipments\n"
                + "WHERE id IN (" + placeholders + SQL_CLOSE_IN_CLAUSE;
        return jdbcTemplate.query(
                sql,
                (rs, rowNum) -> rs.getLong("id"),
                equipmentIds.toArray()
        );
    }

    @Override
    public List<Long> findUnavailableEquipmentIds(List<Long> equipmentIds) {
        if (equipmentIds == null || equipmentIds.isEmpty()) {
            return List.of();
        }

        String placeholders = String.join(",", Collections.nCopies(equipmentIds.size(), "?"));
        String sql = "SELECT id\n"
                + "FROM equipments\n"
                + "WHERE id IN (" + placeholders + SQL_CLOSE_IN_CLAUSE
                + "  AND status <> '" + STATUS_AVAILABLE + "'\n";
        return jdbcTemplate.query(
                sql,
                (rs, rowNum) -> rs.getLong("id"),
                equipmentIds.toArray()
        );
    }

    @Override
    public List<Long> findEquipmentIdsOutsideCity(List<Long> equipmentIds, long cityId) {
        if (equipmentIds == null || equipmentIds.isEmpty()) {
            return List.of();
        }

        String placeholders = String.join(",", Collections.nCopies(equipmentIds.size(), "?"));
        List<Object> params = new ArrayList<>(equipmentIds);
        params.add(cityId);
        String sql = "SELECT id\n"
                + "FROM equipments\n"
                + "WHERE id IN (" + placeholders + SQL_CLOSE_IN_CLAUSE
                + "  AND city_id <> ?\n";

        return jdbcTemplate.query(
                sql,
                (rs, rowNum) -> rs.getLong("id"),
                params.toArray()
        );
    }

    // Human Check 🛡️: GET_LOCK serializa reservas por espacio y evita reservas simultaneas.
    @Override
    public boolean acquireSpaceReservationLock(long spaceId, int timeoutSeconds) {
        Integer locked = jdbcTemplate.queryForObject(
                "SELECT GET_LOCK(?, ?)",
                Integer.class,
                lockName(spaceId),
                timeoutSeconds
        );
        return locked != null && locked == 1;
    }

    @Override
    public void releaseSpaceReservationLock(long spaceId) {
        jdbcTemplate.queryForObject(
                "SELECT RELEASE_LOCK(?)",
                Integer.class,
                lockName(spaceId)
        );
    }

    @Override
    public long insertReservation(long userId,
                                  long spaceId,
                                  Instant startAt,
                                  Instant endAt,
                                  String status,
                                  String title,
                                  Integer attendeesCount,
                                  String notes) {
        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("user_id", userId)
                .addValue("space_id", spaceId)
                .addValue("start_datetime", Timestamp.from(startAt))
                .addValue("end_datetime", Timestamp.from(endAt))
                .addValue(COLUMN_STATUS, status)
                .addValue("title", title)
                .addValue("attendees_count", attendeesCount)
                .addValue("notes", notes);
        Number key = reservationInsert.executeAndReturnKey(params);
        return key.longValue();
    }

    @Override
    public void insertReservationEquipment(long reservationId, long equipmentId, String status) {
        jdbcTemplate.update(
                """
                INSERT INTO reservation_equipments (reservation_id, equipment_id, status)
                VALUES (?, ?, ?)
                """,
                reservationId,
                equipmentId,
                status
        );
    }

    @Override
    public List<Reservation> listReservations(Long userId, Long spaceId, String status) {
        StringBuilder sql = new StringBuilder(RESERVATION_QUERY_CAPACITY);
        sql.append(
                """
                SELECT id, user_id, space_id, start_datetime, end_datetime, status,
                       title, attendees_count, notes, cancellation_reason, created_at
                FROM reservations
                """
        );

        List<Object> params = new ArrayList<>();
        List<String> where = new ArrayList<>();

        if (userId != null) {
            where.add("user_id = ?");
            params.add(userId);
        }
        if (spaceId != null) {
            where.add("space_id = ?");
            params.add(spaceId);
        }
        if (status != null && !status.isBlank()) {
            where.add("status = ?");
            params.add(status);
        }

        if (!where.isEmpty()) {
            sql.append(" WHERE ").append(String.join(" AND ", where));
        }

        sql.append(" ORDER BY created_at DESC");

        return jdbcTemplate.query(sql.toString(), (rs, rowNum) -> toReservation(rs), params.toArray());
    }

    @Override
    public Optional<Reservation> findReservationById(long reservationId) {
        List<Reservation> rows = jdbcTemplate.query(
                """
                SELECT id, user_id, space_id, start_datetime, end_datetime, status,
                       title, attendees_count, notes, cancellation_reason, created_at
                FROM reservations
                WHERE id = ?
                LIMIT 1
                """,
                (rs, rowNum) -> toReservation(rs),
                reservationId
        );

        return rows.isEmpty() ? Optional.empty() : Optional.of(rows.get(0));
    }

    @Override
    public Map<Long, List<ReservationEquipment>> findReservationEquipmentsByReservationIds(List<Long> reservationIds) {
        if (reservationIds == null || reservationIds.isEmpty()) {
            return Map.of();
        }

        String placeholders = String.join(",", Collections.nCopies(reservationIds.size(), "?"));
        String sql = "SELECT id, reservation_id, equipment_id, status, delivered_at, delivered_by,\n"
                + "       returned_at, returned_by, condition_notes\n"
                + "FROM reservation_equipments\n"
                + "WHERE reservation_id IN (" + placeholders + SQL_CLOSE_IN_CLAUSE
                + "ORDER BY id ASC\n";
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(
                sql,
                reservationIds.toArray()
        );

        return rows.stream().collect(
                Collectors.groupingBy(
                        row -> ((Number) row.get("reservation_id")).longValue(),
                        HashMap::new,
                        Collectors.mapping(this::toReservationEquipment, Collectors.toList())
                )
        );
    }

    @Override
    public List<ReservationEquipment> findReservationEquipments(long reservationId) {
        return jdbcTemplate.query(
                """
                SELECT id, reservation_id, equipment_id, status, delivered_at, delivered_by,
                       returned_at, returned_by, condition_notes
                FROM reservation_equipments
                WHERE reservation_id = ?
                ORDER BY id ASC
                """,
                (rs, rowNum) -> new ReservationEquipment(
                        rs.getLong("id"),
                        rs.getLong("reservation_id"),
                        rs.getLong("equipment_id"),
                        rs.getString(COLUMN_STATUS),
                        toInstant(rs.getTimestamp("delivered_at")),
                        rs.getObject(COLUMN_DELIVERED_BY) == null ? null : rs.getLong(COLUMN_DELIVERED_BY),
                        toInstant(rs.getTimestamp("returned_at")),
                        rs.getObject(COLUMN_RETURNED_BY) == null ? null : rs.getLong(COLUMN_RETURNED_BY),
                        rs.getString("condition_notes")
                ),
                reservationId
        );
    }

    @Override
    public void updateReservationCancellation(long reservationId, String status, String cancellationReason) {
        jdbcTemplate.update(
                "UPDATE reservations SET status = ?, cancellation_reason = ? WHERE id = ?",
                status,
                cancellationReason,
                reservationId
        );
    }

    @Override
    public void updateReservationStatus(long reservationId, String status) {
        jdbcTemplate.update(
                "UPDATE reservations SET status = ? WHERE id = ?",
                status,
                reservationId
        );
    }

    @Override
    public void markReservationEquipmentsDelivered(long reservationId, long deliveredBy, Instant deliveredAt, String novelty) {
        jdbcTemplate.update(
                """
                UPDATE reservation_equipments
                SET status = 'delivered',
                    delivered_at = COALESCE(delivered_at, ?),
                    delivered_by = COALESCE(delivered_by, ?),
                    condition_notes = COALESCE(?, condition_notes)
                WHERE reservation_id = ?
                  AND status IN ('requested', 'confirmed')
                """,
                Timestamp.from(deliveredAt),
                deliveredBy,
                novelty,
                reservationId
        );
    }

    @Override
    public void markReservationEquipmentsReturned(long reservationId, long returnedBy, Instant returnedAt, String novelty) {
        jdbcTemplate.update(
                """
                UPDATE reservation_equipments
                SET status = 'returned',
                    returned_at = COALESCE(returned_at, ?),
                    returned_by = COALESCE(returned_by, ?),
                    condition_notes = COALESCE(?, condition_notes)
                WHERE reservation_id = ?
                  AND status IN ('requested', 'confirmed', 'delivered')
                """,
                Timestamp.from(returnedAt),
                returnedBy,
                novelty,
                reservationId
        );
    }

    @Override
    public void insertReservationHandoverLog(long reservationId,
                                             long spaceId,
                                             long userId,
                                             long staffId,
                                             String action,
                                             String novelty,
                                             Instant eventAt) {
        jdbcTemplate.update(
                """
                INSERT INTO reservation_handover_logs (reservation_id, space_id, user_id, staff_id, action, novelty, event_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                reservationId,
                spaceId,
                userId,
                staffId,
                action,
                novelty,
                Timestamp.from(eventAt)
        );
    }

    private Reservation toReservation(java.sql.ResultSet rs) throws java.sql.SQLException {
        return new Reservation(
                rs.getLong("id"),
                rs.getLong("user_id"),
                rs.getLong("space_id"),
                toInstant(rs.getTimestamp("start_datetime")),
                toInstant(rs.getTimestamp("end_datetime")),
                rs.getString("status"),
                rs.getString("title"),
                rs.getObject("attendees_count") == null ? null : rs.getInt("attendees_count"),
                rs.getString("notes"),
                rs.getString("cancellation_reason"),
                toInstant(rs.getTimestamp("created_at")),
                List.of()
        );
    }

    private ReservationEquipment toReservationEquipment(Map<String, Object> row) {
        return new ReservationEquipment(
                ((Number) row.get("id")).longValue(),
                ((Number) row.get("reservation_id")).longValue(),
                ((Number) row.get("equipment_id")).longValue(),
                (String) row.get(COLUMN_STATUS),
                toInstant((Timestamp) row.get("delivered_at")),
                row.get(COLUMN_DELIVERED_BY) == null ? null : ((Number) row.get(COLUMN_DELIVERED_BY)).longValue(),
                toInstant((Timestamp) row.get("returned_at")),
                row.get(COLUMN_RETURNED_BY) == null ? null : ((Number) row.get(COLUMN_RETURNED_BY)).longValue(),
                (String) row.get("condition_notes")
        );
    }

    private Instant toInstant(Timestamp timestamp) {
        if (timestamp == null) {
            return null;
        }
        LocalDateTime localDateTime = timestamp.toLocalDateTime();
        return localDateTime.toInstant(ZoneOffset.UTC);
    }

    private String lockName(long spaceId) {
        return "bookings:space:" + spaceId;
    }
}







