import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { UpdateReservationModal } from './UpdateReservationModal';

const reservation = {
  id: 1,
  locationName: 'Sala A',
  startAt: '2026-04-08T10:00:00',
  endAt: '2026-04-08T11:00:00',
  attendeesCount: 3,
  notes: 'nota inicial',
};

describe('UpdateReservationModal', () => {
  it('no renderiza cuando esta cerrado o no hay reserva', () => {
    const { rerender } = render(
      <UpdateReservationModal isOpen={false} onClose={vi.fn()} onConfirm={vi.fn()} reservation={reservation} />,
    );
    expect(screen.queryByText('Actualizar Reserva')).not.toBeInTheDocument();

    rerender(<UpdateReservationModal isOpen onClose={vi.fn()} onConfirm={vi.fn()} reservation={null} />);
    expect(screen.queryByText('Actualizar Reserva')).not.toBeInTheDocument();
  });

  it('muestra error local cuando hora inicio >= hora fin', () => {
    const { container } = render(
      <UpdateReservationModal isOpen onClose={vi.fn()} onConfirm={vi.fn()} reservation={reservation} />,
    );

    const timeInputs = container.querySelectorAll('input[type="time"]');
    const startInput = timeInputs[0];
    const endInput = timeInputs[1];

    fireEvent.change(startInput, { target: { value: '11:30' } });
    fireEvent.change(endInput, { target: { value: '11:00' } });
    fireEvent.click(screen.getByText('Guardar Cambios'));

    expect(screen.getByText('La hora de inicio debe ser menor que la hora de fin.')).toBeInTheDocument();
  });

  it('limpia error y confirma payload esperado', () => {
    const onConfirm = vi.fn();
    const { container } = render(
      <UpdateReservationModal
        isOpen
        onClose={vi.fn()}
        onConfirm={onConfirm}
        reservation={reservation}
        errorMessage="Error backend"
      />,
    );

    expect(screen.getByText('Error backend')).toBeInTheDocument();

    const timeInputs = container.querySelectorAll('input[type="time"]');
    const startInput = timeInputs[0];
    const endInput = timeInputs[1];
    const attendeesInput = container.querySelector('input[type="number"]');
    const notesInput = container.querySelector('textarea');

    fireEvent.change(startInput, { target: { value: '09:00' } });
    fireEvent.change(endInput, { target: { value: '10:00' } });
    fireEvent.change(attendeesInput, { target: { value: '5' } });
    fireEvent.change(notesInput, { target: { value: 'nuevo' } });
    fireEvent.click(screen.getByText('Guardar Cambios'));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    const payload = onConfirm.mock.calls[0][0];
    expect(payload.attendeesCount).toBe(5);
    expect(payload.notes).toBe('nuevo');
    expect(new Date(payload.startAt).toString()).not.toBe('Invalid Date');
    expect(new Date(payload.endAt).toString()).not.toBe('Invalid Date');
    expect(new Date(payload.startAt).getTime()).toBeLessThan(new Date(payload.endAt).getTime());
  });
});
