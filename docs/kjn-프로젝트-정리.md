# TravelProject — kjn 브랜치 프로젝트 정리

> 브랜치가 **kjn**일 때, 프로젝트에서 사용한 방법·대안 비교·선택 이유·발표/실무 질문을 정리한 문서입니다.

---

## 1. 사용한 방법 정리

### 1.1 프론트엔드 (React)

| 구분 | 사용한 방법 | 설명 |
|------|-------------|------|
| **프레임워크** | React 19 + Create React App | SPA, 컴포넌트 기반 UI |
| **상태 관리** | useState / useCallback + localStorage + Outlet context | 전역 상태 라이브러리 없이 상위에서 state 내려주고, 로그인 정보는 localStorage·context로 공유 |
| **라우팅** | react-router-dom v7 (Routes, Route, Outlet, useNavigate, useLocation) | 클라이언트 사이드 라우팅, 중첩 라우트·Outlet으로 레이아웃 공유 |
| **HTTP** | axios 기본 + **api/axios.js 커스텀 인스턴스** | 인증 필요 API는 전용 인스턴스(interceptor로 Bearer 토큰 부착, 401 시 refresh 후 재시도) |
| **인증(일반)** | JWT (accessToken: localStorage, refreshToken: HttpOnly 쿠키) | Access는 클라이언트에서 헤더에 넣고, Refresh는 쿠키로만 전달해 XSS 노출 축소 |
| **인증(소셜)** | 카카오 OAuth 2.0 | redirect → `/kakao-callback?code=...` → 백엔드 `POST /auth/kakao`로 code 전달 후 JWT 발급 |
| **다국어** | i18n 라이브러리 없음, `currentLang` state + `translations/signup.js` 등 객체 | KR/EN/JP/CH 등 제한된 문구만 컴포넌트/파일별 객체로 관리 |

---

### 1.2 백엔드 (Spring Boot)

| 구분 | 사용한 방법 | 설명 |
|------|-------------|------|
| **프레임워크** | Spring Boot 3.4 + Java 21 | REST API, 의존성 주입, 자동 설정 |
| **보안** | Spring Security + JWT 필터 + BCrypt | formLogin/httpBasic 비활성화, `/auth/**` permitAll, JwtAuthenticationFilter로 Bearer 검증, 비밀번호 BCrypt 해시 |
| **DB 접근** | **JPA + MyBatis 병행** | 엔티티·CRUD·복잡한 조회는 JPA Repository, 기존 매퍼·복잡 쿼리·일부 도메인은 MyBatis (MemberDAO, LikeMapper 등) |
| **트랜잭션** | @Transactional (서비스 계층) | 여러 Repository/DAO 호출 시 서비스에서 트랜잭션 경계 |
| **API 설계** | REST, 도메인별 Controller (Member, Admin, Mypage, Recommend, Comment 등) | `/auth/**`, `/api/recommend`, `/api/admin` 등 URI로 역할 분리 |

---

### 1.3 인증·세션

| 구분 | 사용한 방법 | 설명 |
|------|-------------|------|
| **Access Token** | localStorage 저장, 요청 시 `Authorization: Bearer` | 클라이언트가 매 요청마다 헤더에 포함 (axios interceptor) |
| **Refresh Token** | HttpOnly 쿠키, withCredentials | JS에서 직접 읽지 못해 XSS로 탈취 어렵게 함 |
| **갱신 흐름** | 401 시 프론트가 `/auth/refresh` 호출 → 새 accessToken 수신 → 실패한 요청 재시도 | 동시 다중 401은 “refresh 중일 때 대기 큐”로 한 번만 refresh 호출 후 재시도 |
| **로그인 유지** | 앱 마운트 시 localStorage에 user 없으면 `/auth/refresh` 호출 | 쿠키에 refresh 있으면 access + user 복구 |

---

### 1.4 DB·데이터

| 구분 | 사용한 방법 | 설명 |
|------|-------------|------|
| **DB** | MySQL | application.properties로 URL·계정 설정, JPA ddl-auto=none으로 스키마 직접 관리 |
| **JPA** | Entity + Spring Data JpaRepository | Member, ReportBox, InquiryBox, Comment, RecommendPost 등 엔티티와 Repository로 CRUD·count 쿼리 |
| **MyBatis** | Mapper 인터페이스 + XML | 회원 조회/수정, 좋아요 등 기존 XML 매퍼 유지 |
| **페이지네이션** | 백엔드: JPA Pageable / 프론트: 배열 slice + page state | 목록은 백엔드에서 Page 처리하거나, 전체 조회 후 프론트에서 slice로 3개씩 등 표시 (관리자/마이페이지) |

---

### 1.5 배포·인프라

| 구분 | 사용한 방법 | 설명 |
|------|-------------|------|
| **빌드** | Docker multi-stage | Node로 React 빌드 → Gradle로 Spring 빌드 후 React 결과를 static에 복사 → JRE 이미지에서 bootJar 실행 |
| **CI/CD** | GitHub Actions (aws.yml) | 특정 브랜치 push 시 Docker 빌드·푸시 후 EC2 SSH로 배포 (기존 컨테이너 교체) |
| **CORS** | SecurityConfig에서 허용 Origin·Method·Credentials 설정 | localhost, 3.37.160.108 등 지정 도메인만 허용 |

---

## 2. 대안과 비교, 선택 이유

### 2.1 상태 관리 (Redux/Mobx vs useState + context)

- **사용한 방법:** 전역 라이브러리 없이 `useState` + `useCallback` + `Outlet` context + `localStorage`.
- **대안:** Redux, Zustand, Mobx, Jotai 등.
- **비교:**
  - **현재 방식:** 구조 단순, 보일러플레이트 적음, 소규모~중규모에 적합. 상태가 App·Header·자식 라우트 정도로만 퍼져 있음.
  - **Redux 등:** 전역 상태가 많고 여러 화면에서 동시에 갱신·동기화할 때 유리. 디버깅·미들웨어(로깅, persist)에 강함.
- **선택 이유:** 로그인 사용자·알림 건수 등 공유 상태가 제한적이고, 팀 규모와 요구 복잡도에 맞춰 “단순함”을 우선한 것으로 해석 가능. 추후 전역 상태가 크게 늘면 Redux/Zustand 도입을 검토할 수 있음.

---

### 2.2 HTTP 클라이언트 (axios 인스턴스 vs fetch vs 전역 axios)

- **사용한 방법:** 기본 axios + **인증용 커스텀 인스턴스**(`api/axios.js`) — interceptor로 Bearer 부착, 401 시 refresh 후 재요청.
- **대안:**  
  - 모든 요청에 `axios.defaults.headers`만 설정.  
  - fetch + 래퍼 함수.  
  - React Query/SWR(캐시·재시도 내장).
- **비교:**
  - **인스턴스 분리:** 인증 필요한 API만 `api.get/post` 사용, 공개 API는 그대로 axios 사용 가능. 401 처리·재시도 로직을 한 곳에 모을 수 있음.
  - **fetch:** 별도 라이브러리 없지만 interceptor·재시도·에러 처리 직접 구현해야 함.
  - **React Query:** 캐시·리페치·로딩 상태가 편하지만, “모든 API를 React Query로 옮기는” 리팩터가 필요.
- **선택 이유:** JWT + refresh 흐름을 한 인스턴스에서 처리하고, “관리자 알림 등 인증 필수 API는 반드시 이 인스턴스로 호출”하게 해 401 시 자동 갱신·재시도가 되도록 한 것. 실무에서도 “인증용 클라이언트 분리”는 흔한 패턴.

---

### 2.3 JWT 보관 (localStorage vs 메모리 vs 쿠키)

- **사용한 방법:** Access Token → **localStorage**, Refresh Token → **HttpOnly 쿠키**.
- **대안:**
  - Access도 쿠키 (SameSite, Secure).
  - Access는 메모리만 (새로고침 시 refresh로 복구).
  - Access·Refresh 모두 HttpOnly 쿠키.
- **비교:**
  - **Access in localStorage:** 구현 단순, 클라이언트에서 헤더에 쉽게 넣을 수 있음. XSS에 취약(스크립트로 토큰 탈취 가능).
  - **Access in 메모리:** XSS에 상대적으로 안전하지만 새로고침 시 사라져서 매번 refresh 필요.
  - **Refresh in HttpOnly 쿠키:** XSS로 읽을 수 없어 refresh 탈취가 어렵고, 현재 방식의 “보안 강화 포인트”에 해당.
- **선택 이유:** Access는 편의성(헤더 부착·재시도)을 위해 localStorage, Refresh는 보안을 위해 쿠키로 이원화. 실무에서도 “Access 단기·Refresh HttpOnly” 조합은 자주 쓰이는 방식.

---

### 2.4 DB 접근 (JPA만 vs MyBatis만 vs 병행)

- **사용한 방법:** **JPA(Repository) + MyBatis(DAO + XML)** 병행.
- **대안:** JPA만 사용하고 MyBatis 제거 / MyBatis만 사용하고 JPA 제거.
- **비교:**
  - **JPA만:** 도메인 모델·트랜잭션·간단 CRUD에 유리. 복잡한 SQL·레거시 매퍼 이전 비용이 있음.
  - **MyBatis만:** SQL 제어·기존 XML 재사용에 유리. 엔티티 없이 DTO/Map 위주로 갈 수 있음.
  - **병행:** 신규/단순 도메인은 JPA, 기존 매퍼·복잡 쿼리는 MyBatis 유지. 점진적 이전 가능.
- **선택 이유:** 이미 Member, Like 등 MyBatis 매퍼가 있어서 한 번에 JPA로 옮기기보다는, 새 기능(문의/신고/알림 등)은 JPA로 추가하고 기존 코드는 유지한 “점진적 전환”으로 보임. 실무에서 레거시와 신규 기술 병행은 흔함.

---

### 2.5 다국어 (i18n 라이브러리 vs 수동 객체)

- **사용한 방법:** react-i18next 등 없이, **currentLang state + translations 객체**(예: `signup.js`, 컴포넌트 내부 객체).
- **대안:** react-i18next, react-intl, next-i18next(Next 사용 시) 등.
- **비교:**
  - **수동 객체:** 의존성 없음, 적용 범위가 제한적(회원가입 메시지, 일부 UI 문구). 키 관리·누락 가능성은 개발자가 감수.
  - **i18n 라이브러리:** 네임스페이스·plural·날짜/숫자 포맷·지연 로딩 등 지원. 전체 앱 다국어화 시 체계적.
- **선택 이유:** “일부 화면/문구만 다국어” 요구에 맞춰 가벼운 방식으로 선택. 전체 페이지 다국어가 필요해지면 i18n 라이브러리 도입을 검토할 수 있음.

---

### 2.6 페이지네이션 (서버 vs 클라이언트)

- **사용한 방법:**  
  - **관리자/마이페이지 문의·신고·내 글:** 전체 목록 조회 후 **프론트에서 slice** (예: 3개씩, page state).  
  - **일부 목록 API:** 백엔드에서 JPA **Pageable** 사용.
- **대안:** 모든 목록을 “페이지 단위로만” API 요청 (예: `?page=0&size=3`).
- **비교:**
  - **클라이언트 페이지네이션:** 이미 가져온 데이터만 나누어 보여 주므로 추가 요청 없음. 데이터가 많아지면 첫 로딩·메모리 부담 증가.
  - **서버 페이지네이션:** 페이지마다 API 호출, 데이터 양이 커도 서버 부하는 제한적. “무한 스크롤”이나 “페이지 번호” 구현에 적합.
- **선택 이유:** 문의/신고/내 글 수가 수십~수백 수준이라고 가정하고, “한 번에 조회 후 3개씩 나누어 보여 주기”로 구현한 것으로 보임. 규모가 커지면 API를 페이지 단위 조회로 바꾸는 것이 좋음.

---

### 2.7 배포 (Docker + EC2 vs 서버리스 vs PaaS)

- **사용한 방법:** Docker 이미지 빌드 → EC2에 SSH로 배포 (GitHub Actions에서 자동화).
- **대안:** AWS Lambda + API Gateway, Elastic Beanstalk, Heroku, Vercel(프론트) + 별도 백엔드 등.
- **비교:**
  - **EC2 + Docker:** 서버 제어권이 크고, 기존 VM/인프라 지식으로 운영 가능. 스케일·모니터링은 직접 구성.
  - **서버리스/PaaS:** 운영 부담 감소, 트래픽에 따른 스케일은 편하지만, Cold start·타임아웃·벤더 종속 등 고려 필요.
- **선택 이유:** 단일 서버로 충분한 규모이고, “배포 스크립트 한 번 짜서 반복 실행”하는 방식으로 단순하게 가져간 것으로 해석 가능. 실무에서도 소규모 서비스는 EC2 + Docker 조합이 자주 쓰임.

---

## 3. 프로젝트 발표·실무에서 나올 만한 질문

### 3.1 인증·보안

1. **Access Token을 localStorage에 두는 것의 위험은 무엇인가요? Refresh Token은 왜 쿠키인가요?**  
   - Access: XSS로 스크립트가 localStorage를 읽을 수 있어 탈취 위험이 있음.  
   - Refresh: HttpOnly 쿠키는 JS로 읽을 수 없어 XSS로 탈취하기 어렵고, “재발급” 용도로만 쓰이므로 상대적으로 보안이 중요해 쿠키로 둔 것.

2. **401이 났을 때 refresh 후 재요청을 어떻게 처리했나요?**  
   - axios response interceptor에서 401이면 `/auth/refresh` 호출.  
   - 이미 refresh가 진행 중이면 새 요청은 “대기 큐”에 넣고, refresh 완료 후 새 accessToken으로 큐에 쌓인 요청을 모두 재시도.  
   - `/auth/refresh`, `/auth/logout`은 재시도 대상에서 제외해 무한 루프를 막음.

3. **CSRF를 꺼둔 이유는 무엇인가요?**  
   - JWT를 헤더로 보내고, form + 쿠키 기반 세션이 아니기 때문에 브라우저가 자동으로 쿠키를 붙이는 “사이트 간 요청” 패턴이 아님.  
   - 그래서 전통적인 CSRF(쿠키 기반 세션 탈취) 위험이 낮다고 보고 비활성화한 경우가 많음. (실제로는 팀/정책에 따라 CSRF 토큰을 쓰는 경우도 있음.)

4. **비밀번호는 어떻게 저장하나요?**  
   - BCrypt 등 단방향 해시로 저장. 평문 저장 금지, salt는 BCrypt 내부 처리.

---

### 3.2 아키텍처·설계

5. **JPA와 MyBatis를 같이 쓰는 이유는 무엇인가요?**  
   - 기존 MyBatis 매퍼(회원, 좋아요 등)를 유지하면서, 새 기능(문의, 신고, 알림 등)은 JPA로 개발해 점진적으로 전환·추가한 구조.  
   - 한 트랜잭션 안에서 JPA Repository와 MyBatis DAO를 같이 호출할 수 있음.

6. **상태 관리를 Redux 없이 한 이유는?**  
   - 공유 상태가 user, 알림 건수, 모달 열림 정도로 제한적이고, 상위 컴포넌트 + context로 충분하다고 판단.  
   - 복잡도와 보일러플레이트를 줄이기 위해 전역 라이브러리 없이 진행.

7. **API 인증이 필요한 요청은 왜 별도 axios 인스턴스를 쓰나요?**  
   - “인증이 필요한 요청만” interceptor를 타게 해서, Bearer 부착·401 시 refresh·재시도를 한 곳에서 처리하기 위함.  
   - 공개 API는 기존 axios를 그대로 쓰고, 인증 필요 API만 `api.get/post` 등을 사용하도록 구분.

---

### 3.3 기능·비즈니스

8. **카카오 로그인 흐름을 설명해 보세요.**  
   - 사용자가 카카오 로그인 → redirect 시 `code` 전달 → 프론트가 `POST /auth/kakao`에 code·redirect_uri 등 전달 → 백엔드가 카카오에 토큰/사용자 정보 요청 → 우리 DB에 회원 있으면 로그인, 없으면 회원가입 후 JWT 발급 → 프론트는 일반 로그인과 동일하게 user·accessToken 저장.

9. **관리자 알림(문의/신고 건수)은 어떻게 갱신하나요?**  
   - App에서 관리자 로그인 시 `api.get("/api/admin/notification-counts")` 호출해 state에 저장.  
   - Header에 건수를 넘겨 알림 패널에 표시.  
   - 관리자 페이지에서 답변/처리 후 `refreshAdminCounts()`를 호출해 다시 조회하고, Header 쪽 state도 Outlet context로 갱신.

10. **신고 대상/문의·신고 작성자를 “닉네임”으로 보여주려고 어떻게 했나요?**  
    - report_box에는 rbName(게시판 타입), rbId(글/댓글 ID), rbMbNum(신고자)만 있음.  
    - “대상” 닉네임: rbName+rbId로 해당 글/댓글을 찾아 작성자 mb_num을 구한 뒤, member에서 닉네임 조회.  
    - “작성자/신고자” 닉네임: ibMbNum, rbMbNum으로 member 테이블에서 닉네임 조회.  
    - 백엔드에서 Map에 nickname 필드를 넣어 주고, 프론트는 그 값을 표시.

---

### 3.4 배포·운영

11. **Docker 이미지는 어떻게 구성하나요?**  
    - Multi-stage: (1) Node로 React 빌드 (2) Gradle로 Spring 빌드하면서 React 빌드 결과를 static에 복사 (3) JRE 이미지에서 jar만 실행.  
    - 한 이미지에 프론트 정적 파일 + 백엔드가 같이 들어가서, 단일 컨테이너로 서비스 가능.

12. **새로고침 시 로그인 안 된 것처럼 보이다가 다시 로그인되는 이유는?**  
    - 초기 렌더 시 localStorage에 user가 없으면 `POST /auth/refresh`를 호출.  
    - refresh 토큰(쿠키)이 유효하면 서버가 새 accessToken + member 정보를 내려주고, 그걸로 localStorage와 state를 채움.  
    - 그 전까지는 user가 null이라 “비로그인” UI가 잠깐 보였다가, refresh 성공 후 “로그인” UI로 바뀜.

13. **로그인 안 된 상태에서 refresh 401이 콘솔에 나오는 이유는?**  
    - 앱이 “일단 refresh 시도”를 하기 때문. 쿠키에 refresh가 없거나 만료되면 서버가 401을 주고, 그게 콘솔에 찍힘.  
    - 동작상으로는 정상(비로그인 유지). 콘솔을 깔끔히 하려면 “refresh 토큰이 있을 때만” refresh를 호출하는 식으로 조건을 줄 수 있음.

---

### 3.5 확장·개선

14. **목록 데이터가 매우 많아지면 어떻게 대응할 계획인가요?**  
    - 문의/신고/내 글 목록을 “페이지 단위 API”(page, size)로 바꾸고, 프론트는 “현재 페이지”만 요청.  
    - 무한 스크롤이나 “더 보기”를 넣을 수도 있음.

15. **다국어를 전체 앱으로 넓히려면?**  
    - react-i18next 등 라이브러리 도입 후, 문구를 JSON/네임스페이스로 분리하고, 현재는 `currentLang`만 i18n의 locale로 연결하면 됨.

16. **관리자 권한을 “URL만으로” 막지 않고 서버에서도 막나요?**  
    - 프론트에서는 관리자 메뉴/라우트를 숨기거나 리다이렉트할 수 있지만, 실제 보안은 백엔드에서.  
    - `/api/admin/**`는 서버에서 “JWT 검증 + mb_rol 등이 ADMIN인지” 확인해 403을 반환하도록 구현하는 것이 맞음. (현재 permitAll이면 추가로 메서드/경로별 role 체크가 필요할 수 있음.)

---

이 문서는 **kjn** 브랜치 기준으로, “무엇을 어떻게 했는지”, “다른 선택지와 비교해 왜 이렇게 했는지”, “발표·면접에서 물어볼 만한 질문”을 한곳에 모은 요약입니다. 발표 시 “우리 팀의 기술 선택과 트레이드오프”를 설명할 때 참고하면 됩니다.

---

## 4. kjn에서 반영된 “요청사항” 주석 정리 (기능별 설명)

| 요청사항 | 구현/변경 내용 | 주석(왜 필요한가) |
|---|---|---|
| 마이페이지/관리자페이지 페이지네이션 | `MyPage`(내 글/신고함/문의함)와 `AdminPage`(문의함/신고함)에 페이지네이션 추가, 기본 “한 페이지당 3개”로 통일 | 발표에서 “리스트 처리”와 “한 번에 보여주는 범위 제어”를 보여주기 좋고, 화면 길이가 과도해지는 문제를 방지 |
| “신고대상/작성자/신고자” 닉네임 표시 | `AdminPage`와 `MyPage`에서 닉네임이 보이도록(기존 ID·표현식 → 닉네임) 백엔드에서 닉네임을 조회/가공해 전달 | 사용자가 사람이 읽는 정보(닉네임)를 즉시 이해하도록 UI 품질 개선 |
| 관리자페이지에서 문의함/신고함 디자인 통일 | `AdminPage` 내 문의함/신고함 레이아웃을 동일하게 맞춤 | 운영자가 처리할 때 “같은 패턴으로 작업”할 수 있어 실수/학습 비용 감소 |
| SUB_ADMIN 권한 분리 | `SUB_ADMIN`은 관리자 전체 기능 중 “회원 관리/회원 상태/역할 수정” 제외, 문의함/신고함만 노출 | 권한 원칙을 명확히 해서 보안·운영 리스크(권한 남용) 감소 |
| 관리자 알림 실시간처럼 보이게 | App/헤더에서 `notification-counts`를 짧은 주기(2초)로 갱신하고, 캐시 방지를 위해 쿼리스트링/헤더 사용, API 실패 시 0으로 덮지 않게 방어 | “새 문의/신고가 들어오면 바로 뜨는 UX”를 만들기 위해 WebSocket 대신 단순 폴링으로 구현 |
| “Refresh 401 / pic 404” 콘솔 정리 | 비로그인 상태 refresh 401의 의미(정상 동작일 수 있음)와 이미지 404가 생기는 이유를 설명/대응 | 발표에서 콘솔 에러를 “버그처럼 보이지 않게” 설명할 수 있도록 문서화 |
| favicon/로고 경로 문제 해결 | `Favicon.png`를 CRA public 경로로 배치되게 하고, 로고/파비콘 경로를 `PUBLIC_URL` 기준으로 안정화 | 배포/로컬 환경에서 자산 경로가 달라지는 문제를 해결 |
| 회원관리(정지/해제) UI를 드롭다운으로 변경 | 회원관리의 상태 변경 UI를 버튼 묶음 대신 `select`(드롭다운)으로 변경하고, “정상” 기본값/표시 규칙을 정리 | “한 화면에서 선택만 하면 변경”하는 UX로 일관성 확보 |
| 정지 상태는 mb_status/mb_ban_until 대신 mb_rol 기반 | DB 스키마 불일치 이슈로 인해 mb_ban_until 등을 직접 쓰지 않고 `mb_rol`의 코드(BANNED_* )로 상태를 파생 | 서버 DB에 컬럼이 없어서 스키마 변경 없이 동작하도록 우회한 안정화 방식 |
| “회원 관리”는 ADMIN 전용으로 가드 | 프론트에서 SUB_ADMIN이면 `/api/admin/members` 호출 자체를 스킵하고, UI도 숨김 | 403/에러 로그를 줄이고, 권한 없는 접근을 근본적으로 차단 |
| 백엔드 인증/정지회원 처리 강화 | 로그인/refresh 및 토큰 기반 인증 흐름에서 BANNED_* 사용자를 차단하도록 방어 | 토큰이 있어도 정지 회원이 기능을 수행하지 못하게 하는 정책 적용 |

