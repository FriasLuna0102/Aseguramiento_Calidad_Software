FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app

COPY gradlew .
COPY gradle gradle
COPY build.gradle settings.gradle ./
RUN chmod +x gradlew && ./gradlew dependencies --no-daemon

COPY src src
RUN ./gradlew bootJar --no-daemon -x test

EXPOSE 8080
ENTRYPOINT ["java","-jar","build/libs/gestion_inventario-0.0.1-SNAPSHOT.jar"]
