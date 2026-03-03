FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app
COPY pom.xml ./
COPY src ./src
RUN mvn -q -DskipTests package

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/expense-backend-1.0.0.jar ./expense-backend.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/expense-backend.jar"]
