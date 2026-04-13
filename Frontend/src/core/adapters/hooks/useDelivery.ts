import { useState, useCallback } from 'react';
import { useDeliveryDependencies } from '../providers/DependencyProvider';
import type { Delivery } from '../../../core/domain/entities/Delivery';

interface DeliveryFormData {
    locationId: string;
    userId: string;
    managerId: string;
    notes: string;
    date: string;
}

interface UseDeliveryReturn {
    loading: boolean;
    error: string | null;
    success: boolean;
    delivery: Delivery | null;
    submitDelivery: (data: DeliveryFormData) => Promise<void>;
    resetDelivery: () => void;
}

export const useDelivery = (): UseDeliveryReturn => {
    const { submitDeliveryUseCase } = useDeliveryDependencies();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [delivery, setDelivery] = useState<Delivery | null>(null);

    const submitDelivery = useCallback(async (data: DeliveryFormData): Promise<void> => {
        setLoading(true);
        setError(null);
        setSuccess(false);
        try {
            const result = await submitDeliveryUseCase.execute(data);
            setDelivery(result);
            setSuccess(true);
        } catch (err) {
            setError((err as Error).message || 'Error al enviar la entrega');
            setDelivery(null);
        } finally {
            setLoading(false);
        }
    }, [submitDeliveryUseCase]);

    const resetDelivery = useCallback(() => {
        setLoading(false);
        setError(null);
        setSuccess(false);
        setDelivery(null);
    }, []);

    return {
        loading,
        error,
        success,
        delivery,
        submitDelivery,
        resetDelivery,
    };
};
