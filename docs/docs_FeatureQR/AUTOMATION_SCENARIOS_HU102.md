# Escenarios de Automatización - HU-102 Verificación QR

> **Feature:** HU-SOF-102 - Verificación de Reserva por QR  
> **Propósito:** Definir 3 escenarios críticos para automatización con diferentes frameworks de testing  
> **Fecha:** Abril 2026  
> **Nivel de Testing:** E2E, Integración Front/API, Jobs Automatizados

---

## 📋 Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Frameworks y Patrones Utilizados](#frameworks-y-patrones-utilizados)
3. [Escenario 1: Check-in Exitoso con QR Válido](#escenario-1-check-in-exitoso-con-qr-válido)
4. [Escenario 2: Rechazo de QR Inválido o Incorrecto](#escenario-2-rechazo-de-qr-inválido-o-incorrecto)
5. [Escenario 3: Marcado Automático NO_SHOW por Inasistencia](#escenario-3-marcado-automático-no_show-por-inasistencia)
6. [Estructura de Proyecto Recomendada](#estructura-de-proyecto-recomendada)
7. [Configuración y Ejecución](#configuración-y-ejecución)
8. [Métricas de Éxito](#métricas-de-éxito)

---

## Visión General

La **HU-102** implementa un sistema de check-in mediante códigos QR para combatir las "reservas fantasma" (espacios reservados pero no ocupados). Los 3 escenarios seleccionados cubren:

1. **Flujo Happy Path** - Usuario escanea QR correctamente
2. **Manejo de Errores** - Validación de QR inválidos o incorrectos
3. **Automatización de Jobs** - Liberación automática tras 5 minutos sin check-in

Cada escenario se implementa con 3 estrategias de automatización complementarias:

| Framework | Patrón | Nivel | Objetivo |
|-----------|--------|-------|----------|
| **Selenium WebDriver** | BDD + POM (Page Object Model) | E2E UI | Simular usuario real navegando la aplicación web |
| **Screenplay** | Screenplay Pattern | E2E Comportamental | Expresar intención del usuario, no clicks técnicos |
| **Front/API** | Integración HTTP + Contract Testing | Integración | Validar contrato entre frontend y backend sin UI |

---

## Frameworks y Patrones Utilizados

### 1. Selenium BDD con Page Object Model (POM)

**Características:**
- Framework: Selenium WebDriver 4.x + TestNG/JUnit
- BDD: Gherkin (`.feature` files) con Cucumber
- Patrón: Page Object Model para encapsular elementos de UI
- Lenguaje: Java 17

**Ventajas:**
- Reutilización de código con objetos de página
- Separación clara entre definición de tests (Gherkin) e implementación (Step Definitions)
- Mantenibilidad alta ante cambios de UI

**Componentes:**
```
tests/
├── features/                    # Archivos .feature BDD
│   └── qr-checkin.feature
├── pages/                       # Page Objects
│   ├── LoginPage.java
│   ├── ReservationsPage.java
│   └── QrScannerModal.java
├── steps/                       # Step Definitions
│   └── QrCheckinSteps.java
└── runners/
    └── TestRunner.java
```

### 2. Screenplay Pattern

**Características:**
- Framework: Serenity BDD + Screenplay
- Estructura: Actor-Centered (Actors, Tasks, Interactions, Questions)
- Expresividad: Lenguaje natural orientado al negocio
- Lenguaje: Java 17 / TypeScript

**Ventajas:**
- Tests altamente legibles enfocados en la intención del usuario
- Escalable para flujos complejos multi-actor (usuario, admin, job scheduler)
- Reportes automáticos con narrativa de negocio

**Componentes:**
```
screenplay/
├── actors/
│   ├── Collaborator.java       # Actor usuario final
│   └── SystemJob.java          # Actor job scheduler
├── tasks/                       # Tareas de alto nivel
│   ├── Login.java
│   ├── ScanQrCode.java
│   └── WaitForJobExecution.java
├── interactions/                # Interacciones atómicas
│   ├── Click.java
│   ├── OpenCamera.java
│   └── DecodeQr.java
└── questions/                   # Verificaciones
    ├── TheReservationStatus.java
    └── TheNotificationMessage.java
```

### 3. Front/API (Integración)

**Características:**
- Frontend: Tests de componentes React con Vitest + React Testing Library
- Backend: REST API Tests con RestAssured / Playwright API Testing
- Contract: Validación de contrato HTTP (request/response schemas)
- Lenguaje: TypeScript (frontend) + Java (backend)

**Ventajas:**
- Ejecución rápida (sin renderizado de UI completo)
- Detección temprana de breaking changes en contratos
- Ideal para CI/CD pipelines

**Componentes:**
```
integration/
├── frontend/
│   ├── useCheckIn.contract.test.ts
│   └── QrScanner.integration.test.tsx
├── backend/
│   ├── CheckInApiTest.java
│   └── ReservationMonitorJobTest.java
└── contracts/
    ├── checkin-request.schema.json
    └── checkin-response.schema.json
```

---

## Escenario 1: Check-in Exitoso con QR Válido

### 📌 Descripción del Escenario

**Historia de Usuario:** HU-SOF-102.1  
**Objetivo:** Validar que un colaborador puede confirmar su asistencia escaneando el QR correcto del espacio reservado

**Criterios BDD:**
- **Given** un colaborador autenticado con reserva activa en estado `PENDING`
- **And** la hora actual está dentro del período de gracia (hasta 5 minutos después del inicio)
- **When** el colaborador escanea el código QR válido del espacio desde la cámara web
- **Then** el sistema actualiza el estado de la reserva a `CHECKED_IN`
- **And** se muestra un mensaje de éxito "Check-in realizado exitosamente"
- **And** se envía notificación en tiempo real (WebSocket)

### 🎯 Implementación 1: Selenium BDD + POM

**Archivo Feature (Gherkin):**

```gherkin
# tests/e2e/features/qr-checkin.feature

Feature: Check-in con QR para Reservas
  Como colaborador de Sofka
  Quiero escanear el código QR de la sala reservada
  Para confirmar mi asistencia y evitar que mi reserva sea cancelada

  Background:
    Given el usuario "anderson.rodriguez@sofka.com.co" está autenticado
    And tiene una reserva activa con ID "RES-20260407-001" para el espacio "Sala Zeus" 
    And la reserva está en estado "PENDING"
    And la hora de inicio de la reserva es "2026-04-07T14:00:00Z"
    And la hora actual del sistema es "2026-04-07T14:02:00Z" # Dentro del grace period

  @smoke @critical
  Scenario: Check-in exitoso con QR válido
    Given el usuario navega hacia "Mis Reservas"
    And se encuentra en la tarjeta de la reserva "RES-20260407-001"
    When el usuario hace clic en el botón "Hacer Check-in"
    And se abre el modal de escaneo QR
    And se otorgan permisos de cámara
    And se escanea el QR válido del espacio "Sala Zeus"
    Then el estado de la reserva cambia a "CHECKED_IN"
    And se muestra el mensaje de éxito "Check-in realizado exitosamente"
    And se cierra el modal de escaneo
    And la tarjeta de reserva muestra el badge verde "Confirmada"
    And se recibe notificación push "Has confirmado tu asistencia a Sala Zeus"

  @negative
  Scenario: Check-in fuera del período de gracia
    Given la hora actual del sistema es "2026-04-07T14:06:00Z" # 6 minutos después
    When el usuario intenta hacer check-in escaneando el QR válido
    Then se muestra el mensaje de error "El tiempo para hacer check-in ha expirado"
    And el estado de la reserva permanece en "PENDING"
```

**Page Objects:**

```java
// tests/e2e/pages/ReservationsPage.java

package com.sofka.reservations.e2e.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.support.ui.ExpectedConditions;
import java.time.Duration;

public class ReservationsPage {
    
    private WebDriver driver;
    private WebDriverWait wait;
    
    // Locators usando @FindBy
    @FindBy(css = "div[data-testid='reservation-card']")
    private List<WebElement> reservationCards;
    
    @FindBy(xpath = "//button[contains(text(), 'Hacer Check-in')]")
    private WebElement checkInButton;
    
    @FindBy(css = ".reservation-status-badge")
    private WebElement statusBadge;
    
    @FindBy(css = ".success-message")
    private WebElement successMessage;
    
    @FindBy(css = ".error-message")
    private WebElement errorMessage;
    
    public ReservationsPage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        PageFactory.initElements(driver, this);
    }
    
    public void navigateToMyReservations() {
        driver.get("http://localhost:3000/reservations");
        wait.until(ExpectedConditions.visibilityOf(reservationCards.get(0)));
    }
    
    public WebElement getReservationCardById(String reservationId) {
        String xpath = String.format(
            "//div[@data-testid='reservation-card' and contains(., '%s')]", 
            reservationId
        );
        return wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath(xpath)));
    }
    
    public void clickCheckInButton(String reservationId) {
        WebElement card = getReservationCardById(reservationId);
        WebElement button = card.findElement(By.xpath(".//button[contains(text(), 'Hacer Check-in')]"));
        button.click();
    }
    
    public String getReservationStatus(String reservationId) {
        WebElement card = getReservationCardById(reservationId);
        WebElement badge = card.findElement(By.cssSelector(".reservation-status-badge"));
        return badge.getText();
    }
    
    public String getSuccessMessage() {
        wait.until(ExpectedConditions.visibilityOf(successMessage));
        return successMessage.getText();
    }
    
    public String getErrorMessage() {
        wait.until(ExpectedConditions.visibilityOf(errorMessage));
        return errorMessage.getText();
    }
    
    public boolean isReservationStatusCheckedIn(String reservationId) {
        String status = getReservationStatus(reservationId);
        return status.equalsIgnoreCase("CONFIRMADA") || status.equalsIgnoreCase("CHECKED_IN");
    }
}
```

```java
// tests/e2e/pages/QrScannerModal.java

package com.sofka.reservations.e2e.pages;

import org.openqa.selenium.*;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.support.ui.ExpectedConditions;
import java.time.Duration;

public class QrScannerModal {
    
    private WebDriver driver;
    private WebDriverWait wait;
    
    @FindBy(css = "div[data-testid='qr-scanner-modal']")
    private WebElement modalContainer;
    
    @FindBy(css = "video#qr-video-preview")
    private WebElement videoPreview;
    
    @FindBy(css = "button[data-testid='grant-camera-permission']")
    private WebElement grantPermissionButton;
    
    @FindBy(css = "canvas#qr-canvas")
    private WebElement qrCanvas;
    
    @FindBy(css = "button.modal-close")
    private WebElement closeButton;
    
    public QrScannerModal(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(15));
        PageFactory.initElements(driver, this);
    }
    
    public boolean isModalOpen() {
        try {
            wait.until(ExpectedConditions.visibilityOf(modalContainer));
            return modalContainer.isDisplayed();
        } catch (TimeoutException e) {
            return false;
        }
    }
    
    public void grantCameraPermissions() {
        // En Selenium, simular permisos de cámara requiere configuración del navegador
        // Chrome: usar ChromeOptions con --use-fake-device-for-media-stream
        // Para este test, asumimos que ya están otorgados
        wait.until(ExpectedConditions.visibilityOf(videoPreview));
    }
    
    /**
     * Simula el escaneo de un QR válido inyectando el resultado en el componente React
     * Esto evita depender de hardware de cámara real en CI/CD
     */
    public void scanValidQrCode(String spaceName) {
        // Generar JWT token válido (en un test real, esto vendría del backend de testing)
        String mockQrToken = generateMockQrToken(spaceName);
        
        // Inyectar resultado del escaneo usando JavaScript
        JavascriptExecutor js = (JavascriptExecutor) driver;
        String script = String.format(
            "window.mockQrScanResult = '%s'; " +
            "document.dispatchEvent(new CustomEvent('qr-decoded', { detail: { text: '%s' } }));",
            mockQrToken, mockQrToken
        );
        js.executeScript(script);
        
        // Esperar a que el modal se cierre (indica procesamiento exitoso)
        wait.until(ExpectedConditions.invisibilityOf(modalContainer));
    }
    
    public void scanInvalidQrCode() {
        String invalidToken = "INVALID_QR_TOKEN_12345";
        JavascriptExecutor js = (JavascriptExecutor) driver;
        js.executeScript(
            "document.dispatchEvent(new CustomEvent('qr-decoded', { detail: { text: '" + 
            invalidToken + "' } }));"
        );
    }
    
    public boolean isModalClosed() {
        try {
            wait.until(ExpectedConditions.invisibilityOf(modalContainer));
            return true;
        } catch (TimeoutException e) {
            return false;
        }
    }
    
    private String generateMockQrToken(String spaceName) {
        // En entorno de test, usar endpoint del backend para generar tokens válidos
        // Por simplicidad, aquí devolvemos un mock
        return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzcGFjZUlkIjoxLCJ0b2tlblR5cGUiOiJRUl9DSEVDS0lOIn0.MOCK_SIGNATURE";
    }
}
```

**Step Definitions:**

```java
// tests/e2e/steps/QrCheckinSteps.java

package com.sofka.reservations.e2e.steps;

import com.sofka.reservations.e2e.pages.*;
import com.sofka.reservations.e2e.utils.TestContext;
import com.sofka.reservations.e2e.utils.TimeSimulator;
import io.cucumber.java.en.*;
import org.junit.jupiter.api.Assertions;
import org.openqa.selenium.WebDriver;

public class QrCheckinSteps {
    
    private WebDriver driver;
    private TestContext context;
    private LoginPage loginPage;
    private ReservationsPage reservationsPage;
    private QrScannerModal qrScannerModal;
    private TimeSimulator timeSimulator;
    
    public QrCheckinSteps(TestContext context) {
        this.context = context;
        this.driver = context.getDriver();
        this.loginPage = new LoginPage(driver);
        this.reservationsPage = new ReservationsPage(driver);
        this.qrScannerModal = new QrScannerModal(driver);
        this.timeSimulator = new TimeSimulator();
    }
    
    @Given("el usuario {string} está autenticado")
    public void elUsuarioEstaAutenticado(String email) {
        loginPage.navigate();
        loginPage.login(email, "Test123!"); // Password de testing
        context.setCurrentUser(email);
    }
    
    @Given("tiene una reserva activa con ID {string} para el espacio {string}")
    public void tieneUnaReservaActivaConId(String reservationId, String spaceName) {
        // Crear reserva de prueba usando API de testing
        context.createTestReservation(reservationId, spaceName);
    }
    
    @Given("la reserva está en estado {string}")
    public void laReservaEstaEnEstado(String status) {
        String reservationId = context.getCurrentReservationId();
        context.updateReservationStatus(reservationId, status);
    }
    
    @Given("la hora de inicio de la reserva es {string}")
    public void laHoraDeInicioEs(String isoTimestamp) {
        context.setReservationStartTime(isoTimestamp);
    }
    
    @Given("la hora actual del sistema es {string}")
    public void laHoraActualEs(String isoTimestamp) {
        timeSimulator.setCurrentTime(isoTimestamp);
        // Inyectar tiempo mockeado en el frontend
        context.mockSystemTime(isoTimestamp);
    }
    
    @Given("el usuario navega hacia {string}")
    public void elUsuarioNavegaHacia(String pageName) {
        if (pageName.equals("Mis Reservas")) {
            reservationsPage.navigateToMyReservations();
        }
    }
    
    @When("el usuario hace clic en el botón {string}")
    public void elUsuarioHaceClicEnElBoton(String buttonText) {
        String reservationId = context.getCurrentReservationId();
        reservationsPage.clickCheckInButton(reservationId);
    }
    
    @When("se abre el modal de escaneo QR")
    public void seAbreElModalDeEscaneoQr() {
        Assertions.assertTrue(
            qrScannerModal.isModalOpen(), 
            "El modal de escaneo QR debería estar abierto"
        );
    }
    
    @When("se otorgan permisos de cámara")
    public void seOtorganPermisosDeCamara() {
        qrScannerModal.grantCameraPermissions();
    }
    
    @When("se escanea el QR válido del espacio {string}")
    public void seEscaneaElQrValidoDelEspacio(String spaceName) {
        qrScannerModal.scanValidQrCode(spaceName);
    }
    
    @When("el usuario intenta hacer check-in escaneando el QR válido")
    public void elUsuarioIntentaHacerCheckIn() {
        String reservationId = context.getCurrentReservationId();
        reservationsPage.clickCheckInButton(reservationId);
        qrScannerModal.scanValidQrCode(context.getCurrentSpaceName());
    }
    
    @Then("el estado de la reserva cambia a {string}")
    public void elEstadoDeLaReservaCambiaA(String expectedStatus) {
        String reservationId = context.getCurrentReservationId();
        // Esperar actualización (puede venir vía WebSocket)
        context.waitForReservationStatusUpdate(expectedStatus, 5000);
        
        String actualStatus = reservationsPage.getReservationStatus(reservationId);
        Assertions.assertTrue(
            actualStatus.contains(expectedStatus),
            String.format("Esperado: %s, Actual: %s", expectedStatus, actualStatus)
        );
    }
    
    @Then("se muestra el mensaje de éxito {string}")
    public void seMuestraElMensajeDeExito(String expectedMessage) {
        String actualMessage = reservationsPage.getSuccessMessage();
        Assertions.assertTrue(
            actualMessage.contains(expectedMessage),
            String.format("Mensaje esperado: '%s', actual: '%s'", expectedMessage, actualMessage)
        );
    }
    
    @Then("se cierra el modal de escaneo")
    public void seCierraElModalDeEscaneo() {
        Assertions.assertTrue(
            qrScannerModal.isModalClosed(),
            "El modal debería estar cerrado después del check-in exitoso"
        );
    }
    
    @Then("la tarjeta de reserva muestra el badge verde {string}")
    public void laTarjetaMuestraElBadge(String badgeText) {
        String reservationId = context.getCurrentReservationId();
        String status = reservationsPage.getReservationStatus(reservationId);
        Assertions.assertEquals(badgeText.toUpperCase(), status.toUpperCase());
    }
    
    @Then("se muestra el mensaje de error {string}")
    public void seMuestraElMensajeDeError(String expectedError) {
        String actualError = reservationsPage.getErrorMessage();
        Assertions.assertTrue(
            actualError.contains(expectedError),
            String.format("Error esperado: '%s', actual: '%s'", expectedError, actualError)
        );
    }
    
    @Then("el estado de la reserva permanece en {string}")
    public void elEstadoPermanece(String expectedStatus) {
        String reservationId = context.getCurrentReservationId();
        String actualStatus = reservationsPage.getReservationStatus(reservationId);
        Assertions.assertTrue(actualStatus.contains(expectedStatus));
    }
}
```

**Test Runner:**

```java
// tests/e2e/runners/TestRunner.java

package com.sofka.reservations.e2e.runners;

import io.cucumber.junit.Cucumber;
import io.cucumber.junit.CucumberOptions;
import org.junit.runner.RunWith;

@RunWith(Cucumber.class)
@CucumberOptions(
    features = "src/test/resources/features",
    glue = {"com.sofka.reservations.e2e.steps", "com.sofka.reservations.e2e.hooks"},
    plugin = {
        "pretty",
        "html:target/cucumber-reports/cucumber.html",
        "json:target/cucumber-reports/cucumber.json",
        "junit:target/cucumber-reports/cucumber.xml"
    },
    tags = "@smoke or @critical",
    monochrome = true
)
public class TestRunner {
    // Runner vacío - Cucumber maneja la ejecución
}
```

### 🎬 Implementación 2: Screenplay Pattern

```java
// screenplay/scenarios/QrCheckinScenario.java

package com.sofka.reservations.screenplay.scenarios;

import com.sofka.reservations.screenplay.actors.*;
import com.sofka.reservations.screenplay.tasks.*;
import com.sofka.reservations.screenplay.questions.*;
import net.serenitybdd.junit5.SerenityJUnit5Extension;
import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.abilities.BrowseTheWeb;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.openqa.selenium.WebDriver;

import static net.serenitybdd.screenplay.GivenWhenThen.*;
import static org.hamcrest.Matchers.*;

@ExtendWith(SerenityJUnit5Extension.class)
@DisplayName("Feature: Check-in con QR - Escenario Exitoso")
public class QrCheckinScenario {
    
    private Actor anderson;
    private WebDriver driver;
    
    @BeforeEach
    public void setUp() {
        // Anderson es un colaborador de Sofka que quiere confirmar su asistencia
        anderson = Actor.named("Anderson Rodriguez");
        anderson.can(BrowseTheWeb.with(driver));
        anderson.can(AuthenticateWithCredentials.as("anderson.rodriguez@sofka.com.co"));
    }
    
    @Test
    @DisplayName("Anderson confirma su asistencia escaneando el QR de la Sala Zeus")
    public void checkInExitoso_conQrValido() {
        
        givenThat(anderson).wasAbleTo(
            Login.withCredentials("anderson.rodriguez@sofka.com.co", "Test123!"),
            CreateReservation.forSpace("Sala Zeus")
                .onDate("2026-04-07")
                .atTime("14:00")
                .withDuration(60),
            SimulateSystemTime.at("2026-04-07T14:02:00Z") // 2 minutos después del inicio
        );
        
        when(anderson).attemptsTo(
            NavigateTo.myReservationsPage(),
            ClickOn.theCheckInButton().forReservation("RES-20260407-001"),
            GrantPermissions.forCamera(),
            ScanQrCode.ofSpace("Sala Zeus")
        );
        
        then(anderson).should(
            seeThat(TheReservationStatus.ofReservation("RES-20260407-001"), is(equalTo("CHECKED_IN"))),
            seeThat(TheSuccessMessage.displayed(), containsString("Check-in realizado exitosamente")),
            seeThat(TheNotificationBadge.color(), is(equalTo("green"))),
            seeThat(TheQrScannerModal.isOpen(), is(false))
        );
        
        // Verificar evento WebSocket (opcional)
        and(anderson).should(
            seeThat(TheWebSocketNotification.lastReceived(), 
                allOf(
                    hasEntry("type", "RESERVATION_CHECKED_IN"),
                    hasEntry("reservationId", "RES-20260407-001")
                )
            )
        );
    }
    
    @Test
    @DisplayName("Anderson no puede hacer check-in después de 6 minutos (fuera del grace period)")
    public void checkInFallido_fueraDeGracePeriod() {
        
        givenThat(anderson).wasAbleTo(
            Login.withCredentials("anderson.rodriguez@sofka.com.co", "Test123!"),
            CreateReservation.forSpace("Sala Zeus")
                .onDate("2026-04-07")
                .atTime("14:00"),
            SimulateSystemTime.at("2026-04-07T14:06:00Z") // 6 minutos después - FUERA
        );
        
        when(anderson).attemptsTo(
            NavigateTo.myReservationsPage(),
            ClickOn.theCheckInButton().forReservation("RES-20260407-001"),
            ScanQrCode.ofSpace("Sala Zeus")
        );
        
        then(anderson).should(
            seeThat(TheErrorMessage.displayed(), containsString("El tiempo para hacer check-in ha expirado")),
            seeThat(TheReservationStatus.ofReservation("RES-20260407-001"), is(equalTo("PENDING")))
        );
    }
}
```

**Tasks (Alto Nivel):**

```java
// screenplay/tasks/ScanQrCode.java

package com.sofka.reservations.screenplay.tasks;

import com.sofka.reservations.screenplay.interactions.*;
import com.sofka.reservations.screenplay.utils.QrTokenGenerator;
import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.Tasks;

public class ScanQrCode implements Task {
    
    private String spaceName;
    
    private ScanQrCode(String spaceName) {
        this.spaceName = spaceName;
    }
    
    public static ScanQrCode ofSpace(String spaceName) {
        return Tasks.instrumented(ScanQrCode.class, spaceName);
    }
    
    @Override
    public <T extends Actor> void performAs(T actor) {
        String qrToken = QrTokenGenerator.generateValidToken(spaceName);
        
        actor.attemptsTo(
            WaitFor.theQrScannerModalToBeVisible(),
            Inject.qrScanResult(qrToken), // Simula resultado del escaneo
            WaitFor.theModalToClose()
        );
    }
}
```

```java
// screenplay/tasks/CreateReservation.java

package com.sofka.reservations.screenplay.tasks;

import com.sofka.reservations.screenplay.interactions.*;
import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.rest.interactions.Post;
import static net.serenitybdd.screenplay.rest.questions.ResponseConsequence.seeThatResponse;

public class CreateReservation implements Task {
    
    private String spaceName;
    private String date;
    private String time;
    private int duration = 60;
    
    private CreateReservation(String spaceName) {
        this.spaceName = spaceName;
    }
    
    public static CreateReservation forSpace(String spaceName) {
        return new CreateReservation(spaceName);
    }
    
    public CreateReservation onDate(String date) {
        this.date = date;
        return this;
    }
    
    public CreateReservation atTime(String time) {
        this.time = time;
        return this;
    }
    
    public CreateReservation withDuration(int minutes) {
        this.duration = minutes;
        return this;
    }
    
    @Override
    public <T extends Actor> void performAs(T actor) {
        String requestBody = String.format("""
            {
                "spaceName": "%s",
                "startDatetime": "%sT%s:00Z",
                "endDatetime": "%sT%s:00Z"
            }
            """, spaceName, date, time, date, calculateEndTime(time, duration));
        
        actor.attemptsTo(
            Post.to("/api/reservations")
                .with(request -> request
                    .header("Content-Type", "application/json")
                    .header("Authorization", actor.recall("authToken"))
                    .body(requestBody)
                )
        );
        
        actor.should(seeThatResponse("Reserva creada", response -> response.statusCode(201)));
        
        // Guardar ID de reserva para uso posterior
        String reservationId = actor.asksFor(JsonPath.read("$.reservationId"));
        actor.remember("currentReservationId", reservationId);
    }
    
    private String calculateEndTime(String time, int durationMinutes) {
        // Lógica para sumar duración al tiempo de inicio
        // ...
        return endTime;
    }
}
```

**Questions (Verificaciones):**

```java
// screenplay/questions/TheReservationStatus.java

package com.sofka.reservations.screenplay.questions;

import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.Question;
import net.serenitybdd.screenplay.targets.Target;
import org.openqa.selenium.By;

public class TheReservationStatus implements Question<String> {
    
    private String reservationId;
    
    private TheReservationStatus(String reservationId) {
        this.reservationId = reservationId;
    }
    
    public static TheReservationStatus ofReservation(String reservationId) {
        return new TheReservationStatus(reservationId);
    }
    
    @Override
    public String answeredBy(Actor actor) {
        Target statusBadge = Target.the("status badge de la reserva")
            .locatedBy(String.format(
                "//div[@data-reservation-id='%s']//span[@class='status-badge']",
                reservationId
            ));
        
        return statusBadge.resolveFor(actor).getText();
    }
}
```

### 🔌 Implementación 3: Front/API (Integración)

**Backend API Test:**

```java
// integration/backend/CheckInApiTest.java

package com.sofka.reservations.integration.backend;

import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.*;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.MariaDBContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static io.restassured.RestAssured.*;
import static org.hamcrest.Matchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
@DisplayName("API Integration: POST /reservations/{id}/checkin")
public class CheckInApiTest {
    
    @LocalServerPort
    private int port;
    
    @Container
    static MariaDBContainer<?> mariadb = new MariaDBContainer<>("mariadb:10.11")
        .withDatabaseName("testdb")
        .withUsername("test")
        .withPassword("test");
    
    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", mariadb::getJdbcUrl);
        registry.add("spring.datasource.username", mariadb::getUsername);
        registry.add("spring.datasource.password", mariadb::getPassword);
    }
    
    private String authToken;
    private Long reservationId;
    private String validQrToken;
    
    @BeforeEach
    public void setUp() {
        RestAssured.port = port;
        RestAssured.basePath = "/api";
        
        // 1. Autenticar usuario
        authToken = given()
            .contentType(ContentType.JSON)
            .body("""
                {
                    "email": "anderson.rodriguez@sofka.com.co",
                    "password": "Test123!"
                }
                """)
            .when()
            .post("/auth/login")
            .then()
            .statusCode(200)
            .extract().path("token");
        
        // 2. Crear reserva de prueba
        reservationId = given()
            .header("Authorization", "Bearer " + authToken)
            .contentType(ContentType.JSON)
            .body("""
                {
                    "spaceId": 1,
                    "startDatetime": "2026-04-07T14:00:00Z",
                    "endDatetime": "2026-04-07T15:00:00Z"
                }
                """)
            .when()
            .post("/reservations")
            .then()
            .statusCode(201)
            .extract().path("id");
        
        // 3. Obtener QR token válido del espacio
        validQrToken = given()
            .header("Authorization", "Bearer " + authToken)
            .when()
            .get("/spaces/1/qr-token")
            .then()
            .statusCode(200)
            .extract().path("qrToken");
    }
    
    @Test
    @DisplayName("Escenario 1: Check-in exitoso con QR válido dentro del grace period")
    public void checkInExitoso_conQrValido() {
        
        // Simular tiempo: 2 minutos después del inicio (dentro del grace period)
        mockSystemTime("2026-04-07T14:02:00Z");
        
        given()
            .header("Authorization", "Bearer " + authToken)
            .contentType(ContentType.JSON)
            .body(String.format("""
                {
                    "qrToken": "%s"
                }
                """, validQrToken))
        .when()
            .post("/reservations/" + reservationId + "/checkin")
        .then()
            .statusCode(200)
            .contentType(ContentType.JSON)
            .body("message", equalTo("Check-in realizado exitosamente"))
            .body("reservationId", equalTo(reservationId.intValue()))
            .body("status", equalTo("CHECKED_IN"))
            .body("checkedInAt", notNullValue())
            .body("checkedInAt", matchesPattern("\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}Z")); // ISO 8601 UTC
        
        // Validar Contract: Response Schema
        given()
            .header("Authorization", "Bearer " + authToken)
        .when()
            .get("/reservations/" + reservationId)
        .then()
            .statusCode(200)
            .body("status", equalTo("CHECKED_IN"))
            .body("checkedInAt", notNullValue());
    }
    
    @Test
    @DisplayName("Escenario 1 - Negativo: QR inválido (firma incorrecta)")
    public void checkInFallido_qrInvalido() {
        
        String invalidQrToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.INVALID.SIGNATURE";
        
        mockSystemTime("2026-04-07T14:02:00Z");
        
        given()
            .header("Authorization", "Bearer " + authToken)
            .contentType(ContentType.JSON)
            .body(String.format("""
                {
                    "qrToken": "%s"
                }
                """, invalidQrToken))
        .when()
            .post("/reservations/" + reservationId + "/checkin")
        .then()
            .statusCode(400) // Bad Request
            .contentType(ContentType.JSON)
            .body("error", equalTo("INVALID_QR_TOKEN"))
            .body("message", containsString("QR inválido o no corresponde a tu reserva"))
            .body("timestamp", notNullValue());
        
        // Verificar que el estado NO cambió
        given()
            .header("Authorization", "Bearer " + authToken)
        .when()
            .get("/reservations/" + reservationId)
        .then()
            .body("status", equalTo("PENDING"));
    }
    
    @Test
    @DisplayName("Escenario 1 - Negativo: Fuera del grace period (6 minutos)")
    public void checkInFallido_fueraDeGracePeriod() {
        
        mockSystemTime("2026-04-07T14:06:00Z"); // 6 minutos después
        
        given()
            .header("Authorization", "Bearer " + authToken)
            .contentType(ContentType.JSON)
            .body(String.format("""
                {
                    "qrToken": "%s"
                }
                """, validQrToken))
        .when()
            .post("/reservations/" + reservationId + "/checkin")
        .then()
            .statusCode(422) // Unprocessable Entity
            .body("error", equalTo("GRACE_PERIOD_EXPIRED"))
            .body("message", containsString("El tiempo para hacer check-in ha expirado"));
    }
    
    private void mockSystemTime(String isoTimestamp) {
        // En entorno de test, configurar Clock mockeado vía endpoint de testing
        given()
            .contentType(ContentType.JSON)
            .body(String.format("{\"currentTime\": \"%s\"}", isoTimestamp))
        .when()
            .post("/test/mock-time")
        .then()
            .statusCode(200);
    }
}
```

**Frontend Integration Test:**

```typescript
// integration/frontend/useCheckIn.contract.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useCheckIn } from '@/core/adapters/hooks/useCheckIn';
import { server } from '@/test/mocks/server';
import { http, HttpResponse } from 'msw';

describe('Contract Test: useCheckIn → POST /reservations/:id/checkin', () => {
  
  const VALID_QR_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzcGFjZUlkIjoxfQ.SIGNATURE';
  const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('authToken', 'mock-jwt-token');
  });
  
  it('Escenario 1: Enviar request con schema correcto y recibir response 200 con contrato válido', async () => {
    
    // Arrange: Mock del backend siguiendo contrato esperado
    server.use(
      http.post(`${BASE_URL}/reservations/123/checkin`, async ({ request }) => {
        const body = await request.json();
        
        // Validar REQUEST schema (contrato frontend → backend)
        expect(body).toEqual({
          qrToken: expect.stringMatching(/^eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/), // JWT format
        });
        
        expect(request.headers.get('Content-Type')).toBe('application/json');
        expect(request.headers.get('Authorization')).toMatch(/^Bearer .+/);
        
        // Responder con RESPONSE schema esperado
        return HttpResponse.json(
          {
            message: 'Check-in realizado exitosamente',
            reservationId: 123,
            status: 'CHECKED_IN',
            checkedInAt: '2026-04-07T14:02:00Z'
          },
          { status: 200 }
        );
      })
    );
    
    // Act: Ejecutar hook de check-in
    const { result } = renderHook(() => useCheckIn());
    
    result.current.checkIn(123, VALID_QR_TOKEN);
    
    // Assert: Verificar que el hook procesó correctamente la response
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(result.current.error).toBeNull();
    expect(result.current.success).toBe(true);
    expect(result.current.data).toMatchObject({
      message: 'Check-in realizado exitosamente',
      status: 'CHECKED_IN',
      checkedInAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/), // ISO 8601
    });
  });
  
  it('Escenario 1 - Negativo: Backend retorna 400 con QR inválido (contrato de error)', async () => {
    
    const INVALID_QR = 'invalid-token-123';
    
    server.use(
      http.post(`${BASE_URL}/reservations/123/checkin`, () => {
        return HttpResponse.json(
          {
            error: 'INVALID_QR_TOKEN',
            message: 'QR inválido o no corresponde a tu reserva actual',
            timestamp: '2026-04-07T14:02:00Z'
          },
          { status: 400 }
        );
      })
    );
    
    const { result } = renderHook(() => useCheckIn());
    
    result.current.checkIn(123, INVALID_QR);
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    // Verificar que el hook maneja correctamente el contrato de error
    expect(result.current.success).toBe(false);
    expect(result.current.error).toMatchObject({
      code: 'INVALID_QR_TOKEN',
      message: expect.stringContaining('QR inválido'),
      timestamp: expect.any(String),
    });
  });
  
  it('Escenario 1 - Negativo: Backend retorna 422 (fuera de grace period)', async () => {
    
    server.use(
      http.post(`${BASE_URL}/reservations/123/checkin`, () => {
        return HttpResponse.json(
          {
            error: 'GRACE_PERIOD_EXPIRED',
            message: 'El tiempo para hacer check-in ha expirado (límite: 5 minutos)',
            timestamp: '2026-04-07T14:06:00Z'
          },
          { status: 422 }
        );
      })
    );
    
    const { result } = renderHook(() => useCheckIn());
    
    result.current.checkIn(123, VALID_QR_TOKEN);
    
    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
    });
    
    expect(result.current.error.code).toBe('GRACE_PERIOD_EXPIRED');
    expect(result.current.error.message).toContain('expirado');
  });
});
```

---

## Escenario 2: Rechazo de QR Inválido o Incorrecto

### 📌 Descripción del Escenario

**Historia de Usuario:** HU-SOF-102.2  
**Objetivo:** Validar que el sistema rechaza QR codes inválidos, expirados o que no corresponden a la reserva del usuario

**Criterios BDD:**
- **Given** un colaborador intenta hacer check-in en un espacio
- **When** escanea un código QR con alguna de estas condiciones:
  - Firma JWT inválida (token adulterado)
  - SpaceId del token ≠ spaceId de la reserva
  - QR ilegible o corrupto
- **Then** el sistema muestra mensaje de error claro
- **And** el estado de la reserva permanece en `PENDING`
- **And** se registra el intento fallido en logs de auditoría

### 🎯 Implementación 1: Selenium BDD + POM

```gherkin
# tests/e2e/features/qr-checkin-errors.feature

Feature: Validación de QR - Manejo de Errores
  Como sistema de reservas
  Quiero rechazar códigos QR inválidos o incorrectos
  Para evitar check-ins fraudulentos o erróneos

  Background:
    Given el usuario "juan.perez@sofka.com.co" está autenticado
    And tiene una reserva para "Sala Zeus" (ID: "RES-20260407-002")
    And la reserva está en estado "PENDING"
    And la hora actual es "2026-04-07T14:02:00Z" # Dentro del grace period

  @critical @security
  Scenario: QR con firma JWT inválida (token adulterado)
    When el usuario intenta hacer check-in 
    And escanea un QR con token adulterado "eyJhbGciOiJIUzI1NiJ9.FAKE.SIGNATURE"
    Then se muestra el error "QR inválido o no corresponde a tu reserva actual"
    And el estado de la reserva permanece en "PENDING"
    And se registra el intento fallido en los logs de auditoría

  @critical @negative
  Scenario: QR de un espacio diferente (Space ID mismatch)
    Given la reserva es para el espacio con ID 1 ("Sala Zeus")
    When el usuario escanea el QR válido del espacio con ID 2 ("Sala Apolo")
    Then se muestra el error "Este QR no corresponde a tu reserva actual"
    And el estado permanece en "PENDING"
    And se sugiere escanear el QR del espacio correcto

  @negative
  Scenario Outline: QR ilegible o corrupto
    When el usuario intenta escanear un QR <tipo_qr>
    Then se muestra el error "<mensaje_error>"
    And no se envía request al backend
    
    Examples:
      | tipo_qr           | mensaje_error                          |
      | corrupto          | No se pudo leer el código QR           |
      | con formato erróneo | El código escaneado no es válido      |
      | vacío             | No se detectó ningún código QR         |

  @negative @timing
  Scenario: Múltiples intentos fallidos de escaneo
    When el usuario escanea 3 QR inválidos consecutivamente
    Then se muestra el error acumulado "Múltiples intentos fallidos. Verifica que estés escaneando el QR correcto de tu espacio reservado"
    And se sugiere contactar soporte si el problema persiste
```

**Step Definitions - Manejo de Errores:**

```java
// tests/e2e/steps/QrErrorHandlingSteps.java

package com.sofka.reservations.e2e.steps;

import com.sofka.reservations.e2e.pages.*;
import com.sofka.reservations.e2e.utils.TestContext;
import io.cucumber.java.en.*;
import org.junit.jupiter.api.Assertions;

public class QrErrorHandlingSteps {
    
    private TestContext context;
    private QrScannerModal qrScannerModal;
    private ReservationsPage reservationsPage;
    private AuditLogsPage auditLogsPage; // Nueva página para verificar logs
    
    public QrErrorHandlingSteps(TestContext context) {
        this.context = context;
        this.qrScannerModal = new QrScannerModal(context.getDriver());
        this.reservationsPage = new ReservationsPage(context.getDriver());
        this.auditLogsPage = new AuditLogsPage(context.getDriver());
    }
    
    @When("escanea un QR con token adulterado {string}")
    public void escaneaQrAdulterado(String invalidToken) {
        String reservationId = context.getCurrentReservationId();
        reservationsPage.clickCheckInButton(reservationId);
        qrScannerModal.scanInvalidQrCode(invalidToken);
    }
    
    @When("la reserva es para el espacio con ID {int} \\({string}\\)")
    public void laReservaEsParaEspacio(int spaceId, String spaceName) {
        context.setCurrentSpaceId(spaceId);
        context.setCurrentSpaceName(spaceName);
    }
    
    @When("el usuario escanea el QR válido del espacio con ID {int} \\({string}\\)")
    public void escaneaQrDeEspacioDiferente(int wrongSpaceId, String wrongSpaceName) {
        String reservationId = context.getCurrentReservationId();
        reservationsPage.clickCheckInButton(reservationId);
        
        // Generar QR válido pero para un espacio diferente
        String qrTokenForWrongSpace = context.generateQrTokenForSpace(wrongSpaceId);
        qrScannerModal.scanQrCode(qrTokenForWrongSpace);
        
        context.remember("wrongSpaceScanned", wrongSpaceName);
    }
    
    @When("el usuario intenta escanear un QR {word}")
    public void escaneaQrProblematico(String tipoQr) {
        String qrToken;
        switch (tipoQr) {
            case "corrupto":
                qrToken = "���CORRUPTED_DATA���";
                break;
            case "con formato erróneo":
                qrToken = "NOT_A_JWT_TOKEN_123";
                break;
            case "vacío":
                qrToken = "";
                break;
            default:
                throw new IllegalArgumentException("Tipo de QR desconocido: " + tipoQr);
        }
        
        String reservationId = context.getCurrentReservationId();
        reservationsPage.clickCheckInButton(reservationId);
        qrScannerModal.scanQrCode(qrToken);
    }
    
    @When("el usuario escanea {int} QR inválidos consecutivamente")
    public void escanearMultiplesQrInvalidos(int cantidad) {
        String reservationId = context.getCurrentReservationId();
        reservationsPage.clickCheckInButton(reservationId);
        
        for (int i = 0; i < cantidad; i++) {
            qrScannerModal.scanInvalidQrCode("INVALID_TOKEN_" + i);
            // No cerrar el modal entre intentos
        }
    }
    
    @Then("se muestra el error {string}")
    public void verificarMensajeError(String expectedError) {
        String actualError = reservationsPage.getErrorMessage();
        Assertions.assertTrue(
            actualError.contains(expectedError),
            String.format("Error esperado: '%s', actual: '%s'", expectedError, actualError)
        );
    }
    
    @Then("se registra el intento fallido en los logs de auditoría")
    public void verificarLogDeAuditoria() {
        // En un test E2E real, esto podría verificarse:
        // 1. Consultando endpoint de admin /api/admin/audit-logs (si existe)
        // 2. Verificando base de datos directamente (menos ideal)
        // 3. Validando que se emitió un evento de auditoría (RabbitMQ)
        
        String reservationId = context.getCurrentReservationId();
        String userId = context.getCurrentUserId();
        
        boolean logExists = auditLogsPage.verifyFailedCheckInAttemptLogged(
            reservationId, 
            userId, 
            "INVALID_QR_TOKEN"
        );
        
        Assertions.assertTrue(
            logExists,
            "Debe existir un log de auditoría del intento fallido de check-in"
        );
    }
    
    @Then("se sugiere escanear el QR del espacio correcto")
    public void verificarSugerencia() {
        String suggestionText = reservationsPage.getSuggestionMessage();
        String correctSpaceName = context.getCurrentSpaceName();
        
        Assertions.assertTrue(
            suggestionText.contains(correctSpaceName),
            String.format("La sugerencia debe mencionar el espacio correcto: %s", correctSpaceName)
        );
    }
    
    @Then("no se envía request al backend")
    public void verificarNoRequestBackend() {
        // Verificar mediante captura de tráfico de red (Selenium 4 DevTools)
        // o mediante mock server que no recibió requests
        
        int requestCount = context.getNetworkRequestCount("/api/reservations/*/checkin");
        Assertions.assertEquals(
            0, 
            requestCount,
            "No debería haberse enviado request al backend con QR corrupto"
        );
    }
    
    @Then("se muestra el error acumulado {string}")
    public void verificarErrorAcumulado(String expectedError) {
        verificarMensajeError(expectedError);
    }
    
    @Then("se sugiere contactar soporte si el problema persiste")
    public void verificarSugerenciaSoporte() {
        String supportMessage = reservationsPage.getSupportContactMessage();
        Assertions.assertTrue(
            supportMessage.contains("soporte") || supportMessage.contains("ayuda"),
            "Debe incluir sugerencia de contactar soporte"
        );
    }
}
```

### 🎬 Implementación 2: Screenplay Pattern

```java
// screenplay/scenarios/QrErrorHandlingScenario.java

package com.sofka.reservations.screenplay.scenarios;

import com.sofka.reservations.screenplay.actors.*;
import com.sofka.reservations.screenplay.tasks.*;
import com.sofka.reservations.screenplay.questions.*;
import net.serenitybdd.junit5.SerenityJUnit5Extension;
import net.serenitybdd.screenplay.Actor;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;

import static net.serenitybdd.screenplay.GivenWhenThen.*;
import static org.hamcrest.Matchers.*;

@ExtendWith(SerenityJUnit5Extension.class)
@DisplayName("Feature: Validación de QR - Manejo de Errores de Seguridad")
public class QrErrorHandlingScenario {
    
    private Actor juan;
    private Actor maliciousActor; // Actor que intenta adulter QRs
    
    @BeforeEach
    public void setUp() {
        juan = Actor.named("Juan Perez");
        juan.can(AuthenticateWithCredentials.as("juan.perez@sofka.com.co"));
        
        maliciousActor = Actor.named("Atacante Malicioso");
    }
    
    @Test
    @Tag("security")
    @DisplayName("Sistema rechaza QR con firma JWT adulterada")
    public void rechazarQrAdulterado() {
        
        givenThat(juan).wasAbleTo(
            Login.successfully(),
            CreateReservation.forSpace("Sala Zeus").withId("RES-20260407-002"),
            SimulateSystemTime.at("2026-04-07T14:02:00Z")
        );
        
        when(maliciousActor).attemptsTo(
            GenerateAdulteredQrToken.forSpace("Sala Zeus"), // Token con firma falsa
            GiveTokenTo.actor(juan)
        );
        
        and(juan).attemptsTo(
            NavigateTo.myReservationsPage(),
            ClickOn.theCheckInButton().forReservation("RES-20260407-002"),
            ScanQrCode.withToken(maliciousActor.recall("adulteredToken"))
        );
        
        then(juan).should(
            seeThat(TheErrorMessage.displayed(), 
                allOf(
                    containsString("QR inválido"),
                    containsString("no corresponde a tu reserva")
                )
            ),
            seeThat(TheReservationStatus.current(), is(equalTo("PENDING"))),
            seeThat(TheAuditLog.latestEntry(), 
                allOf(
                    hasEntry("event", "CHECKIN_FAILED"),
                    hasEntry("reason", "INVALID_JWT_SIGNATURE"),
                    hasEntry("userId", juan.recall("userId")),
                    hasEntry("severity", "SECURITY_WARNING")
                )
            )
        );
    }
    
    @Test
    @DisplayName("Juan no puede hacer check-in con QR de otro espacio (Sala Apolo)")
    public void rechazarQrDeEspacioIncorrecto() {
        
        givenThat(juan).wasAbleTo(
            Login.successfully(),
            CreateReservation.forSpace("Sala Zeus").atTime("14:00") // Space ID: 1
        );
        
        when(juan).attemptsTo(
            NavigateTo.myReservationsPage(),
            ClickOn.theCheckInButton(),
            ScanQrCode.ofSpace("Sala Apolo") // Space ID: 2 - DIFERENTE
        );
        
        then(juan).should(
            seeThat(TheErrorMessage.displayed(), containsString("Este QR no corresponde a tu reserva actual")),
            seeThat(TheSuggestionMessage.displayed(), containsString("Sala Zeus")), // Espacio correcto
            seeThat(TheReservationStatus.current(), is(equalTo("PENDING")))
        );
    }
    
    @Test
    @DisplayName("Sistema maneja QR ilegible sin enviar request al backend")
    public void manejarQrIlegible() {
        
        givenThat(juan).wasAbleTo(
            Login.successfully(),
            CreateReservation.forSpace("Sala Zeus"),
            EnableNetworkMonitoring.forEndpoint("/api/reservations/*/checkin")
        );
        
        when(juan).attemptsTo(
            NavigateTo.myReservationsPage(),
            ClickOn.theCheckInButton(),
            ScanQrCode.withCorruptedData("���CORRUPTED���")
        );
        
        then(juan).should(
            seeThat(TheErrorMessage.displayed(), containsString("No se pudo leer el código QR")),
            seeThat(TheNetworkRequests.count(), is(equalTo(0))), // NO se llamó al backend
            seeThat(TheReservationStatus.current(), is(equalTo("PENDING")))
        );
    }
}
```

**Tasks Específicas:**

```java
// screenplay/tasks/GenerateAdulteredQrToken.java

package com.sofka.reservations.screenplay.tasks;

import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.Task;

public class GenerateAdulteredQrToken implements Task {
    
    private String spaceName;
    
    public static GenerateAdulteredQrToken forSpace(String spaceName) {
        return new GenerateAdulteredQrToken(spaceName);
    }
    
    @Override
    public <T extends Actor> void performAs(T actor) {
        // Crear JWT válido estructuralmente pero con firma incorrecta
        String header = base64Encode("{\"alg\":\"HS256\",\"typ\":\"JWT\"}");
        String payload = base64Encode(String.format("{\"spaceId\":%d,\"tokenType\":\"QR_CHECKIN\"}", getSpaceId(spaceName)));
        String fakeSignature = "FAKE_SIGNATURE_12345";
        
        String adulteredToken = header + "." + payload + "." + fakeSignature;
        actor.remember("adulteredToken", adulteredToken);
    }
    
    private String base64Encode(String input) {
        return java.util.Base64.getEncoder().encodeToString(input.getBytes());
    }
    
    private int getSpaceId(String spaceName) {
        // Mapeo simplificado para tests
        return spaceName.equals("Sala Zeus") ? 1 : 2;
    }
}
```

### 🔌 Implementación 3: Front/API (Integración)

```typescript
// integration/frontend/QrScanner.error-handling.test.tsx

import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QrScannerModal } from '@/ui/components/reservations/QrScannerModal';
import { server } from '@/test/mocks/server';
import { http, HttpResponse } from 'msw';

describe('Escenario 2: Manejo de Errores en Escaneo QR', () => {
  
  const mockOnSuccess = vi.fn();
  const mockOnError = vi.fn();
  const reservationId = 123;
  
  it('Rechazar QR con firma JWT inválida (400 Bad Request del backend)', async () => {
    
    const user = userEvent.setup();
    
    // Mock: Backend retorna error de validación JWT
    server.use(
      http.post('http://localhost:3001/api/reservations/123/checkin', () => {
        return HttpResponse.json(
          {
            error: 'INVALID_QR_TOKEN',
            message: 'QR inválido o no corresponde a tu reserva actual',
            details: 'JWT signature verification failed'
          },
          { status: 400 }
        );
      })
    );
    
    render(
      <QrScannerModal
        isOpen={true}
        reservationId={reservationId}
        expectedSpaceId={1}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
        onClose={() => {}}
      />
    );
    
    // Simular escaneo de QR adulterado
    const adulteredToken = 'eyJhbGciOiJIUzI1NiJ9.FAKE.SIGNATURE';
    
    // Trigger scan event (simula html5-qrcode callback)
    const scanEvent = new CustomEvent('qr-decoded', {
      detail: { text: adulteredToken }
    });
    window.dispatchEvent(scanEvent);
    
    // Verificar que se muestra el mensaje de error
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        /QR inválido o no corresponde a tu reserva actual/i
      );
    });
    
    expect(mockOnError).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 'INVALID_QR_TOKEN',
        message: expect.stringContaining('QR inválido')
      })
    );
    
    expect(mockOnSuccess).not.toHaveBeenCalled();
    
    // Verificar que se registró el intento en analytics (opcional)
    expect(window.analytics?.track).toHaveBeenCalledWith('checkin_failed', {
      reason: 'invalid_jwt_signature',
      reservationId: 123
    });
  });
  
  it('Rechazar QR de espacio incorrecto (Space ID mismatch)', async () => {
    
    server.use(
      http.post('http://localhost:3001/api/reservations/123/checkin', () => {
        return HttpResponse.json(
          {
            error: 'SPACE_MISMATCH',
            message: 'Este QR no corresponde a tu reserva actual',
            expectedSpaceId: 1,
            receivedSpaceId: 2,
            correctSpaceName: 'Sala Zeus'
          },
          { status: 400 }
        );
      })
    );
    
    render(
      <QrScannerModal
        isOpen={true}
        reservationId={reservationId}
        expectedSpaceId={1} // Reserva para "Sala Zeus" (ID: 1)
        expectedSpaceName="Sala Zeus"
        onSuccess={mockOnSuccess}
        onError={mockOnError}
        onClose={() => {}}
      />
    );
    
    // QR válido pero de "Sala Apolo" (ID: 2)
    const wrongSpaceToken = generateValidQrToken(2); // Space ID: 2
    
    const scanEvent = new CustomEvent('qr-decoded', {
      detail: { text: wrongSpaceToken }
    });
    window.dispatchEvent(scanEvent);
    
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        /Este QR no corresponde a tu reserva actual/i
      );
    });
    
    // Verificar que se muestra sugerencia con el espacio correcto
    expect(screen.getByText(/Sala Zeus/i)).toBeInTheDocument();
    expect(mockSuccess).not.toHaveBeenCalled();
  });
  
  it('Manejar QR ilegible sin enviar request al backend', async () => {
    
    const networkSpy = vi.fn();
    
    // Interceptar todas las llamadas a fetch
    vi.spyOn(window, 'fetch').mockImplementation(networkSpy);
    
    render(
      <QrScannerModal
        isOpen={true}
        reservationId={reservationId}
        expectedSpaceId={1}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
        onClose={() => {}}
      />
    );
    
    // Simular datos corruptos del scanner
    const corruptedData = "���CORRUPTED_BINARY_DATA���";
    
    const scanEvent = new CustomEvent('qr-decoded', {
      detail: { text: corruptedData }
    });
    window.dispatchEvent(scanEvent);
    
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        /No se pudo leer el código QR/i
      );
    });
    
    // Verificar que NO se envió request al backend
    expect(networkSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('/checkin'),
      expect.anything()
    );
    
    expect(mockOnError).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 'QR_READ_ERROR',
        message: expect.stringContaining('No se pudo leer')
      })
    );
  });
});

function generateValidQrToken(spaceId: number): string {
  // En test real, usar librería jwt-encode o mock del backend
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(JSON.stringify({ spaceId, tokenType: "QR_CHECKIN" }));
  return `${header}.${payload}.MOCK_SIGNATURE`;
}
```

---

## Escenario 3: Marcado Automático NO_SHOW por Inasistencia

### 📌 Descripción del Escenario

**Historia de Usuario:** HU-SOF-102.3  
**Objetivo:** Validar que el job scheduler marca automáticamente como NO_SHOW las reservas sin check-in después de 5 minutos

**Criterios BDD:**
- **Given** una o más reservas en estado `PENDING`
- **And** han transcurrido más de 5 minutos desde el `startDatetime`
- **When** el job `ReservationMonitorJob` se ejecuta (cada 1 minuto)
- **Then** las reservas expiradas se marcan como `NO_SHOW`
- **And** se libera el espacio para nuevas reservas
- **And** se envía notificación al usuario informando la cancelación
- **And** el job es idempotente (no duplica actualizaciones)

### 🎯 Implementación 1: Selenium BDD + POM

```gherkin
# tests/e2e/features/no-show-automation.feature

Feature: Marcado Automático NO_SHOW por Inasistencia
  Como administrador de espacios
  Quiero que el sistema libere automáticamente reservas sin check-in
  Para maximizar la disponibilidad de salas y equipos

  Background:
    Given el job "ReservationMonitorJob" está configurado para ejecutarse cada 1 minuto
    And el grace period está configurado en 5 minutos

  @critical @automation
  Scenario: Reservas sin check-in son marcadas como NO_SHOW tras 5 minutos
    Given existen las siguientes reservas en estado PENDING:
      | ReservationID      | Usuario            | Espacio    | Inicio           | CheckIn |
      | RES-20260407-001  | anderson.rodriguez | Sala Zeus  | 14:00:00Z        | No      |
      | RES-20260407-002  | juan.perez         | Sala Apolo | 14:05:00Z        | No      |
      | RES-20260407-003  | maria.garcia       | Proyector1 | 14:10:00Z        | Sí      |
    And la hora actual del sistema es "2026-04-07T14:06:00Z" # 6 minutos después de RES-001
    When el job ReservationMonitorJob se ejecuta automáticamente
    Then la reserva "RES-20260407-001" cambia a estado "NO_SHOW" # ✅ 6 min > 5 min
    And la reserva "RES-20260407-002" permanece en "PENDING" # ⏳ Solo 1 min transcurrido
    And la reserva "RES-20260407-003" permanece en "CHECKED_IN" # ✅ Ya tiene check-in
    And el espacio "Sala Zeus" queda disponible para nuevas reservas
    And el usuario "anderson.rodriguez" recibe notificación:
      """
      Tu reserva de Sala Zeus fue cancelada por inasistencia (No-Show).
      El espacio ahora está disponible para otros colaboradores.
      """

  @automation @idempotence
  Scenario: El job es idempotente (no duplica actualizaciones)
    Given existe una reserva "RES-20260407-004" en estado PENDING desde "14:00:00Z"
    And la hora actual es "2026-04-07T14:08:00Z" # 8 minutos después
    And el job ya ejecutó y marcó la reserva como NO_SHOW en la iteración anterior
    When el job se ejecuta nuevamente (segunda iteración)
    Then la reserva permanece en "NO_SHOW" (sin cambios)
    And NO se envía notificación duplicada al usuario
    And se registra en logs: "Skip: reservation already processed as NO_SHOW"

  @automation @batch-performance
  Scenario: Procesamiento eficiente de múltiples reservas expiradas
    Given existen 50 reservas en estado PENDING con inicio hace 6+ minutos
    When el job se ejecuta
    Then las 50 reservas se actualizan a NO_SHOW en una sola transacción batch
    And el tiempo de ejecución del job es menor a 2 segundos
    And se registra en logs: "Processed 50 expired reservations in batch"

  @automation @edge-case
  Scenario: Reserva recibe check-in justo cuando el job se está ejecutando (race condition)
    Given una reserva "RES-20260407-005" en PENDING desde "14:00:00Z"
    And la hora actual es "2026-04-07T14:05:30Z" # 5.5 minutos
    When el job inicia lectura de reservas expiradas
    And simultáneamente el usuario hace check-in exitoso
    Then el job NO debe sobrescribir el estado CHECKED_IN con NO_SHOW
    And la reserva final queda en "CHECKED_IN" (check-in gana)
```

**Step Definitions - Job Automation:**

```java
// tests/e2e/steps/NoShowJobSteps.java

package com.sofka.reservations.e2e.steps;

import com.sofka.reservations.e2e.utils.*;
import io.cucumber.datatable.DataTable;
import io.cucumber.java.en.*;
import org.junit.jupiter.api.Assertions;
import java.time.Instant;
import java.util.*;

public class NoShowJobSteps {
    
    private TestContext context;
    private JobSchedulerSimulator jobSimulator;
    private DatabaseHelper dbHelper;
    private NotificationVerifier notificationVerifier;
    
    public NoShowJobSteps(TestContext context) {
        this.context = context;
        this.jobSimulator = new JobSchedulerSimulator(context);
        this.dbHelper = new DatabaseHelper(context);
        this.notificationVerifier = new NotificationVerifier(context);
    }
    
    @Given("el job {string} está configurado para ejecutarse cada {int} minuto(s)")
    public void configurarJob(String jobName, int intervalMinutes) {
        jobSimulator.configureJob(jobName, intervalMinutes);
    }
    
    @Given("el grace period está configurado en {int} minutos")
    public void configurarGracePeriod(int minutes) {
        context.setGracePeriodMinutes(minutes);
    }
    
    @Given("existen las siguientes reservas en estado PENDING:")
    public void crearReservasPrueba(DataTable dataTable) {
        List<Map<String, String>> rows = dataTable.asMaps();
        
        for (Map<String, String> row : rows) {
            String reservationId = row.get("ReservationID");
            String userEmail = row.get("Usuario") + "@sofka.com.co";
            String spaceName = row.get("Espacio");
            String startTime = "2026-04-07T" + row.get("Inicio");
            boolean hasCheckIn = row.get("CheckIn").equalsIgnoreCase("Sí");
            
            // Crear reserva en BD de prueba
            dbHelper.insertReservation(
                reservationId,
                userEmail,
                spaceName,
                startTime,
                hasCheckIn ? "CHECKED_IN" : "PENDING"
            );
            
            if (hasCheckIn) {
                dbHelper.updateCheckInTime(reservationId, Instant.parse(startTime).plusSeconds(120));
            }
        }
    }
    
    @Given("existe una reserva {string} en estado PENDING desde {string}")
    public void crearReservaPending(String reservationId, String startTime) {
        String fullStartTime = "2026-04-07T" + startTime;
        dbHelper.insertReservation(
            reservationId,
            "test.user@sofka.com.co",
            "Sala Test",
            fullStartTime,
            "PENDING"
        );
    }
    
    @Given("el job ya ejecutó y marcó la reserva como NO_SHOW en la iteración anterior")
    public void marcarComoNoShowPrevio(String reservationId) {
        dbHelper.updateReservationStatus(reservationId, "NO_SHOW");
        context.remember("jobPreviouslyExecuted", true);
    }
    
    @Given("existen {int} reservas en estado PENDING con inicio hace {int}\\+ minutos")
    public void crearReservasMasivas(int cantidad, int minutosAtras) {
        Instant baseTime = Instant.now().minusSeconds(minutosAtras * 60 + 60); // +1 min extra
        
        for (int i = 1; i <= cantidad; i++) {
            String reservationId = String.format("RES-BATCH-%03d", i);
            dbHelper.insertReservation(
                reservationId,
                "user" + i + "@sofka.com.co",
                "Sala " + (i % 10),
                baseTime.toString(),
                "PENDING"
            );
        }
        
        context.remember("batchReservationIds", getBatchReservationIds(cantidad));
    }
    
    @When("el job ReservationMonitorJob se ejecuta automáticamente")
    public void ejecutarJob() {
        Instant startTime = Instant.now();
        
        // Trigger manual del job (en test, sin esperar el scheduler)
        jobSimulator.executeJob("ReservationMonitorJob");
        
        Instant endTime = Instant.now();
        long executionTimeMs = endTime.toEpochMilli() - startTime.toEpochMilli();
        
        context.remember("jobExecutionTime", executionTimeMs);
    }
    
    @When("el job se ejecuta nuevamente \\(segunda iteración\\)")
    public void ejecutarJobSegundaVez() {
        jobSimulator.executeJob("ReservationMonitorJob");
    }
    
    @When("el job inicia lectura de reservas expiradas")
    public void iniciarLecturaJob() {
        jobSimulator.startJobExecution("ReservationMonitorJob");
        // No esperar a que termine (simular concurrencia)
    }
    
    @When("simultáneamente el usuario hace check-in exitoso")
    public void checkInSimultaneo() {
        String reservationId = context.getCurrentReservationId();
        
        // Simular check-in mediante API (no UI, para rapidez)
        context.apiClient().post("/reservations/" + reservationId + "/checkin")
            .bearerAuth(context.getCurrentUserToken())
            .body("{\"qrToken\": \"" + context.getValidQrToken() + "\"}")
            .execute();
        
        // Pequeña pausa para simular race condition
        Thread.sleep(10);
    }
    
    @Then("la reserva {string} cambia a estado {string}")
    public void verificarEstadoReserva(String reservationId, String expectedStatus) {
        String actualStatus = dbHelper.getReservationStatus(reservationId);
        Assertions.assertEquals(
            expectedStatus,
            actualStatus,
            String.format("Reserva %s debería estar en %s", reservationId, expectedStatus)
        );
    }
    
    @Then("la reserva {string} permanece en {string}")
    public void verificarEstadoPermanece(String reservationId, String expectedStatus) {
        verificarEstadoReserva(reservationId, expectedStatus);
    }
    
    @Then("el espacio {string} queda disponible para nuevas reservas")
    public void verificarEspacioDisponible(String spaceName) {
        boolean isAvailable = dbHelper.isSpaceAvailable(
            spaceName,
            Instant.now(),
            Instant.now().plusSeconds(3600)
        );
        
        Assertions.assertTrue(
            isAvailable,
            String.format("El espacio %s debería estar disponible tras NO_SHOW", spaceName)
        );
    }
    
    @Then("el usuario {string} recibe notificación:")
    public void verificarNotificacion(String userEmail, String expectedMessage) {
        String fullEmail = userEmail + "@sofka.com.co";
        
        // Verificar en cola de notificaciones (WebSocket o Email)
        String actualNotification = notificationVerifier.getLatestNotification(fullEmail);
        
        Assertions.assertTrue(
            actualNotification.contains("cancelada por inasistencia"),
            "La notificación debe informar la cancelación por No-Show"
        );
        
        Assertions.assertTrue(
            actualNotification.contains(expectedMessage.trim()),
            String.format("Notificación esperada: %s", expectedMessage)
        );
    }
    
    @Then("NO se envía notificación duplicada al usuario")
    public void verificarNoNotificacionDuplicada() {
        String userEmail = context.getCurrentUserEmail();
        int notificationCount = notificationVerifier.getNotificationCount(userEmail, "NO_SHOW");
        
        Assertions.assertEquals(
            1,
            notificationCount,
            "Solo debe enviarse 1 notificación de NO_SHOW, no duplicados"
        );
    }
    
    @Then("se registra en logs: {string}")
    public void verificarLog(String expectedLogMessage) {
        boolean logExists = context.logExists(expectedLogMessage);
        Assertions.assertTrue(logExists, "Debe existir log: " + expectedLogMessage);
    }
    
    @Then("las {int} reservas se actualizan a NO_SHOW en una sola transacción batch")
    public void verificarUpdateBatch(int quantity) {
        List<String> batchIds = context.recall("batchReservationIds");
        
        for (String reservationId : batchIds) {
            String status = dbHelper.getReservationStatus(reservationId);
            Assertions.assertEquals("NO_SHOW", status);
        }
        
        // Verificar que se usó UPDATE batch (1 query, no 50 queries individuales)
        int queryCount = context.getDatabaseQueryCount("UPDATE reservations");
        Assertions.assertEquals(
            1,
            queryCount,
            "Debe usar 1 sola query batch, no múltiples INDIVIDUALes"
        );
    }
    
    @Then("el tiempo de ejecución del job es menor a {int} segundos")
    public void verificarTiempoEjecucion(int maxSeconds) {
        long executionTimeMs = context.recall("jobExecutionTime");
        long maxMs = maxSeconds * 1000;
        
        Assertions.assertTrue(
            executionTimeMs < maxMs,
            String.format("Ejecución tomó %dms, límite: %dms", executionTimeMs, maxMs)
        );
    }
    
    @Then("el job NO debe sobrescribir el estado CHECKED_IN con NO_SHOW")
    public void verificarNoSobrescritura() {
        String reservationId = context.getCurrentReservationId();
        String finalStatus = dbHelper.getReservationStatus(reservationId);
        
        Assertions.assertEquals(
            "CHECKED_IN",
            finalStatus,
            "El check-in del usuario debe ganar en race condition"
        );
    }
    
    @Then("la reserva final queda en {string} \\(check-in gana\\)")
    public void verificarEstadoFinal(String expectedStatus) {
        verificarEstadoReserva(context.getCurrentReservationId(), expectedStatus);
    }
    
    private List<String> getBatchReservationIds(int cantidad) {
        List<String> ids = new ArrayList<>();
        for (int i = 1; i <= cantidad; i++) {
            ids.add(String.format("RES-BATCH-%03d", i));
        }
        return ids;
    }
}
```

### 🎬 Implementación 2: Screenplay Pattern

```java
// screenplay/scenarios/NoShowJobScenario.java

package com.sofka.reservations.screenplay.scenarios;

import com.sofka.reservations.screenplay.actors.*;
import com.sofka.reservations.screenplay.tasks.*;
import com.sofka.reservations.screenplay.questions.*;
import net.serenitybdd.junit5.SerenityJUnit5Extension;
import net.serenitybdd.screenplay.Actor;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;

import static net.serenitybdd.screenplay.GivenWhenThen.*;
import static org.hamcrest.Matchers.*;

@ExtendWith(SerenityJUnit5Extension.class)
@DisplayName("Feature: Automatización NO_SHOW - Job Scheduler")
public class NoShowJobScenario {
    
    private Actor systemScheduler;
    private Actor anderson;
    private Actor juan;
    
    @BeforeEach
    public void setUp() {
        // "System Scheduler" es un actor especial que representa el job automático
        systemScheduler = Actor.named("System Scheduler");
        systemScheduler.can(ExecuteScheduledJobs.withInterval(1, TimeUnit.MINUTES));
        
        anderson = Actor.named("Anderson Rodriguez");
        juan = Actor.named("Juan Perez");
    }
    
    @Test
    @DisplayName("Sistema libera Sala Zeus automáticamente tras 6 minutos sin check-in")
    public void liberarSalaPorInasistencia() {
        
        givenThat(anderson).wasAbleTo(
            Login.successfully(),
            CreateReservation.forSpace("Sala Zeus")
                .atTime("14:00")
                .withId("RES-20260407-001")
        );
        
        and(systemScheduler).wasAbleTo(
            SimulateSystemTime.at("2026-04-07T14:06:00Z"), // 6 minutos después
            Configure.job("ReservationMonitorJob").toRunNow()
        );
        
        when(systemScheduler).attemptsTo(
            TriggerJob.named("ReservationMonitorJob")
        );
        
        then(systemScheduler).should(
            seeThat(TheReservationStatus.of("RES-20260407-001"), is(equalTo("NO_SHOW"))),
            seeThat(TheSpaceAvailability.of("Sala Zeus"), is(true)),
            seeThat(TheJobExecutionLog.latestEntry(), 
                allOf(
                    hasEntry("job", "ReservationMonitorJob"),
                    hasEntry("processedCount", 1),
                    hasEntry("status", "SUCCESS")
                )
            )
        );
        
        and(anderson).should(
            seeThat(TheNotification.latest(), 
                allOf(
                    hasEntry("type", "RESERVATION_NO_SHOW"),
                    hasEntry("message", containsString("cancelada por inasistencia")),
                    hasEntry("spaceName", "Sala Zeus")
                )
            )
        );
    }
    
    @Test
    @DisplayName("Job procesa 50 reservas expiradas en batch (<2 segundos)")
    public void procesarLoteGrandeEficientemente() {
        
        givenThat(systemScheduler).wasAbleTo(
            CreateBulkReservations.count(50)
                .allInStatus("PENDING")
                .allExpiredByMinutes(6)
        );
        
        when(systemScheduler).attemptsTo(
            MeasurePerformance.of(
                TriggerJob.named("ReservationMonitorJob")
            )
        );
        
        then(systemScheduler).should(
            seeThat(ThePerformanceMetrics.executionTime(), lessThan(2000L)), // < 2 segundos
            seeThat(TheReservationsWithStatus.equalTo("NO_SHOW").count(), is(50)),
            seeThat(TheDatabaseQueries.countFor("UPDATE reservations"), is(1)) // 1 batch query
        );
    }
    
    @Test
    @DisplayName("Job es idempotente - no duplica procesamiento ni notificaciones")
    public void jobEsIdempotente() {
        
        givenThat(anderson).wasAbleTo(
            CreateReservation.forSpace("Sala Zeus").atTime("14:00")
        );
        
        and(systemScheduler).wasAbleTo(
            SimulateSystemTime.at("2026-04-07T14:06:00Z"),
            TriggerJob.named("ReservationMonitorJob") // Primera ejecución
        );
        
        when(systemScheduler).attemptsTo(
            TriggerJob.named("ReservationMonitorJob") // Segunda ejecución (idempotente)
        );
        
        then(systemScheduler).should(
            seeThat(TheReservationStatus.of(anderson.recall("reservationId")), is(equalTo("NO_SHOW"))),
            seeThat(TheNotificationsSentTo.actor(anderson).withType("NO_SHOW").count(), is(1)) // Solo 1
        );
    }
    
    @Test
    @Tag("race-condition")
    @DisplayName("Check-in del usuario gana sobre marcado NO_SHOW del job")
    public void checkInGanaEnRaceCondition() {
        
        givenThat(anderson).wasAbleTo(
            Login.successfully(),
            CreateReservation.forSpace("Sala Zeus").atTime("14:00")
        );
        
        and(systemScheduler).wasAbleTo(
            SimulateSystemTime.at("2026-04-07T14:05:30Z") // 5.5 minutos
        );
        
        when(systemScheduler).attemptsTo(
            StartJob.named("ReservationMonitorJob").asynchronously() // Job inicia
        );
        
        and(anderson).simultaneously().attemptsTo(
            NavigateTo.myReservationsPage(),
            PerformCheckIn.withValidQr() // Usuario hace check-in al mismo tiempo
        );
        
        andThen(systemScheduler).attemptsTo(
            WaitForJob.toComplete()
        );
        
        then(anderson).should(
            seeThat(TheReservationStatus.current(), is(equalTo("CHECKED_IN"))), // ✅ Check-in gana
            seeThat(TheSuccessMessage.displayed(), containsString("exitosamente"))
        );
        
        and(systemScheduler).should(
            seeThat(TheJobLog.latestEntry(), 
                hasEntry("skippedReservations", greaterThan(0)) // Job saltó la reserva
            )
        );
    }
}
```

**Tasks Específicas del Job:**

```java
// screenplay/tasks/TriggerJob.java

package com.sofka.reservations.screenplay.tasks;

import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.rest.interactions.Post;
import static net.serenitybdd.screenplay.rest.questions.ResponseConsequence.seeThatResponse;

public class TriggerJob implements Task {
    
    private String jobName;
    
    public static TriggerJob named(String jobName) {
        return new TriggerJob(jobName);
    }
    
    @Override
    public <T extends Actor> void performAs(T actor) {
        // En entorno de test, usar endpoint de admin para trigger manual
        actor.attemptsTo(
            Post.to("/api/admin/jobs/" + jobName + "/trigger")
                .with(request -> request
                    .header("Authorization", "Bearer " + System.getenv("ADMIN_TOKEN"))
                )
        );
        
        actor.should(seeThatResponse(response -> response.statusCode(200)));
        
        // Esperar a que el job complete
        waitForJobCompletion(jobName, 5000); // 5 segundos timeout
    }
    
    private void waitForJobCompletion(String jobName, long timeoutMs) {
        // Polling del estado del job
        long startTime = System.currentTimeMillis();
        while (System.currentTimeMillis() - startTime < timeoutMs) {
            if (isJobCompleted(jobName)) {
                return;
            }
            try {
                Thread.sleep(100);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
        throw new RuntimeException("Job " + jobName + " no completó en " + timeoutMs + "ms");
    }
    
    private boolean isJobCompleted(String jobName) {
        // Consultar estado mediante API o base de datos
        return true; // Simplificado
    }
}
```

### 🔌 Implementación 3: Front/API (Integración)

```java
// integration/backend/ReservationMonitorJobTest.java

package com.sofka.reservations.integration.backend;

import com.sofka.bookings.infrastructure.scheduler.ReservationMonitorJob;
import com.sofka.bookings.domain.model.Reservation;
import com.sofka.bookings.adapters.out.persistence.JdbcReservationRepository;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.Dynamic PropertySource;
import org.testcontainers.containers.MariaDBContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.Instant;
import java.time.Clock;
import java.time.ZoneOffset;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@SpringBootTest
@Testcontainers
@DisplayName("Integration Test: ReservationMonitorJob")
public class ReservationMonitorJobTest {
    
    @Container
    static MariaDBContainer<?> mariadb = new MariaDBContainer<>("mariadb:10.11");
    
    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", mariadb::getJdbcUrl);
    }
    
    @Autowired
    private ReservationMonitorJob monitorJob;
    
    @Autowired
    private JdbcReservationRepository reservationRepository;
    
    @MockBean
    private Clock clock; // Mock para controlar el tiempo del sistema
    
    private static final Instant BASE_TIME = Instant.parse("2026-04-07T14:07:00Z");
    
    @BeforeEach
    public void setUp() {
        // Configurar clock mockeado
        when(clock.instant()).thenReturn(BASE_TIME);
        when(clock.getZone()).thenReturn(ZoneOffset.UTC);
        
        // Limpiar datos de test
        reservationRepository.deleteAll();
    }
    
    @Test
    @DisplayName("Escenario 3: Reservas expiradas se marcan como NO_SHOW correctamente")
    public void marcarNoShowReservasExpiradas() {
        
        // Arrange: Crear 3 reservas de prueba
        Reservation expiredReservation1 = createReservation(
            "RES-001",
            BASE_TIME.minusSeconds(360), // 6 minutos atrás (> 5 min grace)
            "PENDING"
        );
        
        Reservation expiredReservation2 = createReservation(
            "RES-002",
            BASE_TIME.minusSeconds(600), // 10 minutos atrás
            "PENDING"
        );
        
        Reservation recentReservation = createReservation(
            "RES-003",
            BASE_TIME.minusSeconds(180), // 3 minutos atrás (< 5 min grace)
            "PENDING"
        );
        
        Reservation checkedInReservation = createReservation(
            "RES-004",
            BASE_TIME.minusSeconds(400), // 6.6 minutos atrás
            "CHECKED_IN" // Ya tiene check-in, no debe cambiar
        );
        
        reservationRepository.saveAll(Arrays.asList(
            expiredReservation1,
            expiredReservation2,
            recentReservation,
            checkedInReservation
        ));
        
        // Act: Ejecutar job
        monitorJob.monitorAndMarkNoShow();
        
        // Assert: Verificar estados finales
        assertEquals("NO_SHOW", reservationRepository.findById(expiredReservation1.getId()).get().getStatus());
        assertEquals("NO_SHOW", reservationRepository.findById(expiredReservation2.getId()).get().getStatus());
        assertEquals("PENDING", reservationRepository.findById(recentReservation.getId()).get().getStatus());
        assertEquals("CHECKED_IN", reservationRepository.findById(checkedInReservation.getId()).get().getStatus());
    }
    
    @Test
    @DisplayName("Escenario 3: Job es idempotente - no reprocesa NO_SHOW existentes")
    public void jobEsIdempotente() {
        
        // Arrange: Reserva ya marcada como NO_SHOW
        Reservation alreadyNoShow = createReservation(
            "RES-005",
            BASE_TIME.minusSeconds(600),
            "NO_SHOW"
        );
        alreadyNoShow.setUpdatedAt(BASE_TIME.minusSeconds(120)); // Actualizada hace 2 min
        reservationRepository.save(alreadyNoShow);
        
        Instant updatedAtBefore = alreadyNoShow.getUpdatedAt();
        
        // Act: Ejecutar job (segunda vez)
        monitorJob.monitorAndMarkNoShow();
        
        // Assert: Timestamp NO debe cambiar (no se reprocesó)
        Reservation after = reservationRepository.findById(alreadyNoShow.getId()).get();
        assertEquals("NO_SHOW", after.getStatus());
        assertEquals(updatedAtBefore, after.getUpdatedAt()); // Sin cambios
    }
    
    @Test
    @DisplayName("Escenario 3: Procesamiento batch de 50 reservas en <2 segundos")
    public void procesarLoteGrande() {
        
        // Arrange: Crear 50 reservas expiradas
        List<Reservation> bulkReservations = new ArrayList<>();
        for (int i = 1; i <= 50; i++) {
            bulkReservations.add(createReservation(
                "RES-BULK-" + i,
                BASE_TIME.minusSeconds(360 + i), // Todas expiradas
                "PENDING"
            ));
        }
        reservationRepository.saveAll(bulkReservations);
        
        // Act: Medir tiempo de ejecución
        long startTime = System.currentTimeMillis();
        monitorJob.monitorAndMarkNoShow();
        long executionTime = System.currentTimeMillis() - startTime;
        
        // Assert: Tiempo < 2 segundos
        assertTrue(executionTime < 2000, "Ejecución tomó " + executionTime + "ms, límite: 2000ms");
        
        // Assert: Todas marcadas como NO_SHOW
        long noShowCount = reservationRepository.findAll().stream()
            .filter(r -> r.getStatus().equals("NO_SHOW"))
            .count();
        assertEquals(50, noShowCount);
    }
    
    @Test
    @DisplayName("Escenario 3: Race condition - Check-in gana sobre NO_SHOW")
    public void checkInGanaEnRaceCondition() throws InterruptedException {
        
        // Arrange: Reserva en el límite del grace period
        Reservation borderlineReservation = createReservation(
            "RES-RACE-001",
            BASE_TIME.minusSeconds(305), // 5 min 5 seg (apenas expirado)
            "PENDING"
        );
        reservationRepository.save(borderlineReservation);
        
        // Act: Simular ejecución concurrente
        Thread jobThread = new Thread(() -> {
            try {
                Thread.sleep(50); // Job inicia lectura
                monitorJob.monitorAndMarkNoShow();
            } catch (Exception e) {
                fail("Job thread failed: " + e.getMessage());
            }
        });
        
        Thread checkInThread = new Thread(() -> {
            try {
                Thread.sleep(10); // Usuario hace check-in primero
                Reservation res = reservationRepository.findById(borderlineReservation.getId()).get();
                res.setStatus("CHECKED_IN");
                res.setCheckedInAt(Instant.now());
                reservationRepository.save(res);
            } catch (Exception e) {
                fail("Check-in thread failed: " + e.getMessage());
            }
        });
        
        jobThread.start();
        checkInThread.start();
        
        jobThread.join();
        checkInThread.join();
        
        // Assert: Estado final debe ser CHECKED_IN (check-in gana)
        Reservation finalState = reservationRepository.findById(borderlineReservation.getId()).get();
        assertEquals(
            "CHECKED_IN",
            finalState.getStatus(),
            "Check-in del usuario debe ganar en race condition"
        );
    }
    
    private Reservation createReservation(String id, Instant startTime, String status) {
        Reservation reservation = new Reservation();
        reservation.setId(id);
        reservation.setUserId(123L);
        reservation.setSpaceId(1L);
        reservation.setStartDatetime(startTime);
        reservation.setEndDatetime(startTime.plusSeconds(3600));
        reservation.setStatus(status);
        reservation.setCreatedAt(Instant.now());
        reservation.setUpdatedAt(Instant.now());
        return reservation;
    }
}
```

---

## Estructura de Proyecto Recomendada

```
tests/
├── e2e/                                    # Selenium BDD + POM
│   ├── features/                           # Archivos .feature (Gherkin)
│   │   ├── qr-checkin.feature              # Escenario 1: Happy path
│   │   ├── qr-checkin-errors.feature       # Escenario 2: Manejo errores
│   │   └── no-show-automation.feature      # Escenario 3: Job NO_SHOW
│   ├── pages/                              # Page Objects
│   │   ├── LoginPage.java
│   │   ├── ReservationsPage.java
│   │   ├── QrScannerModal.java
│   │   └── AuditLogsPage.java
│   ├── steps/                              # Step Definitions
│   │   ├── QrCheckinSteps.java
│   │   ├── QrErrorHandlingSteps.java
│   │   └── NoShowJobSteps.java
│   ├── utils/                              # Utilidades
│   │   ├── TestContext.java
│   │   ├── TimeSimulator.java
│   │   ├── DatabaseHelper.java
│   │   └── NotificationVerifier.java
│   └── runners/
│       └── TestRunner.java
│
├── screenplay/                             # Screenplay Pattern
│   ├── actors/
│   │   ├── Collaborator.java
│   │   └── SystemScheduler.java
│   ├── tasks/                              # Tareas de alto nivel
│   │   ├── Login.java
│   │   ├── CreateReservation.java
│   │   ├── ScanQrCode.java
│   │   ├── TriggerJob.java
│   │   └── GenerateAdulteredQrToken.java
│   ├── interactions/                       # Interacciones atómicas
│   │   ├── Click.java
│   │   ├── WaitFor.java
│   │   └── Inject.java
│   ├── questions/                          # Verificaciones
│   │   ├── TheReservationStatus.java
│   │   ├── TheErrorMessage.java
│   │   ├── TheNotification.java
│   │   └── TheJobExecutionLog.java
│   └── scenarios/                          # Tests
│       ├── QrCheckinScenario.java
│       ├── QrErrorHandlingScenario.java
│       └── NoShowJobScenario.java
│
└── integration/                            # Front/API Integration
    ├── frontend/
    │   ├── useCheckIn.contract.test.ts     # Hook contract tests
    │   ├── QrScanner.integration.test.tsx  # Componente + mocks
    │   └── QrScanner.error-handling.test.tsx
    ├── backend/
    │   ├── CheckInApiTest.java             # REST API tests
    │   └── ReservationMonitorJobTest.java  # Job tests
    └── contracts/                          # JSON Schemas
        ├── checkin-request.schema.json
        └── checkin-response.schema.json
```

---

## Configuración y Ejecución

### Selenium BDD + POM

**Dependencias (Backend/build.gradle):**

```gradle
dependencies {
    // Testing
    testImplementation 'org.junit.jupiter:junit-jupiter:5.10.1'
    testImplementation 'io.cucumber:cucumber-java:7.14.0'
    testImplementation 'io.cucumber:cucumber-junit-platform-engine:7.14.0'
    testImplementation 'org.seleniumhq.selenium:selenium-java:4.15.0'
    testImplementation 'io.github.bonigarcia:webdrivermanager:5.6.2'
    
    // Assertions
    testImplementation 'org.assertj:assertj-core:3.24.2'
}
```

**Ejecución:**

```bash
# Ejecutar todos los tests E2E
./gradlew test --tests "**TestRunner"

# Ejecutar solo tests críticos
./gradlew test --tests "**TestRunner" -Dcucumber.filter.tags="@critical"

# Generar reporte
./gradlew cucumber
# Ver: build/reports/cucumber/index.html
```

### Screenplay Pattern

**Dependencias adicionales:**

```gradle
dependencies {
    testImplementation 'net.serenity-bdd:serenity-core:4.0.30'
    testImplementation 'net.serenity-bdd:serenity-junit5:4.0.30'
    testImplementation 'net.serenity-bdd:serenity-screenplay:4.0.30'
    testImplementation 'net.serenity-bdd:serenity-screenplay-webdriver:4.0.30'
    testImplementation 'net.serenity-bdd:serenity-screenplay-rest:4.0.30'
}
```

**Ejecución:**

```bash
# Ejecutar tests Screenplay
./gradlew clean test --tests "*Scenario"

# Generar reporte Serenity
./gradlew test aggregate
# Ver: target/site/serenity/index.html
```

### Front/API Integration

**Frontend (package.json):**

```json
{
  "scripts": {
    "test:integration": "vitest run --config vitest.integration.config.ts",
    "test:contract": "vitest run integration/frontend/*.contract.test.ts"
  },
  "devDependencies": {
    "vitest": "^1.0.4",
    "@testing-library/react": "^14.1.2",
    "@testing-library/user-event": "^14.5.1",
    "msw": "^2.0.11"
  }
}
```

**Ejecución:**

```bash
# Frontend integration tests
cd Frontend
npm run test:integration

# Backend integration tests
cd Backend
./gradlew integrationTest
```

---

## Métricas de Éxito

| Métrica | Objetivo | Cómo Medir |
|---------|----------|------------|
| **Cobertura de Código** | ≥90% en código nuevo de HU-102 | JaCoCo (backend), Vitest coverage (frontend) |
| **Pass Rate** | 100% de tests pasando en CI/CD | Pipeline GitLab/GitHub Actions |
| **Tiempo de Ejecución E2E** | <5 minutos para suite completa | Reportes de Cucumber/Serenity |
| **Detección de Bugs** | 0 bugs críticos en producción post-release | Monitoreo Sentry/Logs |
| **Idempotencia del Job** | 0 duplicados de notificaciones NO_SHOW | Logs de auditoría |
| **Performance del Job** | <2 segundos para 50 reservas | Métricas de aplicación (Micrometer) |

---

## Referencias

- **Plan de Implementación:** `docs/docs_FeatureQR/planHUQR.md`
- **Plan de Testing:** `docs/docs_FeatureQR/TEST_PLAN_QR_FEATURE.md`
- **Arquitectura:** `docs/docs_FeatureQR/arquitectura_HUReservationVerfQR.md`
- **Selenium Docs:** https://www.selenium.dev/documentation/
- **Cucumber BDD:** https://cucumber.io/docs/cucumber/
- **Serenity Screenplay:** https://serenity-bdd.github.io/docs/screenplay/screenplay_fundamentals
- **Vitest:** https://vitest.dev/
- **MSW (Mock Service Worker):** https://mswjs.io/

---

**Última actualización:** Abril 2026  
**Versión:** 1.0  
**Mantenido por:** Equipo QA Reservas SK
