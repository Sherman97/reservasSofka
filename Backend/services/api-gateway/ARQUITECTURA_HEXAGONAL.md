# API Gateway - Spring Cloud Gateway (Java 17)

## Objetivo
`api-gateway` es el punto unico de entrada HTTP/WS para el sistema.

Rutas HTTP:
- `/auth/**` -> `auth-service`
- `/bookings/**` -> `bookings-service`
- `/inventory/**` -> `inventory-service`
- `/locations/**` -> `locations-service`
- `/notifications/**` -> `notifications-service`

Ruta WebSocket:
- `/notifications/ws` -> `notifications-service` (`ws://` proxy)

## Cambio clave
Se reemplazo el proxy manual con `RestTemplate` por `Spring Cloud Gateway (WebFlux)` para soportar upgrade WebSocket correctamente.

## Archivos clave
- `src/main/java/com/reservas/sk/api_gateway/infrastructure/config/GatewayProxyConfig.java`
- `src/main/java/com/reservas/sk/api_gateway/infrastructure/config/GatewayRoutesProperties.java`
- `src/main/resources/application.properties`

## Variables
- `AUTH_URL`
- `BOOKINGS_URL`
- `INVENTORY_URL`
- `LOCATIONS_URL`
- `NOTIFICATIONS_URL`
- `NOTIFICATIONS_WS_URL`

## CORS
Configurado via `spring.cloud.gateway.globalcors.*` para permitir consumo desde frontend.

## Endpoint health
- `GET /health`
