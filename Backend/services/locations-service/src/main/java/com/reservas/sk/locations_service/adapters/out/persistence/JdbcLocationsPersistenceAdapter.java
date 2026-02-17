package com.reservas.sk.locations_service.adapters.out.persistence;

import com.reservas.sk.locations_service.application.port.out.LocationsPersistencePort;
import com.reservas.sk.locations_service.domain.model.City;
import com.reservas.sk.locations_service.domain.model.Space;
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
public class JdbcLocationsPersistenceAdapter implements LocationsPersistencePort {
    private final JdbcTemplate jdbcTemplate;

    public JdbcLocationsPersistenceAdapter(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public long insertCity(String name, String country) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                    "INSERT INTO cities (name, country) VALUES (?, ?)",
                    Statement.RETURN_GENERATED_KEYS
            );
            ps.setString(1, name);
            ps.setString(2, country);
            return ps;
        }, keyHolder);

        Number key = keyHolder.getKey();
        return key == null ? 0L : key.longValue();
    }

    @Override
    public List<City> listCities() {
        return jdbcTemplate.query(
                "SELECT id, name, country, created_at, updated_at FROM cities ORDER BY name ASC",
                (rs, rowNum) -> toCity(rs)
        );
    }

    @Override
    public Optional<City> findCityById(long id) {
        List<City> rows = jdbcTemplate.query(
                "SELECT id, name, country, created_at, updated_at FROM cities WHERE id = ? LIMIT 1",
                (rs, rowNum) -> toCity(rs),
                id
        );
        return rows.isEmpty() ? Optional.empty() : Optional.of(rows.get(0));
    }

    @Override
    public void updateCity(long id, String name, String country) {
        List<String> fields = new ArrayList<>();
        List<Object> params = new ArrayList<>();

        if (name != null) {
            fields.add("name = ?");
            params.add(name);
        }
        if (country != null) {
            fields.add("country = ?");
            params.add(country);
        }

        if (fields.isEmpty()) {
            return;
        }

        params.add(id);
        jdbcTemplate.update("UPDATE cities SET " + String.join(", ", fields) + " WHERE id = ?", params.toArray());
    }

    @Override
    public int deleteCity(long id) {
        return jdbcTemplate.update("DELETE FROM cities WHERE id = ?", id);
    }

    @Override
    public boolean existsCity(long id) {
        Integer row = jdbcTemplate.query(
                "SELECT id FROM cities WHERE id = ? LIMIT 1",
                (rs, rowNum) -> rs.getInt("id"),
                id
        ).stream().findFirst().orElse(null);
        return row != null;
    }

    @Override
    public long insertSpace(long cityId,
                            String name,
                            Integer capacity,
                            String floor,
                            String description,
                            boolean isActive) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                    """
                    INSERT INTO spaces (city_id, name, capacity, floor, description, is_active)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """,
                    Statement.RETURN_GENERATED_KEYS
            );
            ps.setLong(1, cityId);
            ps.setString(2, name);
            if (capacity == null) {
                ps.setNull(3, java.sql.Types.INTEGER);
            } else {
                ps.setInt(3, capacity);
            }
            ps.setString(4, floor);
            ps.setString(5, description);
            ps.setBoolean(6, isActive);
            return ps;
        }, keyHolder);

        Number key = keyHolder.getKey();
        return key == null ? 0L : key.longValue();
    }

    @Override
    public List<Space> listSpaces(Long cityId, Boolean activeOnly) {
        StringBuilder sql = new StringBuilder(
                "SELECT id, city_id, name, capacity, floor, description, is_active, created_at, updated_at FROM spaces"
        );

        List<String> where = new ArrayList<>();
        List<Object> params = new ArrayList<>();

        if (cityId != null) {
            where.add("city_id = ?");
            params.add(cityId);
        }
        if (activeOnly != null && activeOnly) {
            where.add("is_active = TRUE");
        }

        if (!where.isEmpty()) {
            sql.append(" WHERE ").append(String.join(" AND ", where));
        }

        sql.append(" ORDER BY name ASC");

        return jdbcTemplate.query(sql.toString(), (rs, rowNum) -> toSpace(rs), params.toArray());
    }

    @Override
    public Optional<Space> findSpaceById(long id) {
        List<Space> rows = jdbcTemplate.query(
                """
                SELECT id, city_id, name, capacity, floor, description, is_active, created_at, updated_at
                FROM spaces
                WHERE id = ?
                LIMIT 1
                """,
                (rs, rowNum) -> toSpace(rs),
                id
        );

        return rows.isEmpty() ? Optional.empty() : Optional.of(rows.get(0));
    }

    @Override
    public void updateSpace(long id,
                            String name,
                            Integer capacity,
                            String floor,
                            String description,
                            Boolean isActive) {
        List<String> fields = new ArrayList<>();
        List<Object> params = new ArrayList<>();

        if (name != null) {
            fields.add("name = ?");
            params.add(name);
        }
        if (capacity != null) {
            fields.add("capacity = ?");
            params.add(capacity);
        }
        if (floor != null) {
            fields.add("floor = ?");
            params.add(floor);
        }
        if (description != null) {
            fields.add("description = ?");
            params.add(description);
        }
        if (isActive != null) {
            fields.add("is_active = ?");
            params.add(isActive);
        }

        if (fields.isEmpty()) {
            return;
        }

        params.add(id);
        jdbcTemplate.update("UPDATE spaces SET " + String.join(", ", fields) + " WHERE id = ?", params.toArray());
    }

    @Override
    public int deleteSpace(long id) {
        return jdbcTemplate.update("DELETE FROM spaces WHERE id = ?", id);
    }

    private City toCity(java.sql.ResultSet rs) throws java.sql.SQLException {
        return new City(
                rs.getLong("id"),
                rs.getString("name"),
                rs.getString("country"),
                toInstant(rs.getTimestamp("created_at")),
                toInstant(rs.getTimestamp("updated_at"))
        );
    }

    private Space toSpace(java.sql.ResultSet rs) throws java.sql.SQLException {
        return new Space(
                rs.getLong("id"),
                rs.getLong("city_id"),
                rs.getString("name"),
                rs.getObject("capacity") == null ? null : rs.getInt("capacity"),
                rs.getString("floor"),
                rs.getString("description"),
                rs.getBoolean("is_active"),
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






