package com.reservas.sk.locations_service.adapters.in.web;

import com.reservas.sk.locations_service.adapters.in.web.dto.ApiResponse;
import com.reservas.sk.locations_service.adapters.in.web.dto.CityResponse;
import com.reservas.sk.locations_service.adapters.in.web.dto.CreateCityRequest;
import com.reservas.sk.locations_service.adapters.in.web.dto.CreateSpaceRequest;
import com.reservas.sk.locations_service.adapters.in.web.dto.SpaceResponse;
import com.reservas.sk.locations_service.adapters.in.web.dto.UpdateCityRequest;
import com.reservas.sk.locations_service.adapters.in.web.dto.UpdateSpaceRequest;
import com.reservas.sk.locations_service.application.port.in.LocationsUseCase;
import com.reservas.sk.locations_service.application.usecase.CreateCityCommand;
import com.reservas.sk.locations_service.application.usecase.CreateSpaceCommand;
import com.reservas.sk.locations_service.application.usecase.ListSpacesQuery;
import com.reservas.sk.locations_service.application.usecase.UpdateCityCommand;
import com.reservas.sk.locations_service.application.usecase.UpdateSpaceCommand;
import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/locations")
@SuppressFBWarnings(
        value = "EI_EXPOSE_REP2",
        justification = "Controller dependencies are injected and managed by Spring."
)
public class LocationsController {
    private final LocationsUseCase useCase;
    private final LocationsHttpMapper mapper;

    public LocationsController(LocationsUseCase useCase, LocationsHttpMapper mapper) {
        this.useCase = useCase;
        this.mapper = mapper;
    }

    @PostMapping("/cities")
    // Human Check 🛡️: @Valid activa validacion de campos requeridos para crear ciudad.
    public ResponseEntity<ApiResponse<CityResponse>> createCity(@Valid @RequestBody CreateCityRequest request) {
        var city = useCase.createCity(new CreateCityCommand(request.name(), request.country()));
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(mapper.toResponse(city)));
    }

    @GetMapping("/cities")
    public ApiResponse<List<CityResponse>> listCities() {
        var cities = useCase.listCities();
        return ApiResponse.success(cities.stream().map(mapper::toResponse).toList());
    }

    @GetMapping("/cities/{id}")
    public ApiResponse<CityResponse> getCity(@PathVariable Long id) {
        return ApiResponse.success(mapper.toResponse(useCase.getCityById(id)));
    }

    @PutMapping("/cities/{id}")
    // Human Check 🛡️: @Valid valida formato de payload antes de aplicar update de ciudad.
    public ApiResponse<CityResponse> updateCity(@PathVariable Long id,
                                                @Valid @RequestBody UpdateCityRequest request) {
        var city = useCase.updateCity(id, new UpdateCityCommand(request.name(), request.country()));
        return ApiResponse.success(mapper.toResponse(city));
    }

    @DeleteMapping("/cities/{id}")
    public ResponseEntity<Void> deleteCity(@PathVariable Long id) {
        useCase.deleteCity(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/spaces")
    // Human Check 🛡️: @Valid evita crear espacios con cityId/name/capacity invalidos.
    public ResponseEntity<ApiResponse<SpaceResponse>> createSpace(@Valid @RequestBody CreateSpaceRequest request) {
        var space = useCase.createSpace(new CreateSpaceCommand(
                request.cityId(),
                request.name(),
                request.capacity(),
                request.floor(),
                request.description(),
                request.imageUrl(),
                request.isActive()
        ));
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(mapper.toResponse(space)));
    }

    @GetMapping("/spaces")
    public ApiResponse<List<SpaceResponse>> listSpaces(@RequestParam(required = false) Long cityId,
                                                       @RequestParam(required = false) Boolean activeOnly) {
        var spaces = useCase.listSpaces(new ListSpacesQuery(cityId, activeOnly));
        return ApiResponse.success(spaces.stream().map(mapper::toResponse).toList());
    }

    @GetMapping("/spaces/{id}")
    public ApiResponse<SpaceResponse> getSpace(@PathVariable Long id) {
        return ApiResponse.success(mapper.toResponse(useCase.getSpaceById(id)));
    }

    @PutMapping("/spaces/{id}")
    // Human Check 🛡️: @Valid valida capacity en update para prevenir datos inconsistentes o errones.
    public ApiResponse<SpaceResponse> updateSpace(@PathVariable Long id,
                                                  @Valid @RequestBody UpdateSpaceRequest request) {
        var space = useCase.updateSpace(id, new UpdateSpaceCommand(
                request.name(),
                request.capacity(),
                request.floor(),
                request.description(),
                request.imageUrl(),
                request.isActive()
        ));
        return ApiResponse.success(mapper.toResponse(space));
    }

    @DeleteMapping("/spaces/{id}")
    public ResponseEntity<Void> deleteSpace(@PathVariable Long id) {
        useCase.deleteSpace(id);
        return ResponseEntity.noContent().build();
    }
}





