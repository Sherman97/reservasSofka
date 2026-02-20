import React, { useState, useRef, useEffect } from 'react';
import { useDependencies } from '../../../../core/adapters/hooks/useDependencies';

export const EquipmentSelector = ({ selectedEquipment, onEquipmentToggle, item }) => {
    const { getInventoryUseCase } = useDependencies();
    const [isOpen, setIsOpen] = useState(false);
    const [availableEquipment, setAvailableEquipment] = useState([]);
    const dropdownRef = useRef(null);

    // Fetch equipment when opening the dropdown or when cityId changes
    useEffect(() => {
        if (item?.cityId || (item?._entity?.cityId)) {
            const cityId = item.cityId || item._entity.cityId;
            const loadEquipment = async () => {
                try {
                    const data = await getInventoryUseCase.execute({ cityId });
                    setAvailableEquipment(data);
                } catch (error) {
                    console.error("Error loading equipment:", error);
                }
            };
            loadEquipment();
        }
    }, [item, getInventoryUseCase]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleToggle = (id) => {
        // Find the equipment item to pass its name if needed, though parent handles toggle
        const equipment = availableEquipment.find(e => e.id === id);
        onEquipmentToggle(id, equipment ? equipment.name : '');
    };

    const getEquipmentName = (id) => {
        const itemFound = availableEquipment.find(e => e.id === id);
        return itemFound ? itemFound.name : 'Equipo';
    };

    return (
        <div className="equipment-selector" ref={dropdownRef}>
            <div
                className={`custom-select ${isOpen ? 'open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="select-inner">
                    <label className="equipment-label-inner">Equipamiento</label>
                    <div className="selected-values">
                        {selectedEquipment.length === 0 ? (
                            <span className="placeholder">-- Selecciona equipos --</span>
                        ) : (
                            selectedEquipment.map(eq => (
                                <span key={eq.itemId} className="selected-tag" onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggle(eq.itemId);
                                }}>
                                    <span>{eq.name || getEquipmentName(eq.itemId)}</span>
                                    <span className="remove-tag">✕</span>
                                </span>
                            ))
                        )}
                    </div>
                </div>
                <div className="select-icon-group">
                    <span className="equipment-main-icon">🛠️</span>
                    <div className="select-arrow"></div>
                </div>
            </div>

            {isOpen && (
                <div className="options-dropdown">
                    {availableEquipment.length === 0 && (
                        <div className="option-item disabled">
                            <span className="option-content">No hay equipos disponibles en esta ciudad</span>
                        </div>
                    )}
                    {availableEquipment.map(equipment => (
                        <div
                            key={equipment.id}
                            className={`option-item ${!equipment.available ? 'disabled' : ''} ${selectedEquipment.some(e => e.itemId === equipment.id) ? 'selected' : ''}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (equipment.available) handleToggle(equipment.id);
                            }}
                        >
                            <span className="option-checkbox">
                                {selectedEquipment.some(e => e.itemId === equipment.id) && '✓'}
                            </span>
                            <span className="option-content">
                                {equipment.name}
                                {!equipment.available && <span className="not-available"> (No disponible)</span>}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
