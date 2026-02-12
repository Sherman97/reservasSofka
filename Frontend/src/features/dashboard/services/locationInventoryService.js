import locationsApi from '../../../services/locationsApi';

export const assignInventoryToLocation = async (locationId, inventoryId, qty) => {
    try {
        const response = await locationsApi.post(`/locations/${locationId}/inventory`, {
            inventoryId,
            qty
        });
        return { success: true, data: response.data.data };
    } catch (error) {
        console.error('Error assigning inventory:', error);
        return { success: false, error: error.response?.data?.message || 'Error al asignar inventario' };
    }
};

export const removeInventoryFromLocation = async (locationId, inventoryId) => {
    try {
        const response = await locationsApi.delete(`/locations/${locationId}/inventory/${inventoryId}`);
        return { success: true, data: response.data.data };
    } catch (error) {
        console.error('Error removing inventory:', error);
        return { success: false, error: error.response?.data?.message || 'Error al remover inventario' };
    }
};
