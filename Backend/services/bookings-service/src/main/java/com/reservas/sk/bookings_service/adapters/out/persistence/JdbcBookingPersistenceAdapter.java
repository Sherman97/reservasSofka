package com.reservas.sk.bookings_service.adapters.out.persistence;

import com.reservas.sk.bookings_service.application.port.out.BookingPersistencePort;
import com.reservas.sk.bookings_service.domain.model.Reservation;
import com.reservas.sk.bookings_service.domain.model.ReservationEquipment;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Component;

import java.sql.PreparedStatement;
import java.sql.Statement;
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

@Component
public class JdbcBookingPersistenceAdapter implements BookingPersistencePort {
    private static final String ACTIVE_RESERVATION_FILTER = "status IN ('pending','confirmed','in_progress')";

    private final JdbcTemplate jdbcTemplate;

    public JdbcBookingPersistenceAdapter(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
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
                  AND """ + ACTIVE_RESERVATION_FILTER,
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
        return jdbcTemplate.query(
                """
                SELECT id
                FROM equipments
                WHERE id IN (%s)
                """.formatted(placeholders),
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
        return jdbcTemplate.query(
                """
                SELECT id
                FROM equipments
                WHERE id IN (%s)
                  AND status <> 'available'
                """.formatted(placeholders),
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

        return jdbcTemplate.query(
                """
                SELECT id
                FROM equipments
                WHERE id IN (%s)
                  AND city_id <> ?
                """.formatted(placeholders),
                (rs, rowNum) -> rs.getLong("id"),
                params.toArray()
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
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                    """
                    INSERT INTO reservations (user_id, space_id, start_datetime, end_datetime, status, title, attendees_count, notes)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    Statement.RETURN_GENERATED_KEYS
            );
            ps.setLong(1, userId);
            ps.setLong(2, spaceId);
            ps.setTimestamp(3, Timestamp.from(startAt));
            ps.setTimestamp(4, Timestamp.from(endAt));
            ps.setString(5, status);
            ps.setString(6, title);
            if (attendeesCount == null) {
                ps.setNull(7, java.sql.Types.INTEGER);
            } else {
                ps.setInt(7, attendeesCount);
            }
            ps.setString(8, notes);
            return ps;
        }, keyHolder);

        Number key = keyHolder.getKey();
        return key == null ? 0L : key.longValue();
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
        StringBuilder sql = new StringBuilder(
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
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(
                """
                SELECT id, reservation_id, equipment_id, status, delivered_at, delivered_by,
                       returned_at, returned_by, condition_notes
                FROM reservation_equipments
                WHERE reservation_id IN (%s)
                ORDER BY id ASC
                """.formatted(placeholders),
                reservationIds.toArray()
        );

        Map<Long, List<ReservationEquipment>> grouped = new HashMap<>();
        for (Map<String, Object> row : rows) {
            Long reservationId = ((Number) row.get("reservation_id")).longValue();
            grouped.computeIfAbsent(reservationId, ignored -> new ArrayList<>()).add(toReservationEquipment(row));
        }
        return grouped;
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
                        rs.getString("status"),
                        toInstant(rs.getTimestamp("delivered_at")),
                        rs.getObject("delivered_by") == null ? null : rs.getLong("delivered_by"),
                        toInstant(rs.getTimestamp("returned_at")),
                        rs.getObject("returned_by") == null ? null : rs.getLong("returned_by"),
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
                (String) row.get("status"),
                toInstant((Timestamp) row.get("delivered_at")),
                row.get("delivered_by") == null ? null : ((Number) row.get("delivered_by")).longValue(),
                toInstant((Timestamp) row.get("returned_at")),
                row.get("returned_by") == null ? null : ((Number) row.get("returned_by")).longValue(),
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
}







