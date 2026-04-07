/**
 * Base error class for QR scanning and check-in operations.
 */
export class QrScanError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'QrScanError';
        Object.setPrototypeOf(this, QrScanError.prototype);
    }
}

/**
 * Error thrown when the scanned QR code is invalid or malformed.
 */
export class InvalidQrCodeError extends QrScanError {
    constructor(message: string = 'El código QR escaneado es inválido o está corrupto') {
        super(message);
        this.name = 'InvalidQrCodeError';
        Object.setPrototypeOf(this, InvalidQrCodeError.prototype);
    }
}

/**
 * Error thrown when the check-in period has expired (past grace period).
 */
export class QrExpiredError extends QrScanError {
    constructor(message: string = 'El período de check-in ha expirado. Ya no puedes registrar tu asistencia.') {
        super(message);
        this.name = 'QrExpiredError';
        Object.setPrototypeOf(this, QrExpiredError.prototype);
    }
}

/**
 * Error thrown when camera permission is denied by the user.
 */
export class CameraPermissionDeniedError extends QrScanError {
    constructor(message: string = 'Se requiere permiso de cámara para escanear el código QR') {
        super(message);
        this.name = 'CameraPermissionDeniedError';
        Object.setPrototypeOf(this, CameraPermissionDeniedError.prototype);
    }
}

/**
 * Error thrown when the QR code doesn't match the reservation's space.
 */
export class QrSpaceMismatchError extends QrScanError {
    constructor(message: string = 'El código QR no corresponde a esta reserva') {
        super(message);
        this.name = 'QrSpaceMismatchError';
        Object.setPrototypeOf(this, QrSpaceMismatchError.prototype);
    }
}

/**
 * Error thrown when the reservation is not in a valid state for check-in.
 */
export class InvalidReservationStateError extends QrScanError {
    constructor(message: string = 'La reserva no está en un estado válido para check-in') {
        super(message);
        this.name = 'InvalidReservationStateError';
        Object.setPrototypeOf(this, InvalidReservationStateError.prototype);
    }
}
