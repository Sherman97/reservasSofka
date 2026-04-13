package com.reservas.sk.locations_service.application.service;

import com.reservas.sk.locations_service.application.port.in.LocationsUseCase;
import com.reservas.sk.locations_service.application.port.out.LocationEventPublisherPort;
import com.reservas.sk.locations_service.application.port.out.LocationsPersistencePort;
import com.reservas.sk.locations_service.application.port.out.QrCodeImageGeneratorPort;
import com.reservas.sk.locations_service.application.port.out.QrTokenGeneratorPort;
import com.reservas.sk.locations_service.application.usecase.CityCreatedEvent;
import com.reservas.sk.locations_service.application.usecase.CityDeletedEvent;
import com.reservas.sk.locations_service.application.usecase.CityUpdatedEvent;
import com.reservas.sk.locations_service.application.usecase.CreateCityCommand;
import com.reservas.sk.locations_service.application.usecase.CreateSpaceCommand;
import com.reservas.sk.locations_service.application.usecase.ListSpacesQuery;
import com.reservas.sk.locations_service.application.usecase.SpaceCreatedEvent;
import com.reservas.sk.locations_service.application.usecase.SpaceDeletedEvent;
import com.reservas.sk.locations_service.application.usecase.SpaceUpdatedEvent;
import com.reservas.sk.locations_service.application.usecase.UpdateCityCommand;
import com.reservas.sk.locations_service.application.usecase.UpdateSpaceCommand;
import com.reservas.sk.locations_service.domain.model.City;
import com.reservas.sk.locations_service.domain.model.Space;
import com.reservas.sk.locations_service.exception.ApiException;
import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.List;

@Service
@SuppressFBWarnings(
        value = "EI_EXPOSE_REP2",
        justification = "Ports are Spring-managed dependencies."
)
// Human Check 🛡️: se agregan codigos de error y validacion ante posibles errores al crear la locacion y demas
public class LocationsApplicationService implements LocationsUseCase {
    private static final Logger log = LoggerFactory.getLogger(LocationsApplicationService.class);
    
    private final LocationsPersistencePort persistencePort;
    private final LocationEventPublisherPort eventPublisherPort;
    private final QrTokenGeneratorPort qrTokenGeneratorPort;
    private final QrCodeImageGeneratorPort qrCodeImageGeneratorPort;

    public LocationsApplicationService(LocationsPersistencePort persistencePort,
                                       LocationEventPublisherPort eventPublisherPort,
                                       QrTokenGeneratorPort qrTokenGeneratorPort,
                                       QrCodeImageGeneratorPort qrCodeImageGeneratorPort) {
        this.persistencePort = persistencePort;
        this.eventPublisherPort = eventPublisherPort;
        this.qrTokenGeneratorPort = qrTokenGeneratorPort;
        this.qrCodeImageGeneratorPort = qrCodeImageGeneratorPort;
    }

    @Override
    public City createCity(CreateCityCommand command) {
        String name = normalizeRequired(command.name(), "name es obligatorio");
        String country = normalizeRequired(command.country(), "country es obligatorio");

        long id = persistencePort.insertCity(name, country);
        City created = getCityById(id);
        eventPublisherPort.publishCityCreated(new CityCreatedEvent(
                created.getId(),
                created.getName(),
                created.getCountry(),
                java.time.Instant.now()
        ));
        return created;
    }

    @Override
    public List<City> listCities() {
        return persistencePort.listCities();
    }

    @Override
    public City getCityById(Long id) {
        long cityId = requirePositive(id, "id es invalido");
        return persistencePort.findCityById(cityId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Ciudad no encontrada", "CITY_NOT_FOUND"));
    }

    @Override
    public City updateCity(Long id, UpdateCityCommand command) {
        City existing = getCityById(id);
        persistencePort.updateCity(existing.getId(), normalizeNullable(command.name()), normalizeNullable(command.country()));
        City updated = getCityById(existing.getId());
        eventPublisherPort.publishCityUpdated(new CityUpdatedEvent(
                updated.getId(),
                updated.getName(),
                updated.getCountry(),
                java.time.Instant.now()
        ));
        return updated;
    }

    @Override
    public void deleteCity(Long id) {
        City existing = getCityById(id);
        int affected = persistencePort.deleteCity(existing.getId());
        if (affected == 0) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Ciudad no encontrada", "CITY_NOT_FOUND");
        }
        eventPublisherPort.publishCityDeleted(new CityDeletedEvent(existing.getId(), java.time.Instant.now()));
    }

    @Override
    public Space createSpace(CreateSpaceCommand command) {
        long cityId = requirePositive(command.cityId(), "cityId es obligatorio");
        if (!persistencePort.existsCity(cityId)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Ciudad no encontrada", "CITY_NOT_FOUND");
        }

        String name = normalizeRequired(command.name(), "name es obligatorio");
        Integer capacity = normalizeCapacity(command.capacity());
        boolean isActive = command.isActive() == null || command.isActive();

        long id = persistencePort.insertSpace(
                cityId,
                name,
                capacity,
                normalizeNullable(command.floor()),
                normalizeNullable(command.description()),
                normalizeNullable(command.imageUrl()),
                isActive
        );

        // Generate QR code for the space
        try {
            String qrToken = qrTokenGeneratorPort.generateQrToken(id);
            byte[] qrImageData = qrCodeImageGeneratorPort.generateQrCodeImage(qrToken);
            String qrETag = calculateSha256Hash(qrImageData);
            
            persistencePort.updateSpaceQrData(id, qrImageData, qrToken, qrETag);
            log.info("QR code generated successfully for space {}", id);
        } catch (Exception e) {
            log.error("Failed to generate QR code for space {}: {}", id, e.getMessage(), e);
            // Continue without QR - it can be regenerated later if needed
        }

        Space created = getSpaceById(id);
        eventPublisherPort.publishSpaceCreated(new SpaceCreatedEvent(
                created.getId(),
                created.getCityId(),
                created.getName(),
                created.isActive(),
                java.time.Instant.now()
        ));
        return created;
    }

    @Override
    public List<Space> listSpaces(ListSpacesQuery query) {
        return persistencePort.listSpaces(query.cityId(), query.activeOnly());
    }

    @Override
    public Space getSpaceById(Long id) {
        long spaceId = requirePositive(id, "id es invalido");
        return persistencePort.findSpaceById(spaceId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Espacio no encontrado", "SPACE_NOT_FOUND"));
    }

    @Override
    public Space updateSpace(Long id, UpdateSpaceCommand command) {
        Space existing = getSpaceById(id);
        persistencePort.updateSpace(
                existing.getId(),
                normalizeNullable(command.name()),
                normalizeCapacity(command.capacity()),
                normalizeNullable(command.floor()),
                normalizeNullable(command.description()),
                normalizeNullable(command.imageUrl()),
                command.isActive()
        );
        Space updated = getSpaceById(existing.getId());
        eventPublisherPort.publishSpaceUpdated(new SpaceUpdatedEvent(
                updated.getId(),
                updated.getCityId(),
                updated.getName(),
                updated.isActive(),
                java.time.Instant.now()
        ));
        return updated;
    }

    @Override
    public void deleteSpace(Long id) {
        Space existing = getSpaceById(id);
        int affected = persistencePort.deleteSpace(existing.getId());
        if (affected == 0) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Espacio no encontrado", "SPACE_NOT_FOUND");
        }
        eventPublisherPort.publishSpaceDeleted(new SpaceDeletedEvent(
                existing.getId(),
                existing.getCityId(),
                java.time.Instant.now()
        ));
    }

    @Override
    public Space getSpaceWithQrCode(Long id) {
        return getSpaceById(id);
    }

    @Override
    public int regenerateAllSpaceQrCodes() {
        log.info("Starting QR code regeneration for all spaces");
        List<Space> allSpaces = persistencePort.listSpaces(null, null);
        int successCount = 0;
        int failureCount = 0;

        for (Space space : allSpaces) {
            try {
                // Generate QR code
                String qrToken = qrTokenGeneratorPort.generateQrToken(space.getId());
                byte[] qrImageData = qrCodeImageGeneratorPort.generateQrCodeImage(qrToken);
                String qrETag = calculateSha256Hash(qrImageData);
                
                // Update space with QR data
                persistencePort.updateSpaceQrData(space.getId(), qrImageData, qrToken, qrETag);
                successCount++;
                log.info("QR code regenerated successfully for space {} ({})", space.getId(), space.getName());
            } catch (Exception e) {
                failureCount++;
                log.error("Failed to regenerate QR code for space {} ({}): {}", 
                         space.getId(), space.getName(), e.getMessage(), e);
            }
        }

        log.info("QR code regeneration completed: {} successful, {} failed out of {} total spaces", 
                successCount, failureCount, allSpaces.size());
        return successCount;
    }

    private long requirePositive(Long value, String message) {
        if (value == null || value <= 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, message, "INVALID_ARGUMENT");
        }
        return value;
    }

    private String normalizeRequired(String value, String message) {
        String normalized = normalizeNullable(value);
        if (normalized == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, message, "REQUIRED_FIELD");
        }
        return normalized;
    }

    private Integer normalizeCapacity(Integer value) {
        if (value != null && value <= 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "capacity debe ser mayor que cero", "INVALID_CAPACITY");
        }
        return value;
    }

    private String normalizeNullable(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim();
        return normalized.isEmpty() ? null : normalized;
    }

    /**
     * Calculates SHA-256 hash of QR image data for ETag generation.
     * 
     * @param data QR image bytes
     * @return hex-encoded SHA-256 hash
     */
    private String calculateSha256Hash(byte[] data) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(data);
            
            // Convert to hex string
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            log.error("SHA-256 algorithm not available", e);
            // Fallback to timestamp-based ETag
            return String.valueOf(System.currentTimeMillis());
        }
    }
}





