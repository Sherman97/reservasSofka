# Repaso: Preguntas y Respuestas para Defensa de Pipeline y Pruebas

## 1) Defensa teorica y TEST_PLAN.md

1. **Pregunta:** ¿Como estructuraron su `TEST_PLAN.md`?  
   **Respuesta:** Lo estructuramos por objetivo, alcance, estrategia por niveles (componente, integracion, caja negra), criterios de entrada/salida, riesgos, cobertura esperada y evidencias del pipeline. Asi conectamos decisiones tecnicas con calidad.

2. **Pregunta:** ¿Como es el diseño actual del pipeline?  
   **Respuesta:** Esta dividido en jobs independientes: `component-tests`, `integration-tests`, `frontend`, `vulnerability-scan` y `blackbox-tests`. Esto separa responsabilidades, mejora trazabilidad y acelera diagnostico.

3. **Pregunta:** ¿Como justifican sus decisiones bajo el Principio 6 (Contexto)?  
   **Respuesta:** Aplicamos que las pruebas dependen del contexto. Al ser microservicios Spring, priorizamos riesgos reales: logica por capa, integracion entre servicios, contratos API y seguridad de imagenes.

4. **Pregunta:** ¿Por que no usar una sola etapa global de pruebas?  
   **Respuesta:** Mezclar todo en un paso dificulta identificar la causa raiz. Con jobs separados sabemos si falla componente, integracion, frontend, seguridad o caja negra.

5. **Pregunta:** ¿Que evidencia muestran en la presentacion?  
   **Respuesta:** El `TEST_PLAN.md`, el `ci.yml` y una ejecucion exitosa reciente donde se ven los jobs y sus dependencias.

## 2) Prueba del pipeline y niveles

6. **Pregunta:** ¿Donde corre la prueba de caja negra en su YAML?  
   **Respuesta:** En el job `blackbox-tests`, que levanta servicios con Docker Compose y ejecuta Newman sobre la coleccion Postman.

7. **Pregunta:** ¿Por que la consideran caja negra?  
   **Respuesta:** Porque valida comportamiento externo por HTTP (requests/responses, codigos y contratos) sin depender de detalles internos de implementacion.

8. **Pregunta:** ¿Diferencia entre `integration-tests` y `blackbox-tests`?  
   **Respuesta:** `integration-tests` valida integracion interna del servicio (Spring context, DB, wiring). `blackbox-tests` valida el sistema desplegado desde fuera, como cliente.

9. **Pregunta:** ¿Que bloquea el avance a caja negra?  
   **Respuesta:** `blackbox-tests` depende de `component-tests`, `integration-tests`, `frontend` y `vulnerability-scan`. Si algo falla antes, no se ejecuta E2E.

10. **Pregunta:** ¿Como aseguran reproducibilidad del pipeline?  
    **Respuesta:** Workflow versionado, runtimes definidos (Java/Node), y flujo repetible con compose + coleccion de pruebas versionada.

## 3) Human Check (comprension, calidad, HITL)

11. **Pregunta:** ¿Como distinguen una prueba de integracion de una unitaria?  
    **Respuesta:** Unitaria prueba una pieza aislada con mocks. Integracion valida colaboracion real entre componentes e infraestructura.

12. **Pregunta:** Si una prueba usa solo mocks de repositorio, ¿es integracion?  
    **Respuesta:** No. Eso es unitaria o componente. Integracion requiere interaccion real con wiring/contexto o infraestructura.

13. **Pregunta:** ¿Como detectan vulnerabilidades en imagenes Docker?  
    **Respuesta:** En `vulnerability-scan` usamos Trivy para severidades `HIGH,CRITICAL`, generamos SARIF y lo subimos a GitHub Security, y aplicamos policy gate para fallar pipeline ante hallazgos graves.

14. **Pregunta:** ¿Por que separaron "generar SARIF" de "enforce policy"?  
    **Respuesta:** Para asegurar evidencia incluso cuando hay vulnerabilidades. Primero generamos/subimos reporte, luego aplicamos bloqueo por severidad.

15. **Pregunta:** ¿Como demuestran HITL real?  
    **Respuesta:** Explicamos linea por linea triggers, permisos, matrices, `needs`, escaneo, upload SARIF y condiciones de fallo. Nada se acepta sin validacion tecnica humana.

16. **Pregunta:** Explique una linea concreta del pipeline y su intencion.  
    **Respuesta:** `needs: [component-tests, integration-tests, frontend, vulnerability-scan]` en `blackbox-tests` obliga calidad funcional y de seguridad antes de E2E.

17. **Pregunta:** ¿Que decision humana tomaron sobre seguridad?  
    **Respuesta:** Definir umbral bloqueante en `HIGH,CRITICAL` en vez de reportar de forma pasiva.

18. **Pregunta:** ¿Que limitacion reconocen hoy?  
    **Respuesta:** Branch Protection no se configura desde codigo del repo; se configura en GitHub Settings/Rulesets. Por eso documentamos checks obligatorios y su aplicacion.

## Cierre corto sugerido para exponer

Nuestro pipeline esta diseñado por niveles y por riesgo. Validamos calidad funcional (componente e integracion), comportamiento externo (caja negra) y seguridad (escaneo de vulnerabilidades con bloqueo). Bajo Principio 6, elegimos esta estrategia porque responde al contexto real de un sistema Spring de microservicios y no a una receta generica.
