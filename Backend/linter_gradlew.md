# Informe consolidado - .\gradlew.bat check

Generado: 2026-03-04 16:32:35-05:00

## Resumen general

- Servicios analizados: 6
- Tests totales: 183
- Fallos totales: 0
- Errores totales: 0
- Omitidos totales: 0
- Hallazgos Checkstyle: 1
- Hallazgos PMD: 38
- Warnings SpotBugs: 51
- Cobertura global (lineas): 90,20%
- Cobertura global (ramas): 70,45%

## Tabla por servicio

| Servicio | Tests | Fallos | Errores | Omitidos | Cobertura lineas | Cobertura ramas | Checkstyle | PMD | SpotBugs |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| api-gateway | 9 | 0 | 0 | 0 | 87,76% | 50,00% | 0 | 0 | 0 |
| auth-service | 25 | 0 | 0 | 0 | 82,77% | 54,55% | 0 | 4 | 4 |
| bookings-service | 52 | 0 | 0 | 0 | 93,23% | 75,35% | 0 | 15 | 23 |
| inventory-service | 32 | 0 | 0 | 0 | 95,17% | 75,71% | 0 | 4 | 8 |
| locations-service | 37 | 0 | 0 | 0 | 93,75% | 64,29% | 0 | 6 | 12 |
| notifications-service | 28 | 0 | 0 | 0 | 75,61% | 69,83% | 1 | 9 | 4 |

## Reportes raiz

- Jacoco root HTML: build/reports/jacoco/jacocoRootReport/html/index.html
- Jacoco root XML: build/reports/jacoco/jacocoRootReport/jacocoRootReport.xml
- Gradle problems: build/reports/problems/problems-report.html

## Servicio: api-gateway

### Estado de tests
- Tests: 9
- Fallos: 0
- Errores: 0
- Omitidos: 0
- Tiempo total (s): 3.17

### Cobertura Jacoco
- Lineas: 87,76%
- Ramas: 50,00%
- Instrucciones: 82,26%

### Checkstyle (main + test)
- Total hallazgos: 0

### PMD (main + test)
- Total hallazgos: 0

### SpotBugs (main + test)
- Total warnings: 0
- Warnings main: 0
- Warnings test: 0
- Reporte main: services/api-gateway/build/reports/spotbugs/main.html
- Reporte test: services/api-gateway/build/reports/spotbugs/test.html

### Archivos de reporte
- Checkstyle main: services/api-gateway/build/reports/checkstyle/main.xml y main.html
- Checkstyle test: services/api-gateway/build/reports/checkstyle/test.xml y test.html
- PMD main: services/api-gateway/build/reports/pmd/main.xml y main.html
- PMD test: services/api-gateway/build/reports/pmd/test.xml y test.html
- Tests: services/api-gateway/build/reports/tests/test/index.html
- Jacoco: services/api-gateway/build/reports/jacoco/test/html/index.html y jacocoTestReport.xml

## Servicio: auth-service

### Estado de tests
- Tests: 25
- Fallos: 0
- Errores: 0
- Omitidos: 0
- Tiempo total (s): 6.21

### Cobertura Jacoco
- Lineas: 82,77%
- Ramas: 54,55%
- Instrucciones: 82,00%

### Checkstyle (main + test)
- Total hallazgos: 0

### PMD (main + test)
- Total hallazgos: 4
- Resumen por regla:
  - GuardLogStatement: 2
  - RedundantFieldInitializer: 1
  - MissingSerialVersionUID: 1

| Archivo | Regla | Prioridad | Linea | Mensaje |
|---|---|---:|---:|---|
| C:\Users\german.rojas\Desktop\Nueva carpeta\reservas-sk\Backend\services\auth-service\src\main\java\com\reservas\sk\auth_service\adapters\out\messaging\RabbitUserEventPublisherAdapter.java | GuardLogStatement | 2 | 34 | Logger calls should be surrounded by log level guards. |
| C:\Users\german.rojas\Desktop\Nueva carpeta\reservas-sk\Backend\services\auth-service\src\main\java\com\reservas\sk\auth_service\exception\ApiException.java | MissingSerialVersionUID | 3 | 6 | Classes implementing Serializable should set a serialVersionUID |
| C:\Users\german.rojas\Desktop\Nueva carpeta\reservas-sk\Backend\services\auth-service\src\main\java\com\reservas\sk\auth_service\exception\GlobalExceptionHandler.java | GuardLogStatement | 2 | 60 | Logger calls should be surrounded by log level guards. |
| C:\Users\german.rojas\Desktop\Nueva carpeta\reservas-sk\Backend\services\auth-service\src\main\java\com\reservas\sk\auth_service\infrastructure\config\RabbitProperties.java | RedundantFieldInitializer | 3 | 7 | Avoid using redundant field initializer for 'enabled' |

### SpotBugs (main + test)
- Total warnings: 4
- Warnings main: 3
- Warnings test: 1
- Reporte main: services/auth-service/build/reports/spotbugs/main.html
- Reporte test: services/auth-service/build/reports/spotbugs/test.html

### Archivos de reporte
- Checkstyle main: services/auth-service/build/reports/checkstyle/main.xml y main.html
- Checkstyle test: services/auth-service/build/reports/checkstyle/test.xml y test.html
- PMD main: services/auth-service/build/reports/pmd/main.xml y main.html
- PMD test: services/auth-service/build/reports/pmd/test.xml y test.html
- Tests: services/auth-service/build/reports/tests/test/index.html
- Jacoco: services/auth-service/build/reports/jacoco/test/html/index.html y jacocoTestReport.xml

## Servicio: bookings-service

### Estado de tests
- Tests: 52
- Fallos: 0
- Errores: 0
- Omitidos: 0
- Tiempo total (s): 6.6

### Cobertura Jacoco
- Lineas: 93,23%
- Ramas: 75,35%
- Instrucciones: 93,53%

### Checkstyle (main + test)
- Total hallazgos: 0

### PMD (main + test)
- Total hallazgos: 15
- Resumen por regla:
  - GuardLogStatement: 4
  - AvoidDuplicateLiterals: 4
  - LooseCoupling: 2
  - RedundantFieldInitializer: 1
  - MissingSerialVersionUID: 1
  - AvoidInstantiatingObjectsInLoops: 1
  - InsufficientStringBufferDeclaration: 1
  - AvoidLiteralsInIfCondition: 1

| Archivo | Regla | Prioridad | Linea | Mensaje |
|---|---|---:|---:|---|
| C:\Users\german.rojas\Desktop\Nueva carpeta\reservas-sk\Backend\services\bookings-service\src\main\java\com\reservas\sk\bookings_service\adapters\out\persistence\JdbcBookingPersistenceAdapter.java | InsufficientStringBufferDeclaration | 3 | 205 | StringBuilder has been initialized with size 172, but has at least 188 characters appended. |
| C:\Users\german.rojas\Desktop\Nueva carpeta\reservas-sk\Backend\services\bookings-service\src\main\java\com\reservas\sk\bookings_service\adapters\out\persistence\JdbcBookingPersistenceAdapter.java | AvoidInstantiatingObjectsInLoops | 3 | 276 | Avoid instantiating new objects inside loops |
| C:\Users\german.rojas\Desktop\Nueva carpeta\reservas-sk\Backend\services\bookings-service\src\main\java\com\reservas\sk\bookings_service\adapters\out\persistence\JdbcBookingPersistenceAdapter.java | AvoidDuplicateLiterals | 3 | 297 | The String literal "delivered_by" appears 4 times in this file; the first occurrence is on line 297 |
| C:\Users\german.rojas\Desktop\Nueva carpeta\reservas-sk\Backend\services\bookings-service\src\main\java\com\reservas\sk\bookings_service\adapters\out\persistence\JdbcBookingPersistenceAdapter.java | AvoidDuplicateLiterals | 3 | 299 | The String literal "returned_by" appears 4 times in this file; the first occurrence is on line 299 |
| C:\Users\german.rojas\Desktop\Nueva carpeta\reservas-sk\Backend\services\bookings-service\src\main\java\com\reservas\sk\bookings_service\application\service\BookingApplicationService.java | AvoidDuplicateLiterals | 3 | 35 | The String literal "confirmed" appears 4 times in this file; the first occurrence is on line 35 |
| C:\Users\german.rojas\Desktop\Nueva carpeta\reservas-sk\Backend\services\bookings-service\src\main\java\com\reservas\sk\bookings_service\application\service\BookingApplicationService.java | AvoidDuplicateLiterals | 3 | 35 | The String literal "in_progress" appears 4 times in this file; the first occurrence is on line 35 |
| C:\Users\german.rojas\Desktop\Nueva carpeta\reservas-sk\Backend\services\bookings-service\src\main\java\com\reservas\sk\bookings_service\application\service\BookingApplicationService.java | LooseCoupling | 3 | 95 | Avoid using implementation types like 'HashSet'; use the interface instead |
| C:\Users\german.rojas\Desktop\Nueva carpeta\reservas-sk\Backend\services\bookings-service\src\main\java\com\reservas\sk\bookings_service\application\service\BookingApplicationService.java | AvoidLiteralsInIfCondition | 3 | 184 | Avoid using literals in if statements |
| C:\Users\german.rojas\Desktop\Nueva carpeta\reservas-sk\Backend\services\bookings-service\src\main\java\com\reservas\sk\bookings_service\application\service\BookingApplicationService.java | GuardLogStatement | 2 | 279 | Logger calls should be surrounded by log level guards. |
| C:\Users\german.rojas\Desktop\Nueva carpeta\reservas-sk\Backend\services\bookings-service\src\main\java\com\reservas\sk\bookings_service\application\service\BookingApplicationService.java | GuardLogStatement | 2 | 287 | Logger calls should be surrounded by log level guards. |
| C:\Users\german.rojas\Desktop\Nueva carpeta\reservas-sk\Backend\services\bookings-service\src\main\java\com\reservas\sk\bookings_service\application\service\BookingApplicationService.java | GuardLogStatement | 2 | 295 | Logger calls should be surrounded by log level guards. |
| C:\Users\german.rojas\Desktop\Nueva carpeta\reservas-sk\Backend\services\bookings-service\src\main\java\com\reservas\sk\bookings_service\application\service\BookingApplicationService.java | GuardLogStatement | 2 | 303 | Logger calls should be surrounded by log level guards. |
| C:\Users\german.rojas\Desktop\Nueva carpeta\reservas-sk\Backend\services\bookings-service\src\main\java\com\reservas\sk\bookings_service\application\service\BookingApplicationService.java | LooseCoupling | 3 | 342 | Avoid using implementation types like 'LinkedHashSet'; use the interface instead |
| C:\Users\german.rojas\Desktop\Nueva carpeta\reservas-sk\Backend\services\bookings-service\src\main\java\com\reservas\sk\bookings_service\exception\ApiException.java | MissingSerialVersionUID | 3 | 6 | Classes implementing Serializable should set a serialVersionUID |
| C:\Users\german.rojas\Desktop\Nueva carpeta\reservas-sk\Backend\services\bookings-service\src\main\java\com\reservas\sk\bookings_service\infrastructure\config\RabbitProperties.java | RedundantFieldInitializer | 3 | 7 | Avoid using redundant field initializer for 'enabled' |

### SpotBugs (main + test)
- Total warnings: 23
- Warnings main: 22
- Warnings test: 1
- Reporte main: services/bookings-service/build/reports/spotbugs/main.html
- Reporte test: services/bookings-service/build/reports/spotbugs/test.html

### Archivos de reporte
- Checkstyle main: services/bookings-service/build/reports/checkstyle/main.xml y main.html
- Checkstyle test: services/bookings-service/build/reports/checkstyle/test.xml y test.html
- PMD main: services/bookings-service/build/reports/pmd/main.xml y main.html
- PMD test: services/bookings-service/build/reports/pmd/test.xml y test.html
- Tests: services/bookings-service/build/reports/tests/test/index.html
- Jacoco: services/bookings-service/build/reports/jacoco/test/html/index.html y jacocoTestReport.xml

## Servicio: inventory-service

### Estado de tests
- Tests: 32
- Fallos: 0
- Errores: 0
- Omitidos: 0
- Tiempo total (s): 8.54

### Cobertura Jacoco
- Lineas: 95,17%
- Ramas: 75,71%
- Instrucciones: 95,19%

### Checkstyle (main + test)
- Total hallazgos: 0

### PMD (main + test)
- Total hallazgos: 4
- Resumen por regla:
  - RedundantFieldInitializer: 1
  - CloseResource: 1
  - InsufficientStringBufferDeclaration: 1
  - MissingSerialVersionUID: 1

| Archivo | Regla | Prioridad | Linea | Mensaje |
|---|---|---:|---:|---|
| C:\Users\german.rojas\Desktop\Nueva carpeta\reservas-sk\Backend\services\inventory-service\src\main\java\com\reservas\sk\inventory_service\adapters\out\persistence\JdbcInventoryPersistenceAdapter.java | InsufficientStringBufferDeclaration | 3 | 73 | StringBuilder has been initialized with size 131, but has at least 147 characters appended. |
| C:\Users\german.rojas\Desktop\Nueva carpeta\reservas-sk\Backend\services\inventory-service\src\main\java\com\reservas\sk\inventory_service\exception\ApiException.java | MissingSerialVersionUID | 3 | 6 | Classes implementing Serializable should set a serialVersionUID |
| C:\Users\german.rojas\Desktop\Nueva carpeta\reservas-sk\Backend\services\inventory-service\src\main\java\com\reservas\sk\inventory_service\infrastructure\config\RabbitProperties.java | RedundantFieldInitializer | 3 | 7 | Avoid using redundant field initializer for 'enabled' |
| C:\Users\german.rojas\Desktop\Nueva carpeta\reservas-sk\Backend\services\inventory-service\src\test\java\com\reservas\sk\inventory_service\adapters\in\web\EquipmentsControllerTest.java | CloseResource | 3 | 40 | Ensure that resources like this LocalValidatorFactoryBean object are closed after use |

### SpotBugs (main + test)
- Total warnings: 8
- Warnings main: 7
- Warnings test: 1
- Reporte main: services/inventory-service/build/reports/spotbugs/main.html
- Reporte test: services/inventory-service/build/reports/spotbugs/test.html

### Archivos de reporte
- Checkstyle main: services/inventory-service/build/reports/checkstyle/main.xml y main.html
- Checkstyle test: services/inventory-service/build/reports/checkstyle/test.xml y test.html
- PMD main: services/inventory-service/build/reports/pmd/main.xml y main.html
- PMD test: services/inventory-service/build/reports/pmd/test.xml y test.html
- Tests: services/inventory-service/build/reports/tests/test/index.html
- Jacoco: services/inventory-service/build/reports/jacoco/test/html/index.html y jacocoTestReport.xml

## Servicio: locations-service

### Estado de tests
- Tests: 37
- Fallos: 0
- Errores: 0
- Omitidos: 0
- Tiempo total (s): 5.81

### Cobertura Jacoco
- Lineas: 93,75%
- Ramas: 64,29%
- Instrucciones: 93,73%

### Checkstyle (main + test)
- Total hallazgos: 0

### PMD (main + test)
- Total hallazgos: 6
- Resumen por regla:
  - UnusedLocalVariable: 3
  - InsufficientStringBufferDeclaration: 1
  - RedundantFieldInitializer: 1
  - MissingSerialVersionUID: 1

| Archivo | Regla | Prioridad | Linea | Mensaje |
|---|---|---:|---:|---|
| C:\Users\german.rojas\Desktop\Nueva carpeta\reservas-sk\Backend\services\locations-service\src\main\java\com\reservas\sk\locations_service\adapters\out\persistence\JdbcLocationsPersistenceAdapter.java | InsufficientStringBufferDeclaration | 3 | 138 | StringBuilder has been initialized with size 128, but has at least 137 characters appended. |
| C:\Users\german.rojas\Desktop\Nueva carpeta\reservas-sk\Backend\services\locations-service\src\main\java\com\reservas\sk\locations_service\exception\ApiException.java | MissingSerialVersionUID | 3 | 6 | Classes implementing Serializable should set a serialVersionUID |
| C:\Users\german.rojas\Desktop\Nueva carpeta\reservas-sk\Backend\services\locations-service\src\main\java\com\reservas\sk\locations_service\infrastructure\config\RabbitProperties.java | RedundantFieldInitializer | 3 | 7 | Avoid using redundant field initializer for 'enabled' |
| C:\Users\german.rojas\Desktop\Nueva carpeta\reservas-sk\Backend\services\locations-service\src\test\java\com\reservas\sk\locations_service\adapters\in\web\LocationsControllerUnitTest.java | UnusedLocalVariable | 3 | 45 | Avoid unused local variables such as 'listed'. |
| C:\Users\german.rojas\Desktop\Nueva carpeta\reservas-sk\Backend\services\locations-service\src\test\java\com\reservas\sk\locations_service\adapters\in\web\LocationsControllerUnitTest.java | UnusedLocalVariable | 3 | 66 | Avoid unused local variables such as 'listed'. |
| C:\Users\german.rojas\Desktop\Nueva carpeta\reservas-sk\Backend\services\locations-service\src\test\java\com\reservas\sk\locations_service\application\service\LocationsApplicationServiceTest.java | UnusedLocalVariable | 3 | 100 | Avoid unused local variables such as 'event'. |

### SpotBugs (main + test)
- Total warnings: 12
- Warnings main: 8
- Warnings test: 4
- Reporte main: services/locations-service/build/reports/spotbugs/main.html
- Reporte test: services/locations-service/build/reports/spotbugs/test.html

### Archivos de reporte
- Checkstyle main: services/locations-service/build/reports/checkstyle/main.xml y main.html
- Checkstyle test: services/locations-service/build/reports/checkstyle/test.xml y test.html
- PMD main: services/locations-service/build/reports/pmd/main.xml y main.html
- PMD test: services/locations-service/build/reports/pmd/test.xml y test.html
- Tests: services/locations-service/build/reports/tests/test/index.html
- Jacoco: services/locations-service/build/reports/jacoco/test/html/index.html y jacocoTestReport.xml

## Servicio: notifications-service

### Estado de tests
- Tests: 28
- Fallos: 0
- Errores: 0
- Omitidos: 0
- Tiempo total (s): 5

### Cobertura Jacoco
- Lineas: 75,61%
- Ramas: 69,83%
- Instrucciones: 76,47%

### Checkstyle (main + test)
- Total hallazgos: 1
- Resumen por regla:
  - NeedBracesCheck: 1

| Archivo | Linea | Columna | Severidad | Regla | Mensaje |
|---|---:|---:|---|---|---|
| C:\Users\german.rojas\Desktop\Nueva carpeta\reservas-sk\Backend\services\notifications-service\src\main\java\com\reservas\sk\notifications_service\application\service\InAppNotificationService.java | 118 | 9 | warning | NeedBracesCheck | La construcciÃ³n 'if' debe usar '{}' (llaves). |

### PMD (main + test)
- Total hallazgos: 9
- Resumen por regla:
  - GuardLogStatement: 6
  - AvoidDuplicateLiterals: 1
  - LooseCoupling: 1
  - UnusedPrivateField: 1

| Archivo | Regla | Prioridad | Linea | Mensaje |
|---|---|---:|---:|---|
| C:\Users\german.rojas\Desktop\Nueva carpeta\reservas-sk\Backend\services\notifications-service\src\main\java\com\reservas\sk\notifications_service\application\service\InAppNotificationService.java | UnusedPrivateField | 3 | 12 | Avoid unused private fields such as 'reservaRepository'. |
| C:\Users\german.rojas\Desktop\Nueva carpeta\reservas-sk\Backend\services\notifications-service\src\main\java\com\reservas\sk\notifications_service\application\service\InAppNotificationService.java | GuardLogStatement | 2 | 86 | Logger calls should be surrounded by log level guards. |
| C:\Users\german.rojas\Desktop\Nueva carpeta\reservas-sk\Backend\services\notifications-service\src\main\java\com\reservas\sk\notifications_service\application\service\InAppNotificationService.java | GuardLogStatement | 2 | 113 | Logger calls should be surrounded by log level guards. |
| C:\Users\german.rojas\Desktop\Nueva carpeta\reservas-sk\Backend\services\notifications-service\src\main\java\com\reservas\sk\notifications_service\application\service\InAppNotificationService.java | GuardLogStatement | 2 | 145 | Logger calls should be surrounded by log level guards. |
| C:\Users\german.rojas\Desktop\Nueva carpeta\reservas-sk\Backend\services\notifications-service\src\main\java\com\reservas\sk\notifications_service\application\service\ReservationReminderApplicationService.java | LooseCoupling | 3 | 22 | Avoid using implementation types like 'ConcurrentHashMap'; use the interface instead |
| C:\Users\german.rojas\Desktop\Nueva carpeta\reservas-sk\Backend\services\notifications-service\src\main\java\com\reservas\sk\notifications_service\application\service\ReservationReminderApplicationService.java | AvoidDuplicateLiterals | 3 | 34 | The String literal "reservationId" appears 4 times in this file; the first occurrence is on line 34 |
| C:\Users\german.rojas\Desktop\Nueva carpeta\reservas-sk\Backend\services\notifications-service\src\test\java\com\reservas\sk\notifications_service\application\service\InAppNotificationServiceTest.java | GuardLogStatement | 2 | 91 | Logger calls should be surrounded by log level guards. |
| C:\Users\german.rojas\Desktop\Nueva carpeta\reservas-sk\Backend\services\notifications-service\src\test\java\com\reservas\sk\notifications_service\application\service\InAppNotificationServiceTest.java | GuardLogStatement | 2 | 102 | Logger calls should be surrounded by log level guards. |
| C:\Users\german.rojas\Desktop\Nueva carpeta\reservas-sk\Backend\services\notifications-service\src\test\java\com\reservas\sk\notifications_service\application\service\InAppNotificationServiceTest.java | GuardLogStatement | 2 | 117 | Logger calls should be surrounded by log level guards. |

### SpotBugs (main + test)
- Total warnings: 4
- Warnings main: 4
- Warnings test: 0
- Reporte main: services/notifications-service/build/reports/spotbugs/main.html
- Reporte test: services/notifications-service/build/reports/spotbugs/test.html

### Archivos de reporte
- Checkstyle main: services/notifications-service/build/reports/checkstyle/main.xml y main.html
- Checkstyle test: services/notifications-service/build/reports/checkstyle/test.xml y test.html
- PMD main: services/notifications-service/build/reports/pmd/main.xml y main.html
- PMD test: services/notifications-service/build/reports/pmd/test.xml y test.html
- Tests: services/notifications-service/build/reports/tests/test/index.html
- Jacoco: services/notifications-service/build/reports/jacoco/test/html/index.html y jacocoTestReport.xml

