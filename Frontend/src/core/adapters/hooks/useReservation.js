import { useState, useMemo } from 'react';
import { useReservationDependencies } from '../providers/DependencyProvider';

/**
 * useReservation - Adapter Hook
 * Connects UI to CreateReservation use case
 * Manages UI state for reservation modal, calendar, equipment selection
 */
export const useReservation = (location) => {
    const { createReservationUseCase } = useReservationDependencies();

    const [isOpen, setIsOpen] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedEquipment, setSelectedEquipment] = useState([]);
    const [startTime, setStartTime] = useState('08:00');
    const [endTime, setEndTime] = useState('18:00');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Mock availability - in real scenario would fetch from API
    const availability = useMemo(() => {
        if (!isOpen) return {};

        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const availabilityMap = {};

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));

            availabilityMap[day] = {
                available: !isPast,
                busySlots: []
            };
        }

        return availabilityMap;
    }, [isOpen, currentDate]);

    const openModal = () => {
        setIsOpen(true);
        setError(null);
    };

    const closeModal = () => {
        setIsOpen(false);
        setSelectedDate(null);
        setSelectedEquipment([]);
        setStartTime('08:00');
        setEndTime('18:00');
        setError(null);
    };

    const handleDateSelect = (day) => {
        if (availability[day]?.available) {
            setSelectedDate(day);
            setError(null);
        }
    };

    const handleEquipmentToggle = (equipmentId, equipmentName) => {
        setSelectedEquipment(prev => {
            const existingIndex = prev.findIndex(item => item.itemId === equipmentId);

            if (existingIndex !== -1) {
                // If already selected, remove it
                return prev.filter(item => item.itemId !== equipmentId);
            } else {
                // If not selected, add it with qty 1
                return [...prev, { itemId: equipmentId, name: equipmentName, qty: 1 }];
            }
        });
    };

    const handleStartTimeChange = (time) => {
        setStartTime(time);
        setError(null);
    };

    const handleEndTimeChange = (time) => {
        setEndTime(time);
        setError(null);
    };

    const goToPreviousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    };

    const goToNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    };

    const handleConfirm = async (onSuccess) => {
        if (!selectedDate) {
            setError('Por favor selecciona una fecha');
            return;
        }

        if (startTime >= endTime) {
            setError('La hora de fin debe ser posterior a la hora de inicio');
            return;
        }

        if (!location) {
            setError('No hay ubicación seleccionada');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const year = currentDate.getFullYear();
            const month = String(currentDate.getMonth() + 1).padStart(2, '0');
            const day = String(selectedDate).padStart(2, '0');
            const dateString = `${year}-${month}-${day}`;

            const reservationData = {
                locationId: location.id,
                locationName: location.name,
                date: dateString,
                startTime,
                endTime,
                equipment: selectedEquipment.map(eq => eq.itemId)
            };

            const reservation = await createReservationUseCase.execute(reservationData);

            // Success - close modal and callback
            closeModal();
            if (onSuccess) {
                onSuccess(reservation);
            }
        } catch (err) {
            console.error('Error creating reservation:', err);
            setError(err.message || 'Error al crear la reserva');
        } finally {
            setLoading(false);
        }
    };

    const canConfirm = selectedDate !== null && startTime < endTime && !loading;

    return {
        isOpen,
        openModal,
        closeModal,
        currentDate,
        selectedDate,
        selectedEquipment,
        startTime,
        endTime,
        availability,
        loading,
        error,
        handleDateSelect,
        handleEquipmentToggle,
        handleStartTimeChange,
        handleEndTimeChange,
        goToPreviousMonth,
        goToNextMonth,
        handleConfirm,
        canConfirm
    };
};
