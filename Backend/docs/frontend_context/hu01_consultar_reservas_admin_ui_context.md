# Contexto visual y de implementación UI — HU-01 Consultar reservas admin

## Objetivo
Este documento complementa la HU funcional con lineamientos visuales, de layout y de consistencia para la implementación frontend de la vista de **consulta administrativa de reservas**.

## Referencias visuales
- Mockup visual: ../mockups/hu01_consultar_reservas_admin.png
- Mockup técnico (HTML): ../mockups/hu01_consultar_reservas_admin.html


## Fuente funcional principal
La fuente funcional oficial es:

`docs/HU_descompuestas_modulo_administrador/refactor/refactor_HU-01_Consultar_reservas_desde_modulo_administrador.md`

La HU define como mínimo:
- listado paginado,
- filtros por fecha de ejecución, estado, sede y usuario,
- orden descendente por fecha de ejecución,
- detalle de reserva,
- 20 resultados por página,
- campos mínimos del listado y del detalle,
- mensaje exacto sin resultados: `No se encontraron reservas con los filtros aplicados`.

## Mapeo sugerido a componentes frontend

La implementación puede estructurarse en componentes como:

- `AdminReservationsPage`
- `ReservationsFilters`
- `ReservationsTable`
- `ReservationRow`
- `ReservationStatusBadge`
- `ReservationsPagination`
- `ReservationDetailDrawer` o `Modal`

Hooks sugeridos:
- `useAdminReservations`
- `useReservationFilters`

Servicios UI:
- `reservationsService` (consulta admin)

Este mapeo es sugerido y debe adaptarse a la arquitectura existente del frontend.


## Fuente visual principal
La referencia visual principal es el mockup/HTML de la pantalla **Gestión de Reservas**.

## Intención visual de la pantalla
La nueva feature debe sentirse como parte natural del sistema actual, no como una vista nueva con otro lenguaje visual.

La interfaz esperada comunica:
- módulo administrativo,
- vista oscura premium,
- navegación lateral estable,
- foco en gestión y consulta,
- tabla protagonista,
- filtros visibles antes del listado,
- acciones principales arriba y acciones por fila a la derecha.


## Reglas de interacción clave

La UI debe cumplir comportamientos como:

- Al hacer clic en "Aplicar filtros", se actualiza el listado.
- Al hacer clic en "Limpiar", se resetean todos los filtros.
- Los estados deben visualizarse con badges consistentes.
- Las acciones por fila deben ser accesibles (ej: ver detalle).
- El botón "Cancelar seleccionadas" debe habilitarse solo si hay selección.
- La paginación debe actualizar el listado sin recargar la página.

## Diferencias relevantes entre mockup y HU

- El mockup muestra un solo campo de fecha, pero la HU exige rango (`desde` / `hasta`). La implementación debe seguir la HU.
- El mockup no muestra todos los campos funcionales requeridos por la HU; estos deben incluirse aunque no estén visibles en el diseño original.


## Estructura visual esperada

### 1. Top navigation
Debe conservar:
- barra superior fija,
- branding `sofka_`,
- navegación superior con la sección activa resaltada,
- íconos de notificaciones y configuración,
- avatar de usuario en esquina superior derecha.

### 2. Sidebar administrativa
Debe conservar:
- panel lateral izquierdo,
- título tipo `Admin Panel`,
- opción `Reservas` como ítem activo,
- accesos secundarios como Dashboard, Usuarios, Sedes y Reportes,
- CTA lateral `Nueva reserva`,
- accesos inferiores como Ayuda y Cerrar Sesión.

### 3. Header principal de contenido
Debe conservar:
- título principal `Gestión de Reservas`,
- subtítulo descriptivo,
- acciones primarias en el extremo derecho.

Acciones visibles esperadas:
- botón secundario/disabled para `Cancelar seleccionadas`,
- botón primario destacado para `Nueva reserva`.

### 4. Barra de filtros
Debe existir una franja o card superior antes de la tabla con:
- filtro de fecha,
- filtro de estado,
- filtro de sede,
- filtro de usuario,
- botón `Limpiar`,
- botón `Aplicar filtros`.

La disposición debe ser horizontal cuando haya espacio y adaptable en responsive.

### 5. Tabla/listado principal
La tabla es el elemento central de la pantalla.

Debe incluir visualmente columnas coherentes con la HU, como:
- identificador de reserva,
- usuario,
- sede / locación o espacio,
- fecha,
- horario,
- estado,
- actualización,
- acciones.

Debe permitir:
- selección por checkbox,
- acciones por fila,
- lectura rápida de estado mediante badge o pill visual,
- jerarquía clara entre encabezado, filas y acciones.

### 6. Paginación
Debe existir una zona inferior de paginación que muestre:
- rango visible de resultados,
- total de resultados,
- navegación entre páginas,
- estado actual de página.

### 7. Estados visuales complementarios
Debe contemplarse diseño consistente para:
- loading,
- empty state,
- error state,
- toast o feedback no bloqueante,
- detalle de reserva,
- acciones deshabilitadas según estado.

---

## Lenguaje visual observado en el mockup

### Tema general
- tema oscuro predominante,
- superficies en capas oscuras,
- texto claro con contraste alto,
- acento principal naranja/ámbar,
- badges de estado con colores semánticos.

### Tipografía
- apariencia de headings con mayor peso visual,
- body más neutro y legible,
- labels en mayúsculas pequeñas y tracking amplio.

### Superficies y profundidad
- contenedores oscuros con variaciones de elevación,
- bordes sutiles,
- sombras suaves,
- cards redondeadas.

### Bordes y radios
- radios suaves en inputs, cards, tabla y botones,
- CTA principal con radio tipo pill/cápsula.

### Acciones
- CTA principal con color naranja sólido,
- acción secundaria más apagada,
- acciones por fila con íconos compactos,
- disabled states visibles.

### Estados de reserva
Se sugiere conservar chips/badges de estado:
- `Confirmada` en verde,
- `Pendiente` en ámbar/naranja,
- `Cancelada` en rojo.

---

## Tokens o guías visuales derivadas del mockup
Tomar como referencia visual aproximada:

- fondo principal oscuro,
- contenedores `surface`, `surface-container-low`, `surface-container-high`,
- color de acción principal cercano a naranja intenso,
- texto principal claro,
- texto secundario tenue,
- bordes sutiles con bajo contraste,
- tipografía headline diferenciada del body.

Si el proyecto ya tiene tokens, theme o variables globales, **deben prevalecer sobre valores hardcodeados**.

---

## Comportamiento visual esperado por la HU

### Listado
La HU exige listado paginado y orden por fecha de ejecución descendente. La interfaz debe comunicar claramente:
- tabla ordenada,
- resultados visibles por página,
- control de avance/retroceso,
- total de resultados.

### Filtros
La HU exige filtros por:
- fecha de ejecución,
- estado,
- sede,
- usuario.

La UI debe hacer evidente:
- qué filtros están activos,
- qué filtros pueden limpiarse,
- cómo se aplica la búsqueda.

### Sin resultados
Cuando no existan coincidencias, la pantalla debe mostrar el mensaje exacto:
`No se encontraron reservas con los filtros aplicados`

Ese estado debe verse como una variante limpia de la tabla/listado, no como error técnico.

### Detalle
La HU exige vista de detalle con campos mínimos. Aunque el mockup principal enfatiza el listado, la implementación debe prever una experiencia coherente para abrir detalle desde la acción de fila.

---

## Componentes o patrones a reutilizar
Si existen en el frontend actual, priorizar reutilización de:
- layout administrativo,
- topbar,
- sidebar,
- tabla reutilizable,
- badge de estado,
- input, select y date input,
- botón primario/secundario,
- toast,
- modal o drawer de detalle,
- paginador.

No reinventar componentes si ya existe una base compatible.

---

## Reglas de consistencia
La implementación frontend debe respetar estas reglas:

- no inventar un lenguaje visual nuevo,
- no modernizar el producto por cuenta propia,
- no cambiar estilos globales para acomodar esta feature,
- reutilizar componentes existentes siempre que sea posible,
- priorizar consistencia con el sistema actual cuando el mockup y el código real difieran,
- mantener separación entre verdad funcional y verdad visual.

---

## Decisiones de interpretación permitidas
Si el mockup no cubre algo explícitamente, se permite decidir de forma conservadora en favor de:
1. la HU funcional,
2. consistencia con el frontend actual,
3. reutilización de componentes existentes,
4. claridad de uso para el administrador.

---

## Responsive y accesibilidad
Aunque el mockup está orientado a desktop admin, la implementación debe contemplar:
- adaptación razonable de filtros,
- scroll horizontal controlado en tabla si es necesario,
- labels visibles o accesibles,
- botones e íconos con affordance clara,
- estados disabled distinguibles,
- textos funcionales detectables por pruebas.

---

## Qué no define este documento
Este documento no reemplaza:
- la HU funcional,
- el contrato backend,
- los criterios de aceptación,
- la definición final de componentes reutilizables del proyecto.

Solo guía:
- estilo,
- layout,
- consistencia visual,
- intención de UX,
- referencias de implementación frontend.

---

## Resumen operativo para agentes frontend
Cuando un agente frontend use este documento debe asumir:
- la HU es la fuente funcional principal,
- este documento es la fuente visual y de consistencia,
- el mockup define la intención de diseño,
- el frontend actual define qué tanto se reutiliza y cómo mantener coherencia.