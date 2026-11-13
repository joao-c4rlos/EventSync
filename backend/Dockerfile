# syntax=docker/dockerfile:1

# ---------- Build ----------
FROM eclipse-temurin:25-jdk AS build
WORKDIR /workspace

# Baixa as dependências antes de copiar o código (melhor uso de cache)
COPY .mvn .mvn
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw -B -q dependency:go-offline

COPY src src
# Os testes precisam de um MySQL; rode-os fora do build da imagem
RUN ./mvnw -B -q package -DskipTests

# ---------- Runtime ----------
FROM eclipse-temurin:25-jre
WORKDIR /app

# curl é usado pelo healthcheck do docker-compose
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd --system app && useradd --system --gid app --no-create-home app
COPY --from=build /workspace/target/*.jar app.jar
USER app

ENV TZ=America/Sao_Paulo \
    JAVA_OPTS="-XX:MaxRAMPercentage=75"

EXPOSE 8080
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar /app/app.jar"]
