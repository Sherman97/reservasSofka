# 🚀 PLAN DE ACCIÓN INMEDIATO - PRÓXIMAS 2 SEMANAS

**Proyecto:** Reservas SK  
**Urgencia:** CRÍTICA  
**Fecha:** 31 de Marzo de 2026  

---

## PRIORIDADES CRÍTICAS

Estos 4 items DEBEN completarse antes de cualquier lanzamiento a producción:

---

## 1️⃣ IMPLEMENTAR VALIDACIÓN DE ROL EN ENDPOINTS

**Nivel:** 🔴 CRÍTICO  
**Tiempo:** 2-3 días  
**Riesgo:** ALTO - vulnerabilidad de acceso

### Problema:
```
Usuario regular PUEDE intentar:
PUT /locations/cities/1 → Editar ciudad (debería fallar)
PUT /locations/spaces/1 → Editar espacio (debería fallar)
POST /locations/cities → Crear ciudad (debería fallar)
```

### Solución Paso a Paso:

#### A. Actualizar JWT para incluir rol

**Archivo:** Backend/services/auth-service/src/main/java/.../TokenProvider.java

```java
// ANTES:
claims.put("user_id", user.getId());
claims.put("email", user.getEmail());

// DESPUÉS:
claims.put("user_id", user.getId());
claims.put("email", user.getEmail());
claims.put("role", user.getRole());  // ← AGREGAR ESTO
```

#### B. Crear anotación @RequireRole

**Archivo nuevo:** Backend/services/api-gateway/src/main/java/.../security/RequireRole.java

```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RequireRole {
    String[] value() default {"admin"};
}
```

#### C. Crear aspect para validar rol

**Archivo nuevo:** Backend/services/api-gateway/src/main/java/.../security/RoleAspect.java

```java
@Aspect
@Component
public class RoleAspect {
    
    @Before("@annotation(requireRole)")
    public void checkRole(JoinPoint joinPoint, RequireRole requireRole) {
        String userRole = SecurityContextHolder.getContext()
            .getAuthentication()
            .getDetails()  // obtener del JWT
            .getRole();
            
        if (!Arrays.asList(requireRole.value()).contains(userRole)) {
            throw new AccessDeniedException("Insufficient permissions");
        }
    }
}
```

#### D. Anotar endpoints

**Archivo:** Backend/services/locations-service/src/main/java/.../LocationController.java

```java
@PostMapping("/cities")
@RequireRole("admin")  // ← AGREGAR
public ResponseEntity<?> createCity(...) { ... }

@PutMapping("/cities/{id}")
@RequireRole("admin")  // ← AGREGAR
public ResponseEntity<?> updateCity(...) { ... }

@DeleteMapping("/cities/{id}")
@RequireRole("admin")  // ← AGREGAR
public ResponseEntity<?> deleteCity(...) { ... }

// Igual para /spaces, /inventory/equipments
```

#### E. Tests

**Archivo:** Backend/services/locations-service/src/test/java/.../LocationControllerSecurityTest.java

```java
@Test
public void testRegularUserCannotCreateCity() {
    String userToken = createUserToken("user");  // rol = "user"
    
    mockMvc.perform(post("/locations/cities")
        .header("Authorization", "Bearer " + userToken)
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"name\": \"Barcelona\"}"))
        .andExpect(status().isForbidden())  // 403
        .andExpect(jsonPath("$.errorCode").value("INSUFFICIENT_PERMISSIONS"));
}

@Test
public void testAdminCanCreateCity() {
    String adminToken = createAdminToken();  // rol = "admin"
    
    mockMvc.perform(post("/locations/cities")
        .header("Authorization", "Bearer " + adminToken)
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"name\": \"Barcelona\"}"))
        .andExpect(status().isCreated());
}
```

**Checklist de endpoints a proteger:**
- [ ] POST /locations/cities
- [ ] PUT /locations/cities/{id}
- [ ] DELETE /locations/cities/{id}
- [ ] POST /locations/spaces
- [ ] PUT /locations/spaces/{id}
- [ ] DELETE /locations/spaces/{id}
- [ ] POST /inventory/equipments
- [ ] PUT /inventory/equipments/{id}
- [ ] DELETE /inventory/equipments/{id}
- [ ] POST /bookings/reservations (validar: puede crear para sí, admin para otros)

---

## 2️⃣ IMPLEMENTAR RATE LIMITING EN /auth/login

**Nivel:** 🔴 CRÍTICO  
**Tiempo:** 1-2 días  
**Riesgo:** ALTO - ataque de fuerza bruta

### Problema:
```
Atacante puede intentar 10,000 logins/segundo
Sin defensa contra diccionarios
```

### Solución:

#### A. Agregar dependencia

**Archivo:** Backend/services/auth-service/build.gradle

```gradle
dependencies {
    implementation 'io.github.bucket4j:bucket4j-core:7.6.0'
}
```

#### B. Crear rate limiter

**Archivo nuevo:** Backend/services/auth-service/src/main/java/.../security/RateLimiter.java

```java
@Component
public class LoginRateLimiter {
    
    private final Map<String, Bucket> cache = new ConcurrentHashMap<>();
    
    public void checkLimit(String identifier) throws TooManyRequestsException {
        Bucket bucket = cache.computeIfAbsent(identifier, k -> createNewBucket());
        
        if (!bucket.tryConsume(1)) {
            throw new TooManyRequestsException("Too many login attempts. Try again in 15 minutes.");
        }
    }
    
    private Bucket createNewBucket() {
        Bandwidth limit = Bandwidth.classic(5, Refill.intervally(5, Duration.ofMinutes(15)));
        return Bucket4j.builder()
            .addLimit(limit)
            .build();
    }
}
```

#### C. Integrar en login

**Archivo:** Backend/services/auth-service/src/main/java/.../AuthController.java

```java
@PostMapping("/login")
public ResponseEntity<?> login(@RequestBody LoginRequest req) {
    // 1. Validar límite de intentos
    loginRateLimiter.checkLimit(req.getEmail());  // ← AGREGAR
    
    // 2. Buscar usuario
    Optional<User> user = userRepository.findByEmail(req.getEmail());
    if (user.isEmpty()) {
        // NO ESPECIFICAR QUE EMAIL NO EXISTE (seguridad)
        return ResponseEntity.status(401)
            .body(new ErrorResponse("Invalid credentials", "INVALID_CREDENTIALS"));
    }
    
    // 3. Validar contraseña
    if (!passwordEncoder.matches(req.getPassword(), user.get().getPassword())) {
        return ResponseEntity.status(401)
            .body(new ErrorResponse("Invalid credentials", "INVALID_CREDENTIALS"));
    }
    
    // 4. Generar token
    String token = tokenProvider.generateToken(user.get());
    return ResponseEntity.ok(new LoginResponse(user.get(), token));
}
```

#### D. Tests

```java
@Test
public void testTooManyLoginAttempts() {
    String email = "attacker@evil.com";
    
    // Intentar 6 veces (límite es 5)
    for (int i = 0; i < 6; i++) {
        mockMvc.perform(post("/auth/login")
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"email\": \"" + email + "\", \"password\": \"wrong\"}"));
    }
    
    // 6to intento debe fallar
    mockMvc.perform(post("/auth/login")
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"email\": \"" + email + "\", \"password\": \"wrong\"}"))
        .andExpect(status().isTooManyRequests())
        .andExpect(jsonPath("$.errorCode").value("RATE_LIMIT_EXCEEDED"));
}
```

---

## 3️⃣ IMPLEMENTAR REFRESH TOKEN FLOW

**Nivel:** 🔴 CRÍTICO  
**Tiempo:** 3-4 días  
**Riesgo:** MEDIO - seguridad + UX

### Problema:
```
Token expira en X minutos
Usuario debe volver a hacer login
UX pobre si X es corto (15 min)
Inseguro si X es largo (24h)
```

### Solución:

#### A. Crear tabla refresh_tokens

**Archivo:** Backend/services/database/liquibase/changelog/005_add_refresh_tokens.sql

```sql
CREATE TABLE refresh_tokens (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_expires_at ON refresh_tokens(expires_at);
```

#### B. Crear TokenProvider mejorado

**Archivo:** Backend/services/auth-service/src/main/java/.../TokenProvider.java

```java
public class TokenProvider {
    
    private static final long ACCESS_TOKEN_EXPIRATION = 15 * 60 * 1000; // 15 min
    private static final long REFRESH_TOKEN_EXPIRATION = 7 * 24 * 60 * 60 * 1000; // 7 días
    
    public LoginResponse generateTokens(User user) {
        String accessToken = generateToken(user, ACCESS_TOKEN_EXPIRATION);
        String refreshToken = generateToken(user, REFRESH_TOKEN_EXPIRATION);
        
        // Guardar hash de refreshToken en BD (por seguridad, no guardar token completo)
        saveRefreshToken(user.getId(), refreshToken);
        
        return new LoginResponse(
            user,
            accessToken,
            refreshToken,
            "Bearer",
            ACCESS_TOKEN_EXPIRATION / 1000  // segundos
        );
    }
    
    private String generateToken(User user, long expirationMs) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationMs);
        
        return Jwts.builder()
            .subject(user.getId().toString())
            .claim("email", user.getEmail())
            .claim("role", user.getRole())
            .issuedAt(now)
            .expiration(expiryDate)
            .signWith(getSigningKey())
            .compact();
    }
    
    public User validateAndGetUserFromToken(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
            
            return new User(
                Long.valueOf(claims.getSubject()),
                claims.get("email", String.class),
                claims.get("role", String.class)
            );
        } catch (ExpiredJwtException e) {
            throw new TokenExpiredException("Token expired");
        }
    }
    
    private void saveRefreshToken(Long userId, String refreshToken) {
        String tokenHash = hashToken(refreshToken);
        LocalDateTime expiresAt = LocalDateTime.now().plusDays(7);
        refreshTokenRepository.save(new RefreshToken(userId, tokenHash, expiresAt));
    }
}
```

#### C. Crear endpoint /auth/refresh

**Archivo:** Backend/services/auth-service/src/main/java/.../AuthController.java

```java
@PostMapping("/refresh")
public ResponseEntity<?> refresh(@RequestBody RefreshRequest req) {
    try {
        // 1. Validar refresh token
        User user = tokenProvider.validateAndGetUserFromToken(req.getRefreshToken());
        
        // 2. Verificar que existe en BD (no fue revocado)
        RefreshToken storedToken = refreshTokenRepository
            .findByUserIdAndTokenHash(user.getId(), hashToken(req.getRefreshToken()))
            .orElseThrow(() -> new InvalidTokenException("Refresh token not found or revoked"));
        
        // 3. Verificar que no expiró
        if (LocalDateTime.now().isAfter(storedToken.getExpiresAt())) {
            throw new TokenExpiredException("Refresh token expired");
        }
        
        // 4. Generar nuevo access token
        String newAccessToken = tokenProvider.generateToken(user, 15 * 60 * 1000);
        
        return ResponseEntity.ok(new AccessTokenResponse(
            newAccessToken,
            "Bearer",
            15 * 60  // segundos
        ));
        
    } catch (JwtException e) {
        return ResponseEntity.status(401)
            .body(new ErrorResponse("Invalid refresh token", "INVALID_REFRESH_TOKEN"));
    }
}
```

#### D. Actualizar frontend

**Archivo:** Frontend/src/infrastructure/api/AxiosHttpClient.js

```javascript
export class AxiosHttpClient {
    constructor() {
        this.instance = axios.create({ baseURL: VITE_API_URL });
        
        // Response interceptor para manejar 401
        this.instance.interceptors.response.use(
            response => response,
            async error => {
                const originalRequest = error.config;
                
                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;
                    
                    try {
                        const refreshToken = localStorage.getItem('refreshToken');
                        const response = await axios.post('/auth/refresh', { 
                            refreshToken 
                        });
                        
                        // Guardar nuevo token
                        localStorage.setItem('token', response.data.token);
                        
                        // Reintentar request original
                        originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
                        return this.instance(originalRequest);
                        
                    } catch (refreshError) {
                        // Refresh falló, redirigir a login
                        localStorage.clear();
                        window.location.href = '/login';
                        return Promise.reject(refreshError);
                    }
                }
                
                return Promise.reject(error);
            }
        );
    }
}
```

#### E. Tests

```java
@Test
public void testRefreshTokenGeneratesNewAccessToken() {
    // 1. Login y obtener tokens
    LoginResponse login = authService.login("user@test.com", "password123");
    String refreshToken = login.getRefreshToken();
    
    // 2. Refresh
    AccessTokenResponse response = authService.refresh(refreshToken);
    
    // 3. Validar nuevo token
    assertNotNull(response.getAccessToken());
    assertNotEquals(login.getAccessToken(), response.getAccessToken());
}

@Test
public void testRefreshWithExpiredRefreshTokenFails() {
    // Crear token que ya expiró
    String expiredRefreshToken = tokenProvider.generateToken(user, -1000);
    
    assertThrows(TokenExpiredException.class, () -> {
        authService.refresh(expiredRefreshToken);
    });
}
```

---

## 4️⃣ DOCUMENTAR MATRIZ DE PERMISOS

**Nivel:** 🔴 CRÍTICO  
**Tiempo:** 1 día  
**Riesgo:** BAJO - documentación

### Crear archivo:

**Archivo nuevo:** Backend/docs/PERMISSIONS_MATRIX.md

```markdown
# Matriz de Permisos por Rol

## Leyenda
- ✅ = Permitido
- ❌ = Denegado
- ⚠️ = Condicional

## Auth Service

| Endpoint | Visitante | Usuario | Admin | Condición |
|----------|-----------|---------|-------|-----------|
| POST /auth/register | ✅ | ❌ | ❌ | Público |
| POST /auth/login | ✅ | ❌ | ❌ | Público |
| GET /auth/me | ❌ | ✅ | ✅ | Autenticado |
| POST /auth/refresh | ❌ | ✅ | ✅ | Con refresh token válido |
| GET /auth/health | ✅ | ✅ | ✅ | Health check público |

## Locations Service

| Endpoint | Visitante | Usuario | Admin | Condición |
|----------|-----------|---------|-------|-----------|
| POST /locations/cities | ❌ | ❌ | ✅ | Solo admin |
| GET /locations/cities | ❌ | ✅ | ✅ | Autenticado |
| GET /locations/cities/{id} | ❌ | ✅ | ✅ | Autenticado |
| PUT /locations/cities/{id} | ❌ | ❌ | ✅ | Solo admin |
| DELETE /locations/cities/{id} | ❌ | ❌ | ⚠️ | Solo admin, sin dependencias |
| POST /locations/spaces | ❌ | ❌ | ✅ | Solo admin |
| GET /locations/spaces | ❌ | ✅ | ✅ | Autenticado |
| GET /locations/spaces/{id} | ❌ | ✅ | ✅ | Autenticado |
| PUT /locations/spaces/{id} | ❌ | ❌ | ✅ | Solo admin |
| DELETE /locations/spaces/{id} | ❌ | ❌ | ⚠️ | Solo admin, sin reservas activas |

## Bookings Service

| Endpoint | Visitante | Usuario | Admin | Condición |
|----------|-----------|---------|-------|-----------|
| GET /bookings/spaces/{id}/availability | ❌ | ✅ | ✅ | Autenticado |
| POST /bookings/reservations | ❌ | ✅ | ✅ | Usuario: solo para sí, Admin: para cualquiera |
| GET /bookings/reservations | ❌ | ⚠️ | ⚠️ | Usuario: solo suyas, Admin: todas |
| GET /bookings/reservations/{id} | ❌ | ⚠️ | ✅ | Usuario: solo si es suya, Admin: todas |
| PATCH /bookings/reservations/{id}/cancel | ❌ | ⚠️ | ✅ | Usuario: solo si es suya, Admin: todas |
| PUT /bookings/reservations/{id}/reschedule | ❌ | ❌ | ✅ | Solo admin (futuro) |
| PUT /bookings/reservations/{id}/reassign | ❌ | ❌ | ✅ | Solo admin (futuro) |

## Inventory Service

| Endpoint | Visitante | Usuario | Admin | Condición |
|----------|-----------|---------|-------|-----------|
| POST /inventory/equipments | ❌ | ❌ | ✅ | Solo admin |
| GET /inventory/equipments | ❌ | ✅ | ✅ | Autenticado |
| GET /inventory/equipments/{id} | ❌ | ✅ | ✅ | Autenticado |
| PUT /inventory/equipments/{id} | ❌ | ❌ | ✅ | Solo admin |
| DELETE /inventory/equipments/{id} | ❌ | ❌ | ⚠️ | Solo admin, sin reservas activas |

## Notifications Service

| Endpoint | Visitante | Usuario | Admin | Condición |
|----------|-----------|---------|-------|-----------|
| WebSocket /notifications/ws | ❌ | ✅ | ✅ | Autenticado |
| WebSocket /bookings/ws | ❌ | ✅ | ✅ | Autenticado |
```

---

## RESUMEN EJECUTIVO - 2 SEMANAS

| Tarea | Día | Dificultad | Status |
|-------|-----|-----------|--------|
| 1. Validación de roles | Día 1-3 | Media | ⏳ TODO |
| 2. Rate limiting | Día 2-3 | Fácil | ⏳ TODO |
| 3. Refresh tokens | Día 4-6 | Media | ⏳ TODO |
| 4. Documentar permisos | Día 7 | Fácil | ⏳ TODO |
| 5. Testing completo | Día 8-10 | Difícil | ⏳ TODO |
| 6. Code review + merge | Día 11-14 | Fácil | ⏳ TODO |

**Total:** 2 sprints (10-14 días)  
**Equipo recomendado:** 2 backend developers  
**Prerequisito:** Estar en rama develop, limpiar cualquier tarea en progreso

---

## COMANDOS INICIALES

```bash
# 1. Crear rama para cambios
git checkout -b security/role-validation-and-refresh-tokens

# 2. Backend: instalar dependencias nuevas
cd Backend
./gradlew dependencies

# 3. Frontend: actualizar interceptor
cd ../Frontend
npm install

# 4. Ejecutar tests
cd ../Backend
./gradlew test

# 5. Commit y PR cuando listo
git commit -m "feat: implement role-based access control and refresh token flow"
git push origin security/role-validation-and-refresh-tokens
```

---

## VALIDACIÓN AL FINAL

**Checklist de aceptación:**

- [ ] Token JWT contiene claim "role"
- [ ] POST /locations/cities retorna 403 para usuario regular
- [ ] POST /auth/login retorna refreshToken en response
- [ ] POST /auth/refresh genera nuevo accessToken
- [ ] Frontend maneja 401 y refresca token automáticamente
- [ ] POST /auth/login limita a 5 intentos / 15 minutos
- [ ] Matriz de permisos documentada en Backend/docs/PERMISSIONS_MATRIX.md
- [ ] Todos los tests pasan (90%+ cobertura)
- [ ] Code review completado
- [ ] Merged a develop

---

## CONTACTOS Y ESCALAMIENTO

Si encuentras bloqueadores:
- 🔴 Critical: Escalar a Lead de Backend inmediatamente
- 🟠 High: Reunión de standup
- 🟡 Medium: Comentario en ticket de Jira

---

**¡EMPEZAR HOY!** 🚀


