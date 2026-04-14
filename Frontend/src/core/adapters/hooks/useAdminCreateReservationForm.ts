import { useMemo, useRef, useState } from 'react';

export interface AdminCreateReservationFormState {
    requesterQuery: string;
    userId: string;
    site: string;
    space: string;
    date: string;
    startTime: string;
    endTime: string;
    attendeesCount: number;
    equipment: Array<{ itemId: string; name: string; qty: number }>;
}

export interface AdminCreateReservationFormErrors {
    userId?: string;
    site?: string;
    space?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
    attendeesCount?: string;
}

const REQUIRED_FIELD_ERROR = 'Este campo es obligatorio';
const FIFTEEN_MINUTES_ERROR = 'La hora debe estar en intervalos de 15 minutos';
const TIME_RANGE_ERROR = 'La hora fin debe ser mayor que la hora inicio';

const isQuarterHour = (time: string): boolean => {
    if (!time || !time.includes(':')) return false;
    const [, minutes] = time.split(':');
    const parsedMinutes = Number(minutes);
    return Number.isInteger(parsedMinutes) && parsedMinutes % 15 === 0;
};

const DEFAULT_FORM: AdminCreateReservationFormState = {
    requesterQuery: '',
    userId: '',
    site: '',
    space: '',
    date: '',
    startTime: '',
    endTime: '',
    attendeesCount: 1,
    equipment: [],
};

interface UseAdminCreateReservationFormOptions {
    requireUserSelection?: boolean;
}

export const useAdminCreateReservationForm = (
    { requireUserSelection = true }: UseAdminCreateReservationFormOptions = {},
) => {
    const [form, setForm] = useState<AdminCreateReservationFormState>(DEFAULT_FORM);
    const formRef = useRef<AdminCreateReservationFormState>(DEFAULT_FORM);
    const [errors, setErrors] = useState<AdminCreateReservationFormErrors>({});
    const [hasConflict, setHasConflict] = useState(false);

    const setField = (name: keyof AdminCreateReservationFormState, value: string): void => {
        const nextForm = { ...formRef.current, [name]: value };
        formRef.current = nextForm;
        setForm(nextForm);
        setErrors((prev) => ({ ...prev, [name]: undefined }));
        if (hasConflict) {
            setHasConflict(false);
        }
    };

    const setSelectedUser = (user: { id: string; fullName?: string; email?: string }): void => {
        const nextForm = {
            ...formRef.current,
            userId: user.id,
            requesterQuery: user.fullName || user.email || formRef.current.requesterQuery,
        };
        formRef.current = nextForm;
        setForm(nextForm);
        setErrors((prev) => ({ ...prev, userId: undefined }));
        if (hasConflict) {
            setHasConflict(false);
        }
    };

    const setAttendeesCount = (value: number): void => {
        const safeValue = Number.isFinite(value) && value > 0 ? Math.floor(value) : 1;
        const nextForm = { ...formRef.current, attendeesCount: safeValue };
        formRef.current = nextForm;
        setForm(nextForm);
        setErrors((prev) => ({ ...prev, attendeesCount: undefined }));
        if (hasConflict) {
            setHasConflict(false);
        }
    };

    const toggleEquipment = (equipmentId: string, equipmentName: string): void => {
        const current = formRef.current.equipment || [];
        const exists = current.some((item) => item.itemId === equipmentId);
        const nextEquipment = exists
            ? current.filter((item) => item.itemId !== equipmentId)
            : [...current, { itemId: equipmentId, name: equipmentName || 'Equipo', qty: 1 }];

        const nextForm = { ...formRef.current, equipment: nextEquipment };
        formRef.current = nextForm;
        setForm(nextForm);
        if (hasConflict) {
            setHasConflict(false);
        }
    };

    const validateForm = (): boolean => {
        const currentForm = formRef.current;
        const nextErrors: AdminCreateReservationFormErrors = {};

        if (requireUserSelection && !currentForm.userId) nextErrors.userId = REQUIRED_FIELD_ERROR;
        if (!currentForm.site) nextErrors.site = REQUIRED_FIELD_ERROR;
        if (!currentForm.space) nextErrors.space = REQUIRED_FIELD_ERROR;
        if (!currentForm.date) nextErrors.date = REQUIRED_FIELD_ERROR;

        if (!currentForm.startTime) {
            nextErrors.startTime = REQUIRED_FIELD_ERROR;
        } else if (!isQuarterHour(currentForm.startTime)) {
            nextErrors.startTime = FIFTEEN_MINUTES_ERROR;
        }

        if (!currentForm.endTime) {
            nextErrors.endTime = REQUIRED_FIELD_ERROR;
        } else if (!isQuarterHour(currentForm.endTime)) {
            nextErrors.endTime = FIFTEEN_MINUTES_ERROR;
        }

        if (!currentForm.attendeesCount || currentForm.attendeesCount < 1) {
            nextErrors.attendeesCount = REQUIRED_FIELD_ERROR;
        }

        if (
            currentForm.startTime &&
            currentForm.endTime &&
            isQuarterHour(currentForm.startTime) &&
            isQuarterHour(currentForm.endTime) &&
            currentForm.endTime <= currentForm.startTime
        ) {
            nextErrors.endTime = TIME_RANGE_ERROR;
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const canSubmit = useMemo(() => {
        const hasRequiredData =
            (!requireUserSelection || Boolean(form.userId)) &&
            Boolean(form.site) &&
            Boolean(form.space) &&
            Boolean(form.date) &&
            Boolean(form.startTime) &&
            Boolean(form.endTime) &&
            Boolean(form.attendeesCount);

        const hasValidIntervals =
            isQuarterHour(form.startTime) &&
            isQuarterHour(form.endTime);

        const hasValidRange = form.endTime > form.startTime;

        return hasRequiredData && hasValidIntervals && hasValidRange && !hasConflict;
    }, [form, hasConflict, requireUserSelection]);

    const resetForm = (): void => {
        formRef.current = DEFAULT_FORM;
        setForm(DEFAULT_FORM);
        setErrors({});
        setHasConflict(false);
    };

    return {
        form,
        errors,
        hasConflict,
        canSubmit,
        setField,
        setSelectedUser,
        setAttendeesCount,
        toggleEquipment,
        setHasConflict,
        validateForm,
        resetForm,
    };
};

export default useAdminCreateReservationForm;
