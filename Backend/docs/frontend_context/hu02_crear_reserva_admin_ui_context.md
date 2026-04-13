# Contexto visual y de implementación UI — HU-02 Crear reserva manual admin

## Objetivo
Este documento complementa la HU funcional con lineamientos visuales, de layout y de consistencia para la implementación frontend de la vista/modal de **creación manual de reserva desde el módulo administrador**.

## Referencias visuales
- Mockup visual: ../mockups/hu02_crear_reservas_admin.png
- Mockup técnico (HTML): ../mockups/hu02_crear_reservas_admin.html

## Fuente funcional principal
La fuente funcional oficial es:

`docs/HU_descompuestas_modulo_administrador/refactor/refactor_HU-02_Crear_reserva_manual_desde_modulo_administrador.md`

La HU define como mínimo:
- creación manual indicando usuario, locación/espacio, fecha, hora de inicio y hora de fin,
- selección de usuario con búsqueda/autocompletado,
- validación de campos obligatorios,
- validación de disponibilidad antes del registro,
- bloqueo por conflicto de solapamiento,
- estado inicial `Confirmada`,
- mensaje exacto de conflicto: `El espacio seleccionado ya se encuentra reservado en este horario`,
- mensaje exacto de éxito: `Reserva creada exitosamente`. :contentReference[oaicite:2]{index=2}

## Mapeo sugerido a componentes frontend
La implementación puede estructurarse en componentes como:

- `AdminCreateReservationModal` o `AdminCreateReservationDialog`
- `ReservationLocationSelect`
- `ReservationSpaceSelect`
- `ReservationDateField`
- `ReservationTimeRangeFields`
- `ReservationRequesterAutocomplete`
- `ReservationConflictAlert`
- `ReservationFormActions`

Hooks sugeridos:
- `useAdminCreateReservationForm`
- `useReservationAvailability`
- `useUserAutocomplete`

Servicios UI:
- `adminReservationsService`
- `usersAutocompleteService` si aplica

Este mapeo es sugerido y debe adaptarse a la arquitectura existente del frontend.

## Fuente visual principal
La referencia visual principal es el mockup/HTML de la experiencia **Nueva Reserva**.

## Intención visual de la pantalla
La nueva feature debe sentirse como parte natural del sistema actual, no como un flujo nuevo con otro lenguaje visual.

La interfaz esperada comunica:
- contexto administrativo,
- creación manual controlada,
- foco en completar datos obligatorios,
- detección temprana de conflictos,
- acción principal clara,
- jerarquía visual centrada en el formulario/modal.

## Reglas de interacción clave
La UI debe cumplir comportamientos como:

- Al abrir la acción `Nueva reserva`, se muestra el modal o contenedor de creación.
- El administrador puede seleccionar sede/locación y espacio.
- El administrador puede elegir fecha, hora de inicio y hora de fin.
- El usuario solicitante se selecciona mediante búsqueda/autocompletado.
- Si faltan datos obligatorios, se muestran errores en línea.
- Si existe conflicto de horario, se muestra el mensaje exacto de conflicto.
- Si la creación es exitosa, se muestra el toast `Reserva creada exitosamente`.
- El botón `Crear Reserva` debe responder al estado del formulario y del conflicto.
- La acción `Cancelar` debe cerrar el flujo sin persistir cambios.

## Diferencias relevantes entre mockup y HU
- El mockup muestra una alerta contextual de conflicto con texto descriptivo ampliado, pero la HU exige específicamente el mensaje funcional: `El espacio seleccionado ya se encuentra reservado en este horario`. La implementación debe garantizar ese mensaje exacto en la experiencia.
- El mockup muestra un flujo visual centrado en modal; si el frontend existente usa drawer o página embebida, puede adaptarse siempre que conserve la intención visual y funcional.
- La HU exige autocompletado de usuario por nombre, apellido o correo; la implementación debe priorizar esa interacción aunque el mockup solo sugiera un input con hint visual. :contentReference[oaicite:4]{index=4}

## Estructura visual esperada

### 1. Contexto general
Debe conservar:
- el lenguaje visual oscuro del sistema,
- sidebar/admin layout coherente,
- topbar consistente con el resto del módulo,
- foco principal en el formulario/modal de creación.

### 2. Contenedor principal
La experiencia puede presentarse como modal, dialog o contenedor superpuesto.
Debe incluir:
- título principal `Nueva Reserva`,
- subtítulo explicativo,
- botón de cierre visible,
- separación clara entre contenido y acciones.

### 3. Formulario
Debe incluir visualmente:
- sede / locación,
- espacio / sala,
- fecha,
- hora de inicio,
- hora de fin,
- usuario solicitante.

Debe comunicar con claridad:
- qué campos son obligatorios,
- qué campo está en error,
- cuándo existe conflicto,
- cuándo la acción principal está disponible.

### 4. Búsqueda/autocompletado de usuario
Debe existir un patrón visible de búsqueda/autocompletado.
La experiencia debe sugerir que el usuario puede encontrarse por:
- nombre,
- apellido,
- correo.

### 5. Alerta de conflicto
Debe existir una zona visible de feedback de conflicto cuando el espacio ya esté reservado en ese horario.
Debe verse como alerta contextual, no como error técnico genérico.

### 6. Acciones
Debe conservar:
- acción secundaria `Cancelar`,
- acción principal `Crear Reserva`.

La acción principal debe tener mayor peso visual.

## Lenguaje visual observado en el mockup

### Tema general
- tema oscuro predominante,
- fondo atenuado detrás del modal,
- superficie principal elevada,
- acento naranja/ámbar,
- contraste alto en título y CTA principal,
- alerta de conflicto con semántica roja.

### Tipografía
- títulos con peso fuerte,
- subtítulo explicativo más ligero,
- labels pequeños, en mayúsculas y con tracking amplio.

### Superficies y profundidad
- modal elevado sobre overlay oscuro,
- campos con fondo oscuro interno,
- bordes suaves,
- jerarquía clara entre overlay, modal y campos.

### Bordes y radios
- radios suaves en inputs y selects,
- botón principal con estilo pill/cápsula,
- contenedor de alerta con bordes suaves.

### Acciones
- CTA principal naranja sólido con destaque visual,
- acción secundaria más neutra,
- botón de cierre discreto pero visible.

### Estado de conflicto
Se sugiere conservar:
- contenedor rojo/oscuro,
- icono de advertencia,
- texto claro y legible,
- tono de alerta no bloqueante pero muy visible.

## Tokens o guías visuales derivadas del mockup
Tomar como referencia visual aproximada:
- fondo oscuro principal,
- superficies oscuras escalonadas,
- color de acción principal naranja intenso,
- texto principal claro,
- texto secundario tenue,
- alerta de conflicto en gama roja oscura,
- tipografía headline diferenciada del body.

Si el proyecto ya tiene tokens, theme o variables globales, **deben prevalecer sobre valores hardcodeados**.

## Comportamiento visual esperado por la HU

### Campos obligatorios
La HU exige como mínimos:
- usuario,
- locación/espacio,
- fecha,
- hora de inicio,
- hora de fin.

La UI debe hacer evidente:
- qué campos faltan,
- qué campos están inválidos,
- errores en línea debajo del campo cuando corresponda. :contentReference[oaicite:5]{index=5}

### Conflicto de horario
Cuando exista solapamiento, la experiencia debe:
- bloquear la creación,
- mostrar feedback visible,
- exponer el mensaje exacto:
  `El espacio seleccionado ya se encuentra reservado en este horario`. :contentReference[oaicite:6]{index=6}

### Éxito
Cuando la creación sea exitosa, la experiencia debe mostrar:
`Reserva creada exitosamente`

Ese mensaje debe visualizarse como toast o notificación no bloqueante. :contentReference[oaicite:7]{index=7}

### Estado inicial
Aunque el estado `Confirmada` sea una regla principalmente backend/negocio, el frontend debe reflejarla de forma coherente en los mensajes o flujos posteriores si aplica. :contentReference[oaicite:8]{index=8}

## Componentes o patrones a reutilizar
Si existen en el frontend actual, priorizar reutilización de:
- modal/dialog base,
- select reutilizable,
- input/date/time fields,
- autocomplete,
- alert/feedback component,
- toast,
- botón primario/secundario,
- overlay y layout administrativo.

No reinventar componentes si ya existe una base compatible.

## Reglas de consistencia
La implementación frontend debe respetar estas reglas:
- no inventar un lenguaje visual nuevo,
- no modernizar el producto por cuenta propia,
- no cambiar estilos globales para acomodar esta feature,
- reutilizar componentes existentes siempre que sea posible,
- priorizar consistencia con el sistema actual cuando el mockup y el código real difieran,
- mantener separación entre verdad funcional y verdad visual.

## Decisiones de interpretación permitidas
Si el mockup no cubre algo explícitamente, se permite decidir de forma conservadora en favor de:
1.