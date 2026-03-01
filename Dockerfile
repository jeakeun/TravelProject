# -------------------------
# 1단계: React 빌드 (프론트엔드)
# 🚩 Node 20을 사용하여 react-router@7 등의 라이브러리 호환성 경고를 해결합니다.
# -------------------------
FROM node:20 AS frontend-build

WORKDIR /frontend-app
# community_react 폴더 안의 설정파일 복사
COPY community_react/package*.json ./
RUN npm install

# community_react 폴더의 모든 소스 복사 후 빌드
COPY community_react/ ./
RUN npm run build


# -------------------------
# 2단계: Spring 빌드 (백엔드)
# 🚩 프로젝트의 Gradle 래퍼 버전(9.3.0)과 일치하는 이미지를 사용하여 
# 빌드 중 Gradle을 새로 다운로드하다 발생하는 TIMEOUT 에러를 방지합니다.
# -------------------------
FROM gradle:9.3-jdk21 AS backend-build

WORKDIR /backend-app
# community_java 폴더의 모든 소스(gradle 포함)를 복사
COPY community_java/ .

# [중요] 1단계에서 빌드된 React 결과물을 Spring의 static 폴더로 복사
COPY --from=frontend-build /frontend-app/build ./src/main/resources/static

# 🚩 [핵심 수정] gradlew 대신 이미지에 이미 설치된 gradle 명령어를 직접 사용하여 
# 외부 네트워크 연결(Gradle 다운로드) 없이 즉시 빌드합니다.
RUN gradle build -x test --no-daemon


# -------------------------
# 3단계: 최종 실행 이미지 생성
# -------------------------
FROM openjdk:21-ea-jdk-slim
WORKDIR /app

# 2단계에서 만들어진 jar 파일을 복사
# 🚩 plain.jar가 생성될 경우를 대비해 실행 가능한 jar만 app.jar로 복사합니다.
COPY --from=backend-build /backend-app/build/libs/*[!plain].jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-Xmx512m", "-jar", "app.jar"]