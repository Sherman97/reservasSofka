import React, { useState, useRef, useEffect } from 'react';
import { fetchEquipment } from '../../services/reservationService';

export const EquipmentSelector = ({ selectedEquipment, onEquipmentToggle, item }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [availableEquipment, setAvailableEquipment] = useState([]);
    const dropdownRef = useRef(null);

    // Fetch equipment when opening the dropdown or when cityId changes
    useEffect(() => {
        if (item?.cityId) {
            const loadEquipment = async () => {
                const data = await fetchEquipment(item.cityId);
                console.log(data);
                setAvailableEquipment(data);
            };
            loadEquipment();
        }
    }, [item?.cityId]);

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
        onEquipmentToggle(id);
    };

    const getEquipmentName = (id) => {
        console.log(id);
        const itemFound = availableEquipment.find(e => e.id === id);
        console.log(itemFound);
        return itemFound ? `${itemFound.name}` : '';
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
                            selectedEquipment.map(id => (
                                <span key={id} className="selected-tag" onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggle(id);
                                }}>
                                    <span>{getEquipmentName(id)}</span>
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
                            className={`option-item ${!equipment.available ? 'disabled' : ''} ${selectedEquipment.includes(equipment.id) ? 'selected' : ''}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (equipment.available) handleToggle(equipment.id);
                            }}
                        >
                            <span className="option-checkbox">
                                {selectedEquipment.includes(equipment.id) && '✓'}
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
