import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

const HU02_COMPONENT_MODULE_PATH = './ReservationRequesterAutocomplete';

describe('HU-02 | Componente | ReservationRequesterAutocomplete', () => {
    it('ReservationRequesterAutocomplete.permite_buscar_y_seleccionar_usuario_por_autocompletado', async () => {
        let componentModule = null;
        try {
            componentModule = await import(HU02_COMPONENT_MODULE_PATH);
        } catch {
            componentModule = null;
        }

        expect(
            componentModule,
            'HU-02 Red: falta implementar ReservationRequesterAutocomplete para seleccionar usuario por busqueda/autocompletado.',
        ).toBeTruthy();
        if (!componentModule) return;

        const ReservationRequesterAutocomplete =
            componentModule.ReservationRequesterAutocomplete ?? componentModule.default;

        expect(
            ReservationRequesterAutocomplete,
            'HU-02 Red: el componente ReservationRequesterAutocomplete debe exportarse.',
        ).toBeTypeOf('function');
        if (!ReservationRequesterAutocomplete) return;

        const onSearch = vi.fn();
        const onSelectUser = vi.fn();

        render(
            <ReservationRequesterAutocomplete
                value=""
                onSearch={onSearch}
                onSelectUser={onSelectUser}
                suggestions={[
                    { id: 'u-001', fullName: 'Laura Calle', email: 'laura.calle@sofka.com' },
                ]}
            />,
        );

        const input =
            screen.queryByRole('combobox', { name: /usuario/i }) ??
            screen.getByPlaceholderText(/nombre|apellido|correo|email/i);

        fireEvent.change(input, { target: { value: 'laura' } });
        expect(onSearch).toHaveBeenCalledWith('laura');

        fireEvent.click(screen.getByText(/Laura Calle/i));
        expect(onSelectUser).toHaveBeenCalledWith(
            expect.objectContaining({ id: 'u-001' }),
        );
    });
});
