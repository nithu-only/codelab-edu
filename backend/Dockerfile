# Backend Dockerfile — Spring Boot + Docker CLI (for DinD via socket)
# Multi-stage build: maven build -> jre runtime with docker client

FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn package -DskipTests -B

FROM eclipse-temurin:17-jre
# Install Docker CLI so backend can invoke `docker run` via mounted socket
RUN apt-get update && \
    apt-get install -y --no-install-recommends docker.io curl && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

# Allow overriding server port / spring props via env
ENV SPRING_PROFILES_ACTIVE=default
ENV SERVER_PORT=8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
