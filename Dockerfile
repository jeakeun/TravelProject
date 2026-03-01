# -------------------------
# 1단계: React 빌드 (프론트엔드)
# -------------------------
FROM node:20 AS frontend-build

WORKDIR /frontend-app
COPY community_react/package*.json ./
RUN npm install

COPY community_react/ ./
RUN npm run build


# -------------------------
# 2단계: Spring 빌드 (백엔드)
# -------------------------
FROM gradle:9.3-jdk21 AS backend-build

WORKDIR /backend-app
COPY community_java/ .

# 🚩 [수정] build 폴더 내의 '내용물'이 static 폴더로 복사되도록 경로 끝에 /를 명시합니다.
COPY --from=frontend-build /frontend-app/build/ ./src/main/resources/static/

# 🚩 [수정] 실행 가능한 Jar 생성을 위해 bootJar 명령을 사용합니다.
RUN gradle bootJar -x test --no-daemon


# -------------------------
# 3단계: 최종 실행 이미지 생성
# -------------------------
FROM openjdk:21-ea-jdk-slim
WORKDIR /app

COPY --from=backend-build /backend-app/build/libs/*[!plain].jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-Xmx512m", "-jar", "app.jar"]