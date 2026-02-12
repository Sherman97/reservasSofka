import { useState, useMemo } from 'react';
import { getAvailabilityForMonth } from '../services/reservationService';

export const useReservation = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedEquipment, setSelectedEquipment] = useState([]);
    const [startTime, setStartTime] = useState('08:00');
    const [endTime, setEndTime] = useState('18:00');
    const availability = useMemo(() => {
        if (!isOpen) return {};
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        return getAvailabilityForMonth(year, month);
    }, [isOpen, currentDate]);

    const openModal = () => setIsOpen(true);
    const closeModal = () => {
        setIsOpen(false);
        setSelectedDate(null);
        setSelectedEquipment([]);
        setStartTime('08:00');
        setEndTime('18:00');
    };

    const handleDateSelect = (day) => {
        if (availability[day]?.available) {
            setSelectedDate(day);
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
    };

    const handleEndTimeChange = (time) => {
        setEndTime(time);
    };

    const goToPreviousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    };

    const goToNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    };

    const canConfirm = selectedDate !== null && startTime < endTime;

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
        handleDateSelect,
        handleEquipmentToggle,
        handleStartTimeChange,
        handleEndTimeChange,
        goToPreviousMonth,
        goToNextMonth,
        canConfirm
    };
};
