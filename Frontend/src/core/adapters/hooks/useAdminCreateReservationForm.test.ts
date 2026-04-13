import { describe, it, expect } from 'vitest';
import { act, renderHook } from '@testing-library/react';

const HU02_HOOK_MODULE_PATH = './useAdminCreateReservationForm';

describe('HU-02 | Hook | useAdminCreateReservationForm', () => {
    it('useAdminCreateReservationForm.rechaza_horarios_fuera_de_intervalos_de_15_minutos', async () => {
        let hookModule: Record<string, unknown> | null = null;
        try {
            hookModule = await import(HU02_HOOK_MODULE_PATH);
        } catch {
            hookModule = null;
        }

        expect(
            hookModule,
            'HU-02 Red: falta implementar el hook useAdminCreateReservationForm para validar intervalos de 15 minutos en frontend.',
        ).toBeTruthy();
        if (!hookModule) return;

        const useAdminCreateReservationForm = (
            hookModule.useAdminCreateReservationForm ?? hookModule.default
        ) as undefined | (() => any);

        expect(
            useAdminCreateReservationForm,
            'HU-02 Red: el hook debe exportar useAdminCreateReservationForm.',
        ).toBeTypeOf('function');
        if (!useAdminCreateReservationForm) return;

        const { result } = renderHook(() => useAdminCreateReservationForm());

        act(() => {
            result.current.setField('startTime', '09:10');
            result.current.setField('endTime', '10:20');
            result.current.validateForm();
        });

        expect(result.current.errors.startTime).toMatch(/15 minutos/i);
        expect(result.current.errors.endTime).toMatch(/15 minutos/i);
        expect(result.current.canSubmit).toBe(false);
    });
});
