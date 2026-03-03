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
FROM gradle:8.5-jdk21 AS backend-build

WORKDIR /backend-app
COPY community_java/ .

# 🚩 [수정] 빌드된 리액트 정적 파일들을 스프링의 static 폴더로 복사
COPY --from=frontend-build /frontend-app/build/ src/main/resources/static/

# 🚩 [수정] 권한 부여 및 bootJar 빌드
RUN chmod +x ./gradlew
RUN ./gradlew bootJar -x test --no-daemon


# -------------------------
# 3단계: 최종 실행 이미지 생성
# -------------------------
# 더 안정적인 공식 런타임 이미지로 교체
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# 🚩 [수정] 파일 매칭을 더 명확하게 하여 정확한 JAR만 복사되도록 함
COPY --from=backend-build /backend-app/build/libs/*-SNAPSHOT.jar app.jar

# 배포 환경에서 8080 포트를 사용함을 명시
EXPOSE 8080

# 메모리 설정 최적화 및 실행
ENTRYPOINT ["java", "-Xms512m", "-Xmx512m", "-jar", "app.jar"]