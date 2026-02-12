import React, { useState, useEffect } from 'react';
import { assignInventoryToLocation, removeInventoryFromLocation } from '../../services/locationInventoryService';
import { getItems } from '../../services/dashboardService';
import '../../styles/InventoryAssignmentModal.css';

export const InventoryAssignmentModal = ({ isOpen, location, onClose, onSuccess }) => {
    const [availableInventory, setAvailableInventory] = useState([]);
    const [selectedItem, setSelectedItem] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadInventory();
        }
    }, [isOpen]);

    const loadInventory = async () => {
        try {
            const items = await getItems();
            // Filter only equipment items
            const equipment = items.filter(item => !item.isLocation);
            setAvailableInventory(equipment);
        } catch (error) {
            console.error('Error loading inventory:', error);
        }
    };

    const handleAssign = async () => {
        if (!selectedItem || quantity < 1) {
            alert('Por favor selecciona un artículo y una cantidad válida');
            return;
        }

        setLoading(true);
        const result = await assignInventoryToLocation(
            location.backendId,
            selectedItem,
            quantity
        );
        setLoading(false);

        if (result.success) {
            alert('Inventario asignado exitosamente');
            setSelectedItem('');
            setQuantity(1);
            if (onSuccess) onSuccess();
        } else {
            alert(result.error);
        }
    };

    const handleRemove = async (inventoryId) => {
        if (!confirm('¿Estás seguro de remover este artículo de la locación?')) {
            return;
        }

        setLoading(true);
        const result = await removeInventoryFromLocation(location.backendId, inventoryId);
        setLoading(false);

        if (result.success) {
            alert('Inventario removido exitosamente');
            if (onSuccess) onSuccess();
        } else {
            alert(result.error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content inventory-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>✕</button>

                <div className="modal-header">
                    <h2>Gestionar Inventario - {location.name}</h2>
                    <p className="modal-subtitle">📍 {location.location}</p>
                </div>

                <div className="modal-body">
                    {/* Current Inventory */}
                    <div className="inventory-section">
                        <h3>Inventario Actual</h3>
                        {location.inventory && location.inventory.length > 0 ? (
                            <div className="current-inventory-list">
                                {location.inventory.map((item) => (
                                    <div key={item.id} className="inventory-item">
                                        <div className="inventory-item-info">
                                            <span className="inventory-item-name">{item.name}</span>
                                            <span className="inventory-item-qty">Cantidad: {item.qty}</span>
                                        </div>
                                        <button
                                            className="btn-remove-small"
                                            onClick={() => handleRemove(item.id)}
                                            disabled={loading}
                                        >
                                            🗑️ Remover
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="empty-state">No hay inventario asignado</p>
                        )}
                    </div>

                    {/* Add Inventory */}
                    <div className="inventory-section">
                        <h3>Asignar Nuevo Inventario</h3>
                        <div className="assign-form">
                            <div className="form-group">
                                <label>Artículo</label>
                                <select
                                    value={selectedItem}
                                    onChange={(e) => setSelectedItem(e.target.value)}
                                    className="form-select"
                                >
                                    <option value="">Selecciona un artículo...</option>
                                    {availableInventory.map((item) => (
                                        <option key={item.id} value={item.backendId}>
                                            {item.name} ({item.category})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Cantidad</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={quantity}
                                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                    className="form-input"
                                />
                            </div>

                            <button
                                className="btn-assign"
                                onClick={handleAssign}
                                disabled={loading || !selectedItem}
                            >
                                {loading ? 'Asignando...' : '➕ Asignar Inventario'}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn-cancel" onClick={onClose}>
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};
