FROM gradle:8.14.4-jdk17-alpine AS builder
WORKDIR /app

COPY build.gradle settings.gradle gradlew gradlew.bat ./
COPY gradle ./gradle
COPY src ./src

RUN chmod +x ./gradlew && ./gradlew clean bootJar --no-daemon

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /app/build/libs/*.jar app.jar

EXPOSE 3004
ENTRYPOINT ["java", "-jar", "/app/app.jar"]






