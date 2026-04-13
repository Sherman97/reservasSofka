# Arquitectura - Verificación de Reserva por QR

## 🎨 Patrones de Diseño Recomendados

### 1. State Pattern (Patrón de Estado)

**¿Por qué?**

Una reserva tiene un ciclo de vida muy claro: PENDING (Pendiente) ➔ CHECKED_IN (Confirmada) o NO_SHOW (Inasistencia) o CANCELLED (Cancelada).

**Aplicación:**

En lugar de tener un montón de if/else o switch en tu servicio para validar si se puede hacer check-in, creas clases para cada estado. Así, si alguien intenta hacer check-in en una reserva que ya está en NO_SHOW, el propio estado rechaza la acción.

### 2. Strategy Pattern (Patrón Estrategia)

**¿Por qué?**

Hoy validan la asistencia mediante código QR, pero mañana el negocio podría pedir validación por NFC, biometría o un PIN manual.

**Aplicación:**

Creas una interfaz `ICheckInStrategy`. La lógica de negocio principal no necesita saber cómo se hace el check-in, solo llama al método `validate()`. El QR será solo una de las estrategias implementadas.

### 3. Command Pattern (Patrón Comando) o Event-Driven

**¿Por qué?**

Para la funcionalidad del Cronjob (ReservationMonitorJob) que libera espacios.

**Aplicación:**

Cuando el tiempo de gracia expira, el job no debería mezclar la lógica de base de datos con la lógica de negocio. Simplemente emite un comando `ReleaseSpaceCommand` o un evento `ReservationExpiredEvent`. Otros manejadores se encargan de actualizar la BD y notificar a los usuarios.

### 4. Adapter o Facade (Adaptador o Fachada)

**¿Por qué?**

Para la generación de QR en el booking-service.

**Aplicación:**

Si usan una librería externa para generar/leer el código QR, envuélvanla en un Adaptador. Si la librería se desactualiza o cambian de proveedor, solo modifican el adaptador y no toda la lógica del negocio.

---

## 🏗️ Principios SOLID a Aplicar

### 1. S - Single Responsibility Principle (Principio de Responsabilidad Única)

**Aplicación crítica:**

¡No creen un `ReservationController` o `ReservationService` gigante ("Clase Dios")!

Separen las responsabilidades:

- **QRGeneratorService:** Solo genera y encripta el QR.
- **CheckInUseCase:** Solo orquesta la lógica de confirmación.
- **SpaceReleaserJob:** Solo identifica qué reservas caducaron.

### 2. O - Open/Closed Principle (Abierto a extensión, cerrado a modificación)

**Aplicación crítica:**

Si el día de mañana deciden que el "tiempo de gracia" ya no es de 15 minutos, sino que depende del tipo de sala (ej. Auditorio = 30 min, Hot Desk = 10 min), no deberían modificar el código base de la validación. Deberían poder extender la configuración (por ejemplo, pasándola como parámetro desde la base de datos o usando el patrón Strategy mencionado arriba).

### 3. L - Liskov Substitution Principle (Principio de Sustitución de Liskov)

**Aplicación:**

Si tienen diferentes tipos de espacios (Ej: `MeetingRoom` y `HotDesk` que heredan de una clase `Space`), la lógica de liberar el espacio (`releaseSpace()`) debe funcionar igual para ambos sin romper el programa ni requerir comprobaciones de tipo (if (space is MeetingRoom)).

### 4. I - Interface Segregation Principle (Segregación de Interfaces)

**Aplicación:**

No creen una interfaz gigante `IReservation` que obligue a implementar métodos que no se usan. Por ejemplo, el Job de inasistencia solo necesita leer tiempos y actualizar estados; no necesita conocer el método `generateQR()`. Creen interfaces pequeñas y específicas como `IStatusUpdater` y `IQRValidator`.

### 5. D - Dependency Inversion Principle (Inversión de Dependencias)

**Aplicación crítica:**

Su lógica principal de Check-in no debe depender directamente de la base de datos (PostgreSQL, MongoDB) ni del framework web (Spring, Express, NestJS). Debe depender de abstracciones (Interfaces).

**Ejemplo:**

Inyecten un `IReservationRepository` en su servicio. Así, para lograr ese 90% de cobertura en pruebas unitarias, podrán crear Mocks de la base de datos muy fácilmente sin levantar un entorno real.