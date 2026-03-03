import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useReservationDependencies } from '../providers/DependencyProvider';
import { useBookingEvents } from './useBookingEvents';
import type { Reservation } from '../../../core/domain/entities/Reservation';

interface LocationInput {
    id: string;
    name: string;
    [key: string]: unknown;
}

interface SelectedEquipment {
    itemId: string;
    name: string;
    qty: number;
}

interface BusySlot {
    start: string;
    end: string;
}

interface DayAvailability {
    available: boolean;
    busySlots: BusySlot[];
}

interface UseReservationReturn {
    isOpen: boolean;
    openModal: () => void;
    closeModal: () => void;
    currentDate: Date;
    selectedDate: number | null;
    selectedEquipment: SelectedEquipment[];
    startTime: string;
    endTime: string;
    availability: Record<number, DayAvailability>;
    loading: boolean;
    error: string | null;
    busySlots: BusySlot[];
    loadingSlots: boolean;
    hasTimeConflict: boolean;
    successMessage: string | null;
    slotsUpdatedFlag: boolean;
    handleDateSelect: (day: number) => void;
    handleEquipmentToggle: (equipmentId: string, equipmentName: string) => void;
    handleStartTimeChange: (time: string) => void;
    handleEndTimeChange: (time: string) => void;
    goToPreviousMonth: () => void;
    goToNextMonth: () => void;
    handleConfirm: (onSuccess?: (reservation: Reservation) => void) => Promise<void>;
    canConfirm: boolean;
}

export const useReservation = (location: LocationInput | null | undefined): UseReservationReturn => {
    const { createReservationUseCase, getSpaceAvailabilityUseCase } = useReservationDependencies();

    const [isOpen, setIsOpen] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<number | null>(null);
    const [selectedEquipment, setSelectedEquipment] = useState<SelectedEquipment[]>([]);
    const [startTime, setStartTime] = useState('08:00');
    const [endTime, setEndTime] = useState('18:00');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [busySlots, setBusySlots] = useState<BusySlot[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [slotsUpdatedFlag, setSlotsUpdatedFlag] = useState(false);

    const selectedDateRef = useRef(selectedDate);
    const isOpenRef = useRef(isOpen);

    useEffect(() => { selectedDateRef.current = selectedDate; }, [selectedDate]);
    useEffect(() => { isOpenRef.current = isOpen; }, [isOpen]);

    const availability = useMemo((): Record<number, DayAvailability> => {
        if (!isOpen) return {};
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const availabilityMap: Record<number, DayAvailability> = {};
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
            availabilityMap[day] = { available: !isPast, busySlots: [] };
        }
        return availabilityMap;
    }, [isOpen, currentDate]);

    const fetchBusySlots = useCallback(async (day: number, { silent = false } = {}): Promise<void> => {
        if (!location?.id || !day) { setBusySlots([]); return; }
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const dayStr = String(day).padStart(2, '0');
        const dateString = `${year}-${month}-${dayStr}`;
        if (!silent) setLoadingSlots(true);
        try {
            const result = await getSpaceAvailabilityUseCase.execute(location.id, dateString);
            const newSlots = result.busySlots || [];
            setBusySlots(prevSlots => {
                const changed = JSON.stringify(prevSlots) !== JSON.stringify(newSlots);
                if (changed && silent) {
                    setSlotsUpdatedFlag(true);
                    setTimeout(() => setSlotsUpdatedFlag(false), 3000);
                }
                return newSlots;
            });
        } catch (err) {
            console.error('Error fetching availability:', err);
            if (!silent) setBusySlots([]);
        } finally {
            if (!silent) setLoadingSlots(false);
        }
    }, [location?.id, currentDate, getSpaceAvailabilityUseCase]);

    const handleBookingEvent = useCallback(() => {
        if (selectedDateRef.current) fetchBusySlots(selectedDateRef.current, { silent: true });
    }, [fetchBusySlots]);

    useBookingEvents(isOpen ? location?.id : null, handleBookingEvent);

    useEffect(() => {
        if (!isOpen || !selectedDate || !location?.id) return;
        const intervalId = setInterval(() => {
            if (isOpenRef.current && selectedDateRef.current)
                fetchBusySlots(selectedDateRef.current, { silent: true });
        }, 15000);
        return () => clearInterval(intervalId);
    }, [isOpen, selectedDate, location?.id, fetchBusySlots]);

    const openModal = (): void => { setIsOpen(true); setError(null); };
    const closeModal = (): void => {
        setIsOpen(false); setSelectedDate(null); setSelectedEquipment([]);
        setStartTime('08:00'); setEndTime('18:00'); setError(null);
        setBusySlots([]); setSuccessMessage(null); setSlotsUpdatedFlag(false);
    };

    const handleDateSelect = (day: number): void => {
        if (availability[day]?.available) { setSelectedDate(day); setError(null); setSuccessMessage(null); fetchBusySlots(day); }
    };

    const handleEquipmentToggle = (equipmentId: string, equipmentName: string): void => {
        setSelectedEquipment(prev => {
            const existingIndex = prev.findIndex(item => item.itemId === equipmentId);
            if (existingIndex !== -1) return prev.filter(item => item.itemId !== equipmentId);
            else return [...prev, { itemId: equipmentId, name: equipmentName, qty: 1 }];
        });
    };

    const handleStartTimeChange = (time: string): void => { setStartTime(time); setError(null); setSuccessMessage(null); };
    const handleEndTimeChange = (time: string): void => { setEndTime(time); setError(null); setSuccessMessage(null); };

    const goToPreviousMonth = (): void => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
        setSelectedDate(null); setBusySlots([]);
    };
    const goToNextMonth = (): void => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
        setSelectedDate(null); setBusySlots([]);
    };

    const hasTimeConflict = useMemo((): boolean => {
        if (successMessage) return false;
        if (!busySlots.length || !startTime || !endTime) return false;
        return busySlots.some(slot => startTime < slot.end && endTime > slot.start);
    }, [busySlots, startTime, endTime, successMessage]);

    const handleConfirm = async (onSuccess?: (reservation: Reservation) => void): Promise<void> => {
        if (!selectedDate) { setError('Por favor selecciona una fecha'); return; }
        if (startTime >= endTime) { setError('La hora de fin debe ser posterior a la hora de inicio'); return; }
        if (hasTimeConflict) { setError('El horario seleccionado se solapa con una reserva existente. Por favor elige otro horario.'); return; }
        if (!location) { setError('No hay ubicación seleccionada'); return; }

        setLoading(true); setError(null); setSuccessMessage(null);
        try {
            const year = currentDate.getFullYear();
            const month = String(currentDate.getMonth() + 1).padStart(2, '0');
            const day = String(selectedDate).padStart(2, '0');
            const dateString = `${year}-${month}-${day}`;

            const reservationData = {
                locationId: location.id, locationName: location.name, date: dateString,
                startTime, endTime, equipment: selectedEquipment.map(eq => eq.itemId)
            };

            const reservation = await createReservationUseCase.execute(reservationData);

            setSuccessMessage(`¡Reserva creada exitosamente! (${startTime} - ${endTime})`);
            setStartTime('08:00'); setEndTime('18:00'); setSelectedEquipment([]);
            await fetchBusySlots(selectedDate);
            if (onSuccess) onSuccess(reservation);
        } catch (err) {
            console.error('Error creating reservation:', err);
            setError((err as Error).message || 'Error al crear la reserva');
        } finally {
            setLoading(false);
        }
    };

    const canConfirm = selectedDate !== null && startTime < endTime && !loading && !hasTimeConflict;

    return {
        isOpen, openModal, closeModal, currentDate, selectedDate, selectedEquipment,
        startTime, endTime, availability, loading, error, busySlots, loadingSlots,
        hasTimeConflict, successMessage, slotsUpdatedFlag, handleDateSelect,
        handleEquipmentToggle, handleStartTimeChange, handleEndTimeChange,
        goToPreviousMonth, goToNextMonth, handleConfirm, canConfirm
    };
};
