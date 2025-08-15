FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app

COPY gradlew .
COPY gradle gradle
COPY build.gradle settings.gradle ./
RUN chmod +x gradlew && ./gradlew dependencies --no-daemon

COPY src src
RUN ./gradlew bootJar --no-daemon -x test

# Descargar el agente de OpenTelemetry si no se tiene localmente
#ADD https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest/download/opentelemetry-javaagent.jar /otel/opentelemetry-javaagent.jar
# O si ya lo tenemos local:
ADD otel/opentelemetry-javaagent.jar /otel/opentelemetry-javaagent.jar

EXPOSE 8080
ENTRYPOINT ["java", "-javaagent:/otel/opentelemetry-javaagent.jar", "-jar", "build/libs/gestion_inventario.jar"]