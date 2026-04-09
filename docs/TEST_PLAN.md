# TEST PLAN Modulo Administrador de Reservas (HU-01 y HU-02)

> Version: 1.0  
> Fecha: 7 de abril de 2026  
> Proyecto: Reservas SK  
> Estado del plan: Planificacion previa a ejecucion  
> Referencias base:
> - `docs/HU_descompuestas_modulo_administrador/refactor/refactor_HU-01_Consultar_reservas_desde_modulo_administrador.md`
> - `docs/HU_descompuestas_modulo_administrador/refactor/refactor_HU-02_Crear_reserva_manual_desde_modulo_administrador.md`

---

## 0. Resumen y contextualizacion de la nueva feature

En esta nueva funcionalidad se habilita un **modulo de administrador** para gestionar reservas de forma centralizada.  
La idea principal es que el administrador pueda:
- Ver todas las reservas de manera ordenada.
- Encontrar rapido una reserva usando filtros (fechas, estado, sede y usuario).
- Entrar al detalle para revisar la informacion completa.
- Crear una reserva manual para un usuario cuando sea necesario.

Este plan de pruebas se construye **antes de ejecutar** las pruebas, para definir con claridad:
- Que se va a validar.
- Como se va a validar.
- En que nivel de pruebas se va a validar.

Con esto se busca reducir errores en produccion, tener resultados consistentes y asegurar que las HUs HU-01 y HU-02 cumplan su objetivo funcional.

---

## 1. Identificacion y objetivo

| Campo | Valor |
|---|---|
| ID del plan | TP-ADMIN-RESERVAS-001 |
| Historias cubiertas | HU-01 (Consultar reservas), HU-02 (Crear reserva manual) |
| Alcance temporal | Antes de ejecucion de pruebas |
| Objetivo principal | Definir estrategia de pruebas y casos de prueba para validar criterios funcionales y tecnicos del modulo administrador |

Objetivo de calidad:
- Garantizar comportamiento correcto de consulta, filtrado, detalle y creacion manual de reservas.
- Reducir riesgo de regresiones mediante estrategia multinivel y automatizacion.
- Asegurar trazabilidad entre HUs, criterios BDD, casos de prueba y pipeline.

---

## 2. Alcance y no alcance

### 2.1 En alcance
- HU-01:
  - Listado paginado de reservas.
  - Filtros por fecha de ejecucion, estado, sede y usuario.
  - Orden por defecto descendente.
  - Consulta de detalle de reserva.
  - Mensaje sin resultados.
- HU-02:
  - Creacion manual desde modulo admin.
  - Seleccion de usuario por busqueda/autocompletado.
  - Validacion de disponibilidad sin solapamiento.
  - Validacion de campos obligatorios.
  - Estado inicial `Confirmada`.
  - Notificacion de exito y error funcional.

### 2.2 Fuera de alcance
- Reprogramacion.
- Cancelacion individual o masiva.
- Bloqueos de locaciones/insumos.
- Administracion de sedes e inventario fuera de los filtros y seleccion necesarios para HU-01/HU-02.

---

## 3. Aplicacion teorica de los 7 principios de pruebas

1. Las pruebas muestran presencia de defectos, no su ausencia:
Se planifican pruebas negativas (conflicto horario, filtros sin resultados, datos incompletos) para evidenciar fallos tempranos.

2. Pruebas exhaustivas son imposibles:
Se priorizan particiones funcionales criticas (estado, rango de fechas, combinacion de filtros, solapamientos).

3. Prueba temprana:
La estrategia parte por pruebas unitarias/componente antes de integracion y E2E.

4. Agrupacion de defectos:
Se concentra cobertura en zonas de mayor riesgo:
- SQL de filtros y orden.
- Validaciones de solapamiento.
- Mapeo backend->frontend en grilla/detalle.

5. Paradoja del pesticida:
Se propone rotacion de datos y combinaciones de filtros para evitar repetir solo caminos felices.

6. Pruebas dependen del contexto:
El plan se adapta al contexto de microservicios (backend + frontend + gateway + DB + Rabbit), con separacion clara entre componente e integracion.

7. Falacia de ausencia de errores:
No basta que no falle; debe cumplir valor de negocio de HU-01/HU-02 (filtros utiles, trazabilidad, creacion administrable).

---

## 4. Estrategia multinivel

## 4.1 Niveles y objetivo

| Nivel | Enfoque | Objetivo |
|---|---|---|
| Unitario | Caja blanca | Validar reglas de negocio y transformaciones aisladas |
| Componente | Caja blanca funcional | Validar contratos del modulo (controlador/hook/pagina) con dependencias mockeadas |
| Integracion | Caja blanca + caja negra tecnica | Validar comunicacion real entre puertos/adapters/BD/servicios |
| E2E/API | Caja negra | Validar comportamiento observable por administrador |

## 4.2 Prioridad por riesgo

| Riesgo | Impacto | Nivel minimo obligatorio |
|---|---|---|
| Filtros no aplican correctamente | Alto | Componente + Integracion |
| Orden incorrecto del listado | Alto | Integracion |
| Solapamiento no detectado | Alto | Unitario + Componente + Integracion |
| Mensajes de error/exito inconsistentes | Medio | Componente + E2E |
| Inconsistencia listado vs detalle | Alto | Componente + Integracion |

---

## 5. Tipos de pruebas (planificadas)

## 5.1 Caja blanca
- Unitarias:
  - Normalizacion y validacion de filtros.
  - Validacion de formulario de creacion (campos obligatorios, intervalos, rangos).
  - Construccion de payload de disponibilidad/creacion.
- Componente:
  - Pagina admin con mocks de servicios.
  - Controller web con validaciones y errores de negocio.

## 5.2 Caja negra
- API:
  - Consultar listado admin con y sin filtros.
  - Crear reserva en conflicto y en exito.
- UI:
  - Flujo de aplicacion de filtros.
  - Flujo de creacion manual completo.
  - Confirmacion visual de mensajes y cierre de modal.

## 5.3 Regresion
- Re-ejecucion de suites de dashboard/modal/reservas admin relacionadas al impacto.

---

## 6. Distincion en pipeline: Componente vs Integracion

Propuesta de pipeline (antes de implementacion operativa):

1. Etapa `component-tests`:
- Frontend: tests de pagina/componentes/hook con mocks.
- Backend: `@WebMvcTest` y pruebas de servicios con puertos mock.
- Criterio: ejecucion rapida, sin infraestructura externa.

2. Etapa `integration-tests`:
- Backend: persistencia SQL + endpoint admin + seguridad/roles.
- Frontend: flujos con adaptadores reales y servicios fake integrados.
- Criterio: validacion de comunicacion de puertos y contratos.

3. Etapa `blackbox-smoke`:
- Llamadas API via gateway y pruebas funcionales basicas.

---

## 7. Trazabilidad HU -> escenarios -> casos de prueba

## 7.1 HU-01 Consultar reservas

### Escenarios BDD cubiertos (plan)
- HU01-BDD-01: consulta con filtros.
- HU01-BDD-02: consulta de detalle.
- HU01-BDD-03: consulta sin resultados.
- HU01-BDD-04: navegacion paginada.

### Casos de prueba planificados (muestra)

| TC-ID | HU | Nivel | Tipo | Descripcion esperada |
|---|---|---|---|---|
| TC-HU01-001 | HU-01 | Componente | Caja blanca | Carga inicial consulta con `page=1`, `pageSize=20`, orden descendente |
| TC-HU01-002 | HU-01 | Componente | Caja negra | Aplicar filtros combinados retorna solo coincidencias |
| TC-HU01-003 | HU-01 | Integracion | Caja blanca | Query SQL de admin aplica fecha ejecucion, estado, sede, usuario |
| TC-HU01-004 | HU-01 | Integracion | Caja blanca | Ordenamiento por defecto descendente estable |
| TC-HU01-005 | HU-01 | Componente | Caja negra | Sin resultados muestra mensaje y conserva filtros |
| TC-HU01-006 | HU-01 | Componente | Caja negra | Ver detalle muestra campos minimos y consistentes con listado |
| TC-HU01-007 | HU-01 | Integracion | Caja negra tecnica | Endpoint admin requiere rol ADMIN |

## 7.2 HU-02 Crear reserva manual

### Escenarios BDD cubiertos (plan)
- HU02-BDD-01: creacion exitosa.
- HU02-BDD-02: conflicto de horario.
- HU02-BDD-03: datos incompletos.

### Casos de prueba planificados (muestra)

| TC-ID | HU | Nivel | Tipo | Descripcion esperada |
|---|---|---|---|---|
| TC-HU02-001 | HU-02 | Componente | Caja negra | Formulario inicia con boton crear deshabilitado |
| TC-HU02-002 | HU-02 | Componente | Caja blanca | Errores en linea al faltar campos obligatorios |
| TC-HU02-003 | HU-02 | Unitario | Caja blanca | Validacion de intervalos de 15 minutos |
| TC-HU02-004 | HU-02 | Unitario | Caja blanca | `endTime > startTime` obligatorio |
| TC-HU02-005 | HU-02 | Integracion | Caja blanca | Disponibilidad detecta solapamiento y bloquea creacion |
| TC-HU02-006 | HU-02 | Integracion | Caja negra tecnica | Mensaje funcional de conflicto exacto |
| TC-HU02-007 | HU-02 | Integracion | Caja negra tecnica | Creacion exitosa deja estado inicial `Confirmada` |
| TC-HU02-008 | HU-02 | Componente | Caja negra | Toast de exito y error visible segun resultado |
| TC-HU02-009 | HU-02 | Componente | Caja negra | Tras exito: modal cierra y tabla recarga |

---

## 8. Criterios de entrada, salida y suspension

## 8.1 Entrada
- HUs refactor HU-01/HU-02 aprobadas.
- Datos base disponibles (usuarios no-admin, sedes, espacios, reservas).
- Entorno local o CI con DB y servicios levantados.

## 8.2 Salida
- 100% de escenarios BDD HU-01/HU-02 cubiertos por al menos un caso automatizado.
- Sin defectos criticos o altos abiertos en consulta/creacion admin.
- Evidencia de ejecucion por nivel (component/integration).

## 8.3 Suspension
- Si fallan dependencias base (DB/gateway/servicios) o no hay datos minimos de prueba.
- Si hay cambios de alcance funcional en HU-01/HU-02 sin actualizar el plan.

---

## 9. Datos de prueba (plan)

- Usuarios:
  - Al menos 1 admin (actor), 3 usuarios no-admin para filtro y creacion.
- Sedes:
  - Al menos 2 sedes.
- Espacios:
  - Al menos 2 por sede.
- Reservas:
  - Con estados `Pendiente`, `Confirmada`, `Cancelada`, `Finalizada`.
  - Casos con y sin conflicto de horario.
  - Volumen >20 para validar paginacion.

---

## 10. Entregables de prueba planificados

- `TEST_PLAN.md` (este documento).
- Matriz de trazabilidad HU -> BDD -> TC (incluida en seccion 7).
- Suite automatizada separada por niveles:
  - componente
  - integracion
  - blackbox-smoke
- Reportes de ejecucion en CI (junit/json/html) cuando se implemente pipeline final.

---

## 11. Riesgos y mitigacion

| Riesgo | Mitigacion planificada |
|---|---|
| Divergencia entre contrato backend y UI de filtros | Tests de integracion de contrato + mocks alineados |
| Regresion al ajustar SQL/order | Tests de persistencia con orden y filtros combinados |
| Mensajeria de error inconsistente en UI | Casos componente para mensajes exactos y toast por tipo |
| Dependencia de datos no controlados | Dataset minimo versionado para pruebas |

---

## 12. Resumen ejecutivo de implementacion del plan

Este plan define una estrategia multinivel previa a ejecucion para HU-01 y HU-02, justificando teoricamente los 7 principios de pruebas y aterrizando su aplicacion practica en:
- Separacion de pruebas de componente e integracion en pipeline.
- Cobertura de caja blanca y caja negra.
- Trazabilidad explicita de criterios BDD hacia casos de prueba.

No declara resultados ejecutados; establece la base tecnica y funcional para su implementacion y validacion formal.
