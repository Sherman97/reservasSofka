import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useReservationDependencies } from './useDependencies';
import { useBookingEvents } from './useBookingEvents';

/**
 * useReservation - Adapter Hook
 * Connects UI to CreateReservation use case
 * Manages UI state for reservation modal, calendar, equipment selection
 * Fetches real availability data from the API
 * Listens to real-time WebSocket events to refresh availability automatically
 * Includes polling fallback every 15s when WebSocket is unavailable
 */
export const useReservation = (location) => {
    const { createReservationUseCase, getSpaceAvailabilityUseCase } = useReservationDependencies();

    const [isOpen, setIsOpen] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedEquipment, setSelectedEquipment] = useState([]);
    const [startTime, setStartTime] = useState('08:00');
    const [endTime, setEndTime] = useState('18:00');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [busySlots, setBusySlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [successMessage, setSuccessMessage] = useState(null);
    const [slotsUpdatedFlag, setSlotsUpdatedFlag] = useState(false);

    // Refs for stable access inside intervals/callbacks
    const selectedDateRef = useRef(selectedDate);
    const isOpenRef = useRef(isOpen);

    useEffect(() => { selectedDateRef.current = selectedDate; }, [selectedDate]);
    useEffect(() => { isOpenRef.current = isOpen; }, [isOpen]);

    // Basic availability: all future days are selectable, past days are not
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

    // Fetch busy slots when a date is selected
    // silent=true skips the loading spinner (used for background refresh)
    const fetchBusySlots = useCallback(async (day, { silent = false } = {}) => {
        if (!location?.id || !day) {
            setBusySlots([]);
            return;
        }

        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const dayStr = String(day).padStart(2, '0');
        const dateString = `${year}-${month}-${dayStr}`;

        if (!silent) setLoadingSlots(true);
        try {
            const result = await getSpaceAvailabilityUseCase.execute(location.id, dateString);
            const newSlots = result.busySlots || [];

            setBusySlots(prevSlots => {
                // Detect if slots actually changed (show update indicator)
                const changed = JSON.stringify(prevSlots) !== JSON.stringify(newSlots);
                if (changed && silent) {
                    // Only flash the indicator on background updates (not initial load)
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

    // Real-time: listen for booking events via WebSocket
    // When another user creates/cancels a reservation on this space, refresh availability
    const handleBookingEvent = useCallback(() => {
        if (selectedDateRef.current) {
            fetchBusySlots(selectedDateRef.current, { silent: true });
        }
    }, [fetchBusySlots]);

    useBookingEvents(
        isOpen ? location?.id : null, // Only subscribe while modal is open
        handleBookingEvent
    );

    // Polling fallback: refresh every 15s while modal is open and a date is selected
    // This covers the case when WebSocket/RabbitMQ is not active
    useEffect(() => {
        if (!isOpen || !selectedDate || !location?.id) return;

        const intervalId = setInterval(() => {
            if (isOpenRef.current && selectedDateRef.current) {
                fetchBusySlots(selectedDateRef.current, { silent: true });
            }
        }, 15000);

        return () => clearInterval(intervalId);
    }, [isOpen, selectedDate, location?.id, fetchBusySlots]);

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
        setBusySlots([]);
        setSuccessMessage(null);
        setSlotsUpdatedFlag(false);
    };

    const handleDateSelect = (day) => {
        if (availability[day]?.available) {
            setSelectedDate(day);
            setError(null);
            fetchBusySlots(day);
        }
    };

    const handleEquipmentToggle = (equipmentId, equipmentName) => {
        setSelectedEquipment(prev => {
            const existingIndex = prev.findIndex(item => item.itemId === equipmentId);

            if (existingIndex !== -1) {
                return prev.filter(item => item.itemId !== equipmentId);
            } else {
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
        setSelectedDate(null);
        setBusySlots([]);
    };

    const goToNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
        setSelectedDate(null);
        setBusySlots([]);
    };

    /**
     * Check if selected time range overlaps with any busy slot
     */
    const hasTimeConflict = useMemo(() => {
        if (!busySlots.length || !startTime || !endTime) return false;

        return busySlots.some(slot => {
            // Overlap: startA < endB && endA > startB
            return startTime < slot.end && endTime > slot.start;
        });
    }, [busySlots, startTime, endTime]);

    const handleConfirm = async (onSuccess) => {
        if (!selectedDate) {
            setError('Por favor selecciona una fecha');
            return;
        }

        if (startTime >= endTime) {
            setError('La hora de fin debe ser posterior a la hora de inicio');
            return;
        }

        if (hasTimeConflict) {
            setError('El horario seleccionado se solapa con una reserva existente. Por favor elige otro horario.');
            return;
        }

        if (!location) {
            setError('No hay ubicación seleccionada');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccessMessage(null);

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

            // Show success message and refresh busy slots to reflect the new reservation
            setSuccessMessage(`¡Reserva creada exitosamente! (${startTime} - ${endTime})`);
            setStartTime('08:00');
            setEndTime('18:00');
            setSelectedEquipment([]);

            // Refresh availability to show the newly created reservation
            await fetchBusySlots(selectedDate);

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

    const canConfirm = selectedDate !== null && startTime < endTime && !loading && !hasTimeConflict;

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
        busySlots,
        loadingSlots,
        hasTimeConflict,
        successMessage,
        slotsUpdatedFlag,
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
