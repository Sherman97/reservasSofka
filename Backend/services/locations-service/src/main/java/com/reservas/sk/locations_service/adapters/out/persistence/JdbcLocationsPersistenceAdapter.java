package com.reservas.sk.locations_service.adapters.out.persistence;

import com.reservas.sk.locations_service.application.port.out.LocationsPersistencePort;
import com.reservas.sk.locations_service.domain.model.City;
import com.reservas.sk.locations_service.domain.model.Space;
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
import java.util.List;
import java.util.Optional;

@Component
@SuppressFBWarnings(
        value = "EI_EXPOSE_REP2",
        justification = "Spring-managed dependency is injected and not copied."
)
public class JdbcLocationsPersistenceAdapter implements LocationsPersistencePort {
    private static final int SPACES_QUERY_CAPACITY = 192;
    private static final String COLUMN_NAME = "name";

    private final JdbcTemplate jdbcTemplate;
    private final SimpleJdbcInsert cityInsert;
    private final SimpleJdbcInsert spaceInsert;

    public JdbcLocationsPersistenceAdapter(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
        this.cityInsert = new SimpleJdbcInsert(jdbcTemplate)
                .withTableName("cities")
                .usingGeneratedKeyColumns("id");
        this.spaceInsert = new SimpleJdbcInsert(jdbcTemplate)
                .withTableName("spaces")
                .usingGeneratedKeyColumns("id");
    }

    @Override
    public long insertCity(String name, String country) {
        Number key = cityInsert.executeAndReturnKey(
                new MapSqlParameterSource()
                        .addValue(COLUMN_NAME, name)
                        .addValue("country", country)
        );
        return key.longValue();
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
                            String imageUrl,
                            boolean isActive) {
        Number key = spaceInsert.executeAndReturnKey(
                new MapSqlParameterSource()
                .addValue("city_id", cityId)
                .addValue(COLUMN_NAME, name)
                .addValue("capacity", capacity)
                .addValue("floor", floor)
                .addValue("description", description)
                        .addValue("image_url", imageUrl)
                        .addValue("is_active", isActive)
        );
        return key.longValue();
    }

    @Override
    public List<Space> listSpaces(Long cityId, Boolean activeOnly) {
        StringBuilder sql = new StringBuilder(SPACES_QUERY_CAPACITY);
        sql.append(
                "SELECT id, city_id, name, capacity, floor, description, image_url, is_active, created_at, updated_at FROM spaces"
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
                SELECT id, city_id, name, capacity, floor, description, image_url, is_active, created_at, updated_at
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
                            String imageUrl,
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
        if (imageUrl != null) {
            fields.add("image_url = ?");
            params.add(imageUrl);
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
                rs.getString(COLUMN_NAME),
                rs.getString("country"),
                toInstant(rs.getTimestamp("created_at")),
                toInstant(rs.getTimestamp("updated_at"))
        );
    }

    private Space toSpace(java.sql.ResultSet rs) throws java.sql.SQLException {
        return new Space(
                rs.getLong("id"),
                rs.getLong("city_id"),
                rs.getString(COLUMN_NAME),
                rs.getObject("capacity") == null ? null : rs.getInt("capacity"),
                rs.getString("floor"),
                rs.getString("description"),
                rs.getString("image_url"),
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





