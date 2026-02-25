# -------------------------
# 1단계: React 빌드 (프론트엔드)
# -------------------------
FROM node:18 AS frontend-build

WORKDIR /frontend-app
# community_react 폴더 안의 설정파일 복사
COPY community_react/package*.json ./
RUN npm install

# community_react 폴더의 모든 소스 복사 후 빌드
COPY community_react/ ./
RUN npm run build


# -------------------------
# 2단계: Spring 빌드 (백엔드)
# -------------------------
FROM gradle:8-jdk21 AS backend-build

WORKDIR /backend-app
# community_java 폴더의 모든 소스(gradle 포함)를 복사
COPY community_java/ .

# [중요] 1단계에서 빌드된 React 결과물을 Spring의 static 폴더로 복사
COPY --from=frontend-build /frontend-app/build ./src/main/resources/static

# 빌드 실행 (테스트 제외)
RUN chmod +x gradlew
RUN ./gradlew build -x test --no-daemon


# -------------------------
# 3단계: 최종 실행 이미지 생성
# -------------------------
FROM openjdk:21-ea-jdk-slim
WORKDIR /app

# 2단계에서 만들어진 jar 파일을 복사
COPY --from=backend-build /backend-app/build/libs/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-Xmx512m", "-jar", "app.jar"]