import React, { useState, useEffect, useCallback } from 'react';
import { useDependencies } from '../../../../core/adapters/hooks/useDependencies';
import '../../../styles/dashboard/InventoryAssignmentModal.css';

/**
 * InventoryAssignmentModal - Component
 * Manages inventory assignment for a specific location
 */
export const InventoryAssignmentModal = ({ isOpen, location, onClose, onSuccess }) => {
    const {
        getInventoryUseCase,
        assignInventoryUseCase,
        removeInventoryUseCase
    } = useDependencies();

    const [availableInventory, setAvailableInventory] = useState([]);
    const [selectedItem, setSelectedItem] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadInventory = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Get all inventory items
            const inventory = await getInventoryUseCase.execute();
            setAvailableInventory(inventory);
        } catch (err) {
            console.error('Error loading inventory:', err);
            setError('Error al cargar el inventario disponible');
        } finally {
            setLoading(false);
        }
    }, [getInventoryUseCase]);

    useEffect(() => {
        if (isOpen) {
            loadInventory();
        }
    }, [isOpen, loadInventory]);

    const handleAssign = async () => {
        if (!selectedItem || quantity < 1) {
            alert('Por favor selecciona un artículo y una cantidad válida');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            await assignInventoryUseCase.execute({
                locationId: location.id,
                inventoryId: selectedItem,
                qty: quantity
            });

            alert('Inventario asignado exitosamente');
            setSelectedItem('');
            setQuantity(1);
            if (onSuccess) onSuccess();
        } catch (err) {
            console.error('Error assigning inventory:', err);
            alert(err.message || 'Error al asignar inventario');
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (inventoryId) => {
        if (!window.confirm('¿Estás seguro de remover este artículo de la locación?')) {
            return;
        }

        setLoading(true);
        setError(null);
        try {
            await removeInventoryUseCase.execute({
                locationId: location.id,
                inventoryId
            });

            alert('Inventario removido exitosamente');
            if (onSuccess) onSuccess();
        } catch (err) {
            console.error('Error removing inventory:', err);
            alert(err.message || 'Error al remover inventario');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content inventory-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>✕</button>

                <div className="modal-header">
                    <h2>Gestionar Inventario - {location.name}</h2>
                    <p className="modal-subtitle">📍 {location.subtitle || 'Sede Central'}</p>
                </div>

                <div className="modal-body">
                    {error && <div className="error-message">{error}</div>}

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
                                    disabled={loading}
                                >
                                    <option value="">Selecciona un artículo...</option>
                                    {availableInventory.map((item) => (
                                        <option key={item.id} value={item.id}>
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
                                    disabled={loading}
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
