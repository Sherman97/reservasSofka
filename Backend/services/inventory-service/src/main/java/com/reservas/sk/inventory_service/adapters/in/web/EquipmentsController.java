package com.reservas.sk.inventory_service.adapters.in.web;

import com.reservas.sk.inventory_service.adapters.in.web.dto.ApiResponse;
import com.reservas.sk.inventory_service.adapters.in.web.dto.CreateEquipmentRequest;
import com.reservas.sk.inventory_service.adapters.in.web.dto.EquipmentResponse;
import com.reservas.sk.inventory_service.adapters.in.web.dto.UpdateEquipmentRequest;
import com.reservas.sk.inventory_service.application.port.in.InventoryUseCase;
import com.reservas.sk.inventory_service.application.usecase.CreateEquipmentCommand;
import com.reservas.sk.inventory_service.application.usecase.ListEquipmentsQuery;
import com.reservas.sk.inventory_service.application.usecase.UpdateEquipmentCommand;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/inventory/equipments")
public class EquipmentsController {
    private final InventoryUseCase useCase;
    private final InventoryHttpMapper mapper;

    public EquipmentsController(InventoryUseCase useCase, InventoryHttpMapper mapper) {
        this.useCase = useCase;
        this.mapper = mapper;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<EquipmentResponse>> create(@RequestBody CreateEquipmentRequest request) {
        var created = useCase.createEquipment(new CreateEquipmentCommand(
                request.cityId(),
                request.name(),
                request.serial(),
                request.barcode(),
                request.model(),
                request.status(),
                request.notes()
        ));
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(mapper.toResponse(created)));
    }

    @GetMapping
    public ApiResponse<List<EquipmentResponse>> list(@RequestParam(required = false) Long cityId,
                                                     @RequestParam(required = false) String status) {
        var list = useCase.listEquipments(new ListEquipmentsQuery(cityId, status));
        return ApiResponse.success(list.stream().map(mapper::toResponse).toList());
    }

    @GetMapping("/{id}")
    public ApiResponse<EquipmentResponse> getById(@PathVariable Long id) {
        return ApiResponse.success(mapper.toResponse(useCase.getEquipmentById(id)));
    }

    @PutMapping("/{id}")
    public ApiResponse<EquipmentResponse> update(@PathVariable Long id,
                                                 @RequestBody UpdateEquipmentRequest request) {
        var updated = useCase.updateEquipment(id, new UpdateEquipmentCommand(
                request.name(),
                request.serial(),
                request.barcode(),
                request.model(),
                request.status(),
                request.notes()
        ));
        return ApiResponse.success(mapper.toResponse(updated));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Map<String, Long>> delete(@PathVariable Long id) {
        var deleted = useCase.deleteEquipment(id);
        return ApiResponse.success(Map.of("id", deleted.id()));
    }
}







