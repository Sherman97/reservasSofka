import React, { useState, useRef, useEffect } from 'react';
import { getItems } from '../../services/dashboardService';
import { InventoryAssignmentModal } from './InventoryAssignmentModal';

export const EquipmentSelector = ({ selectedEquipment, onEquipmentToggle, item, onInventoryUpdate }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [availableEquipment, setAvailableEquipment] = useState([]);
    const [showInventoryModal, setShowInventoryModal] = useState(false);
    const dropdownRef = useRef(null);

    // Load equipment from backend
    useEffect(() => {
        loadEquipment();
    }, []);

    const loadEquipment = async () => {
        try {
            const items = await getItems();
            // Filter only equipment items (not locations)
            const equipment = items
                .filter(item => !item.isLocation && item.available)
                .map(item => ({
                    id: item.backendId,
                    name: item.name,
                    available: item.available,
                    category: item.category
                }));
            setAvailableEquipment(equipment);
        } catch (error) {
            console.error('Error loading equipment:', error);
        }
    };

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

    const handleToggle = (equipmentId, equipmentName) => {
        onEquipmentToggle(equipmentId, equipmentName);
    };

    const handleInventoryManagement = (e) => {
        e.stopPropagation();
        setIsOpen(false);
        setShowInventoryModal(true);
    };

    const handleInventorySuccess = () => {
        // Reload equipment list and notify parent
        loadEquipment();
        if (onInventoryUpdate) {
            onInventoryUpdate();
        }
    };

    const getEquipmentName = (id) => {
        const item = availableEquipment.find(e => e.id === id);
        return item ? item.name : '';
    };

    return (
        <>
            <div className="equipment-selector" ref={dropdownRef}>
                <div
                    className={`custom-select ${isOpen ? 'open' : ''}`}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <div className="select-inner">
                        <label className="equipment-label-inner">Equipamiento Adicional</label>
                        <div className="selected-values">
                            {selectedEquipment.length === 0 ? (
                                <span className="placeholder">-- Selecciona equipos --</span>
                            ) : (
                                selectedEquipment.map(item => (
                                    <span key={item.itemId} className="selected-tag" onClick={(e) => {
                                        e.stopPropagation();
                                        handleToggle(item.itemId, item.name);
                                    }}>
                                        <span>{item.name} (x{item.qty})</span>
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
                        {/* Inventory Management Button - Only for locations */}
                        {item && item.isLocation && (
                            <div
                                className="option-item inventory-management-option"
                                onClick={handleInventoryManagement}
                            >
                                <span className="option-icon">🔧</span>
                                <span className="option-content">Gestionar Inventario de Locación</span>
                            </div>
                        )}

                        {/* Equipment List */}
                        {availableEquipment.length === 0 ? (
                            <div className="option-item disabled">
                                <span className="option-content">Cargando equipos...</span>
                            </div>
                        ) : (
                            availableEquipment.map(equipment => {
                                const isSelected = selectedEquipment.some(item => item.itemId === equipment.id);
                                const selectedItem = selectedEquipment.find(item => item.itemId === equipment.id);

                                return (
                                    <div
                                        key={equipment.id}
                                        className={`option-item ${!equipment.available ? 'disabled' : ''} ${isSelected ? 'selected' : ''}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (equipment.available) handleToggle(equipment.id, equipment.name);
                                        }}
                                    >
                                        <span className="option-checkbox">
                                            {isSelected && '✓'}
                                        </span>
                                        <span className="option-content">
                                            {equipment.name}
                                            {isSelected && ` (x${selectedItem.qty})`}
                                            {!equipment.available && <span className="not-available"> (No disponible)</span>}
                                        </span>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </div>

            {/* Inventory Assignment Modal */}
            {item && item.isLocation && (
                <InventoryAssignmentModal
                    isOpen={showInventoryModal}
                    location={item}
                    onClose={() => setShowInventoryModal(false)}
                    onSuccess={handleInventorySuccess}
                />
            )}
        </>
    );
};
