package com.reservas.sk.inventory_service.adapters.out.persistence;

import com.reservas.sk.inventory_service.application.port.out.InventoryPersistencePort;
import com.reservas.sk.inventory_service.domain.model.Equipment;
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
import java.util.List;
import java.util.Optional;

@Component
public class JdbcInventoryPersistenceAdapter implements InventoryPersistencePort {
    private final JdbcTemplate jdbcTemplate;

    public JdbcInventoryPersistenceAdapter(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public boolean cityExists(long cityId) {
        Integer row = jdbcTemplate.query(
                "SELECT id FROM cities WHERE id = ? LIMIT 1",
                (rs, rowNum) -> rs.getInt("id"),
                cityId
        ).stream().findFirst().orElse(null);
        return row != null;
    }

    @Override
    public long insertEquipment(long cityId,
                                String name,
                                String serial,
                                String barcode,
                                String model,
                                String status,
                                String notes,
                                String imageUrl) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                    """
                    INSERT INTO equipments (city_id, name, serial, barcode, model, status, notes, image_url)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    Statement.RETURN_GENERATED_KEYS
            );
            ps.setLong(1, cityId);
            ps.setString(2, name);
            ps.setString(3, serial);
            ps.setString(4, barcode);
            ps.setString(5, model);
            ps.setString(6, status);
            ps.setString(7, notes);
            ps.setString(8, imageUrl);
            return ps;
        }, keyHolder);

        Number key = keyHolder.getKey();
        return key == null ? 0L : key.longValue();
    }

    @Override
    public List<Equipment> listEquipments(Long cityId, String status) {
        StringBuilder sql = new StringBuilder(
                """
                SELECT id, city_id, name, serial, barcode, model, status, notes, image_url, created_at, updated_at
                FROM equipments
                """
        );

        List<Object> params = new ArrayList<>();
        List<String> where = new ArrayList<>();

        if (cityId != null) {
            where.add("city_id = ?");
            params.add(cityId);
        }

        if (status != null && !status.isBlank()) {
            where.add("status = ?");
            params.add(status);
        }

        if (!where.isEmpty()) {
            sql.append(" WHERE ").append(String.join(" AND ", where));
        }

        sql.append(" ORDER BY created_at DESC");

        return jdbcTemplate.query(
                sql.toString(),
                (rs, rowNum) -> toEquipment(rs),
                params.toArray()
        );
    }

    @Override
    public Optional<Equipment> findEquipmentById(long id) {
        List<Equipment> rows = jdbcTemplate.query(
                """
                SELECT id, city_id, name, serial, barcode, model, status, notes, image_url, created_at, updated_at
                FROM equipments
                WHERE id = ?
                LIMIT 1
                """,
                (rs, rowNum) -> toEquipment(rs),
                id
        );

        return rows.isEmpty() ? Optional.empty() : Optional.of(rows.get(0));
    }

    @Override
    public void updateEquipment(long id,
                                String name,
                                String serial,
                                String barcode,
                                String model,
                                String status,
                                String notes,
                                String imageUrl) {
        List<String> fields = new ArrayList<>();
        List<Object> params = new ArrayList<>();

        if (name != null) {
            fields.add("name = ?");
            params.add(name);
        }
        if (serial != null) {
            fields.add("serial = ?");
            params.add(serial);
        }
        if (barcode != null) {
            fields.add("barcode = ?");
            params.add(barcode);
        }
        if (model != null) {
            fields.add("model = ?");
            params.add(model);
        }
        if (status != null) {
            fields.add("status = ?");
            params.add(status);
        }
        if (notes != null) {
            fields.add("notes = ?");
            params.add(notes);
        }
        if (imageUrl != null) {
            fields.add("image_url = ?");
            params.add(imageUrl);
        }

        if (fields.isEmpty()) {
            return;
        }

        params.add(id);
        jdbcTemplate.update(
                "UPDATE equipments SET " + String.join(", ", fields) + " WHERE id = ?",
                params.toArray()
        );
    }

    @Override
    public int deleteEquipment(long id) {
        return jdbcTemplate.update("DELETE FROM equipments WHERE id = ?", id);
    }

    private Equipment toEquipment(java.sql.ResultSet rs) throws java.sql.SQLException {
        return new Equipment(
                rs.getLong("id"),
                rs.getLong("city_id"),
                rs.getString("name"),
                rs.getString("serial"),
                rs.getString("barcode"),
                rs.getString("model"),
                rs.getString("status"),
                rs.getString("notes"),
                rs.getString("image_url"),
                toInstant(rs.getTimestamp("created_at")),
                toInstant(rs.getTimestamp("updated_at"))
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





