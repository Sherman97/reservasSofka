#!/usr/bin/env bash
# ============================================================
# Black-box test: Creación de usuario (auth-service)
# Ejecuta requests HTTP reales contra el servicio levantado.
# ============================================================
set -euo pipefail

BASE_URL="${AUTH_URL:-http://localhost:3001}"
PASSED=0
FAILED=0
TOTAL=0

# ── Helpers ──────────────────────────────────────────────────

log_pass() { PASSED=$((PASSED+1)); TOTAL=$((TOTAL+1)); echo "  ✅ PASS: $1"; }
log_fail() { FAILED=$((FAILED+1)); TOTAL=$((TOTAL+1)); echo "  ❌ FAIL: $1 — $2"; }

assert_status() {
  local test_name="$1" expected="$2" actual="$3" body="$4"
  if [ "$actual" -eq "$expected" ]; then
    log_pass "$test_name (HTTP $actual)"
  else
    log_fail "$test_name" "esperado HTTP $expected, recibido HTTP $actual — body: $body"
  fi
}

assert_json_field() {
  local test_name="$1" body="$2" field="$3" expected="$4"
  local actual
  actual=$(echo "$body" | python3 -c "import sys,json; print(json.load(sys.stdin)$field)" 2>/dev/null || echo "__PARSE_ERROR__")
  if [ "$actual" = "$expected" ]; then
    log_pass "$test_name"
  else
    log_fail "$test_name" "esperado '$expected', recibido '$actual'"
  fi
}

# ── Wait for service ─────────────────────────────────────────

echo ""
echo "⏳ Esperando a que auth-service esté listo en $BASE_URL/health ..."
for i in $(seq 1 60); do
  if curl -sf "$BASE_URL/health" > /dev/null 2>&1; then
    echo "   Servicio listo después de ${i}s"
    break
  fi
  if [ "$i" -eq 60 ]; then
    echo "❌ auth-service no respondió en 60s. Abortando."
    exit 1
  fi
  sleep 1
done

UNIQUE_EMAIL="bbtest_$(date +%s%N)@test.com"

# ============================================================
echo ""
echo "═══════════════════════════════════════════════════════"
echo " TEST 1: Registro exitoso de usuario (POST /auth/register)"
echo "═══════════════════════════════════════════════════════"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test User\",\"email\":\"$UNIQUE_EMAIL\",\"password\":\"securePass123\"}")

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

assert_status "Registro exitoso" 201 "$HTTP_CODE" "$BODY"
assert_json_field "Campo ok=True" "$BODY" "['ok']" "True"
assert_json_field "Nombre correcto" "$BODY" "['data']['user']['name']" "Test User"
assert_json_field "Email correcto" "$BODY" "['data']['user']['email']" "$UNIQUE_EMAIL"

# Verificar que devuelve un token JWT
TOKEN=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['token'])" 2>/dev/null || echo "")
if [ -n "$TOKEN" ] && [ "$TOKEN" != "None" ] && [ "$TOKEN" != "null" ]; then
  log_pass "Token JWT presente en la respuesta"
else
  log_fail "Token JWT presente en la respuesta" "token vacío o nulo"
fi

# ============================================================
echo ""
echo "═══════════════════════════════════════════════════════"
echo " TEST 2: Registro duplicado (mismo email → 409)"
echo "═══════════════════════════════════════════════════════"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test User 2\",\"email\":\"$UNIQUE_EMAIL\",\"password\":\"otherPass456\"}")

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

assert_status "Registro duplicado rechazado" 409 "$HTTP_CODE" "$BODY"
assert_json_field "ok=False" "$BODY" "['ok']" "False"
assert_json_field "errorCode=EMAIL_ALREADY_REGISTERED" "$BODY" "['errorCode']" "EMAIL_ALREADY_REGISTERED"

# ============================================================
echo ""
echo "═══════════════════════════════════════════════════════"
echo " TEST 3: Validación — campos vacíos (→ 400)"
echo "═══════════════════════════════════════════════════════"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"name":"","email":"","password":""}')

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

assert_status "Campos vacíos rechazados" 400 "$HTTP_CODE" "$BODY"
assert_json_field "ok=False" "$BODY" "['ok']" "False"

# ============================================================
echo ""
echo "═══════════════════════════════════════════════════════"
echo " TEST 4: Validación — email inválido (→ 400)"
echo "═══════════════════════════════════════════════════════"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"name":"Bad Email","email":"not-an-email","password":"securePass123"}')

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

assert_status "Email inválido rechazado" 400 "$HTTP_CODE" "$BODY"

# ============================================================
echo ""
echo "═══════════════════════════════════════════════════════"
echo " TEST 5: Validación — password corto (< 6 chars → 400)"
echo "═══════════════════════════════════════════════════════"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"name":"Short Pass","email":"short@test.com","password":"123"}')

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

assert_status "Password corto rechazado" 400 "$HTTP_CODE" "$BODY"

# ============================================================
echo ""
echo "═══════════════════════════════════════════════════════"
echo " TEST 6: Login con usuario creado (POST /auth/login)"
echo "═══════════════════════════════════════════════════════"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$UNIQUE_EMAIL\",\"password\":\"securePass123\"}")

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

assert_status "Login exitoso" 200 "$HTTP_CODE" "$BODY"
assert_json_field "ok=True" "$BODY" "['ok']" "True"

# ============================================================
echo ""
echo "═══════════════════════════════════════════════════════"
echo " TEST 7: GET /auth/me con token válido"
echo "═══════════════════════════════════════════════════════"

if [ -n "$TOKEN" ] && [ "$TOKEN" != "None" ] && [ "$TOKEN" != "null" ]; then
  RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/auth/me" \
    -H "Authorization: Bearer $TOKEN")

  HTTP_CODE=$(echo "$RESPONSE" | tail -1)
  BODY=$(echo "$RESPONSE" | sed '$d')

  assert_status "GET /auth/me con token" 200 "$HTTP_CODE" "$BODY"
  assert_json_field "Email correcto en /me" "$BODY" "['data']['email']" "$UNIQUE_EMAIL"
else
  log_fail "GET /auth/me" "no hay token de Test 1 para usar"
fi

# ── Resumen ──────────────────────────────────────────────────
echo ""
echo "═══════════════════════════════════════════════════════"
echo " RESUMEN: $PASSED/$TOTAL pasaron"
if [ "$FAILED" -gt 0 ]; then
  echo " ⚠️  $FAILED test(s) fallaron"
  echo "═══════════════════════════════════════════════════════"
  exit 1
else
  echo " 🎉 Todas las pruebas de caja negra pasaron"
  echo "═══════════════════════════════════════════════════════"
  exit 0
fi
