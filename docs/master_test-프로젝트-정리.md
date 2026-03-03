# TravelProject — master_test 브랜치 프로젝트 정리

> 브랜치가 **master_test**일 때, 프로젝트에서 사용한 방법·대안 비교·선택 이유·발표/실무 질문을 정리한 문서입니다.  
> **발표 전에 이 문서만 정리해 두면 핵심을 놓치지 않습니다.**

---

## 📑 목차 (공부 시 이동용)

| 장 | 제목 |
|----|------|
| **0** | 프로젝트 개요 (발표 인트로용) |
| **1** | 사용한 방법 정리 |
| **2** | 대안과 비교, 선택 이유 |
| **3** | 프로젝트 발표·실무에서 나올 만한 질문 |
| **4** | 시스템 구조·주요 데이터·API |
| **5** | 로컬 실행 방법·환경 변수 |
| **6** | 발표 시 해결했던 문제(트러블슈팅) |
| **7** | 데모 시나리오 제안 |
| **8** | 한계·향후 계획 |
| **9** | 추가 예상 질문 |
| **10** | 꼭 알아둘 개념·용어 |
| **11** | 프로젝트 경험·자기 PR용 답변 |

---

### 발표 전 체크리스트 (이 문서에 모두 포함됨)

- □ 프로젝트 개요·한 줄 소개·주요 기능
- □ 기술 스택·버전
- □ 사용한 방법 (프론트/백/인증/DB/배포)
- □ 대안과 선택 이유
- □ 예상 Q&A (인증·아키텍처·기능·배포·확장)
- □ 시스템 구조·주요 테이블·API
- □ 로컬 실행·환경 변수
- □ 트러블슈팅
- □ 데모 시나리오
- □ 한계·향후 계획
- □ 꼭 알아둘 개념·용어
- □ 추가 예상 질문 (React·Spring·DB·Git·경험)
- □ 프로젝트 경험·자기 PR용 답변

---

## 0. 프로젝트 개요 (발표 인트로용)

| 항목 | 내용 |
|------|------|
| **프로젝트명** | TravelProject (TravelCommunity) |
| **한 줄 소개** | 여행 정보 공유·추천·커뮤니티 서비스. 회원제 게시판, 1:1 문의, 신고, 관리자 기능, 카카오 로그인, 다국어(일부) 지원. |
| **타겟** | 여행 정보를 찾거나 공유하려는 일반 사용자, 서비스 운영자(관리자). |
| **구성** | React SPA(프론트) + Spring Boot REST API(백엔드) + MySQL. 단일 Docker 이미지로 배포. |

### 0.1 주요 기능 목록

- **회원:** 회원가입, 로그인/로그아웃, 비밀번호 찾기·변경, 프로필(닉네임·프로필 사진)·회원탈퇴, **카카오 로그인**
- **게시판:** 여행 추천 게시판, 자유 게시판, 이벤트·뉴스레터·FAQ·공지 (목록/상세/글쓰기·수정), 댓글, 좋아요, 즐겨찾기
- **마이페이지:** 내가 쓴 글, 신고함, 1:1 문의함, 프로필 수정
- **1:1 문의:** 문의 등록, 내 문의 목록·상세, 관리자 답변 확인
- **신고:** 게시글/댓글 신고(카테고리·사유), 신고 내역 확인
- **관리자:** 1:1 문의함 답변, 신고함 처리(답변·삭제·보류·처리완료), **미답변 문의·미처리 신고 건수 알림**(헤더·관리자 페이지), 관리자 전용 마이페이지(내 글만)
- **기타:** 다국어(KR/EN/JP/CH) 일부, 지도(카카오맵) 연동, 랭킹

### 0.2 기술 스택·버전 요약

| 구분 | 기술 | 버전 |
|------|------|------|
| 프론트 | React | 19.2 |
| | react-router-dom | 7.x |
| | axios | 1.x |
| | Create React App (react-scripts) | 5.0.1 |
| 백엔드 | Spring Boot | 3.4.2 |
| | Java | 21 |
| | Spring Security, JPA, MyBatis | Boot 내장 |
| | JWT (jjwt) | 0.11.5 |
| | MySQL Connector | runtime |
| DB | MySQL | - |
| 배포 | Docker (multi-stage), GitHub Actions, EC2 | - |

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
| **CI/CD** | GitHub Actions (aws.yml) | **master_test** 브랜치 push 시 Docker 빌드·푸시 후 EC2 SSH로 배포 (기존 컨테이너 교체) |
| **CORS** | SecurityConfig에서 허용 Origin·Method·Credentials 설정 | localhost, 3.37.160.108 등 지정 도메인만 허용 |

---

## 2. 대안과 비교, 선택 이유

### 2.1 상태 관리 (Redux/Mobx vs useState + context)

- **사용한 방법**
  - 전역 라이브러리 없이 `useState` + `useCallback` + `Outlet` context + `localStorage`.
- **대안**
  - Redux, Zustand, Mobx, Jotai 등.
- **비교**
  - **현재 방식:** 구조 단순, 보일러플레이트 적음, 소규모~중규모에 적합. 상태가 App·Header·자식 라우트 정도로만 퍼져 있음.
  - **Redux 등:** 전역 상태가 많고 여러 화면에서 동시에 갱신·동기화할 때 유리. 디버깅·미들웨어(로깅, persist)에 강함.
- **선택 이유**
  - 로그인 사용자·알림 건수 등 공유 상태가 제한적이고, 팀 규모와 요구 복잡도에 맞춰 “단순함”을 우선한 것으로 해석 가능. 추후 전역 상태가 크게 늘면 Redux/Zustand 도입을 검토할 수 있음.

---

### 2.2 HTTP 클라이언트 (axios 인스턴스 vs fetch vs 전역 axios)

- **사용한 방법**
  - 기본 axios + **인증용 커스텀 인스턴스**(`api/axios.js`) — interceptor로 Bearer 부착, 401 시 refresh 후 재요청.
- **대안**
  - 모든 요청에 `axios.defaults.headers`만 설정.
  - fetch + 래퍼 함수.
  - React Query/SWR(캐시·재시도 내장).
- **비교**
  - **인스턴스 분리:** 인증 필요한 API만 `api.get/post` 사용, 공개 API는 그대로 axios 사용 가능. 401 처리·재시도 로직을 한 곳에 모을 수 있음.
  - **fetch:** 별도 라이브러리 없지만 interceptor·재시도·에러 처리 직접 구현해야 함.
  - **React Query:** 캐시·리페치·로딩 상태가 편하지만, “모든 API를 React Query로 옮기는” 리팩터가 필요.
- **선택 이유**
  - JWT + refresh 흐름을 한 인스턴스에서 처리하고, “관리자 알림 등 인증 필수 API는 반드시 이 인스턴스로 호출”하게 해 401 시 자동 갱신·재시도가 되도록 한 것. 실무에서도 “인증용 클라이언트 분리”는 흔한 패턴.

---

### 2.3 JWT 보관 (localStorage vs 메모리 vs 쿠키)

- **사용한 방법**
  - Access Token → **localStorage**, Refresh Token → **HttpOnly 쿠키**.
- **대안**
  - Access도 쿠키 (SameSite, Secure).
  - Access는 메모리만 (새로고침 시 refresh로 복구).
  - Access·Refresh 모두 HttpOnly 쿠키.
- **비교**
  - **Access in localStorage:** 구현 단순, 클라이언트에서 헤더에 쉽게 넣을 수 있음. XSS에 취약(스크립트로 토큰 탈취 가능).
  - **Access in 메모리:** XSS에 상대적으로 안전하지만 새로고침 시 사라져서 매번 refresh 필요.
  - **Refresh in HttpOnly 쿠키:** XSS로 읽을 수 없어 refresh 탈취가 어렵고, 현재 방식의 “보안 강화 포인트”에 해당.
- **선택 이유**
  - Access는 편의성(헤더 부착·재시도)을 위해 localStorage, Refresh는 보안을 위해 쿠키로 이원화. 실무에서도 “Access 단기·Refresh HttpOnly” 조합은 자주 쓰이는 방식.

---

### 2.4 DB 접근 (JPA만 vs MyBatis만 vs 병행)

- **사용한 방법**
  - **JPA(Repository) + MyBatis(DAO + XML)** 병행.
- **대안**
  - JPA만 사용하고 MyBatis 제거 / MyBatis만 사용하고 JPA 제거.
- **비교**
  - **JPA만:** 도메인 모델·트랜잭션·간단 CRUD에 유리. 복잡한 SQL·레거시 매퍼 이전 비용이 있음.
  - **MyBatis만:** SQL 제어·기존 XML 재사용에 유리. 엔티티 없이 DTO/Map 위주로 갈 수 있음.
  - **병행:** 신규/단순 도메인은 JPA, 기존 매퍼·복잡 쿼리는 MyBatis 유지. 점진적 이전 가능.
- **선택 이유**
  - 이미 Member, Like 등 MyBatis 매퍼가 있어서 한 번에 JPA로 옮기기보다는, 새 기능(문의/신고/알림 등)은 JPA로 추가하고 기존 코드는 유지한 “점진적 전환”으로 보임. 실무에서 레거시와 신규 기술 병행은 흔함.

---

### 2.5 다국어 (i18n 라이브러리 vs 수동 객체)

- **사용한 방법**
  - react-i18next 등 없이, **currentLang state + translations 객체**(예: `signup.js`, 컴포넌트 내부 객체).
- **대안**
  - react-i18next, react-intl, next-i18next(Next 사용 시) 등.
- **비교**
  - **수동 객체:** 의존성 없음, 적용 범위가 제한적(회원가입 메시지, 일부 UI 문구). 키 관리·누락 가능성은 개발자가 감수.
  - **i18n 라이브러리:** 네임스페이스·plural·날짜/숫자 포맷·지연 로딩 등 지원. 전체 앱 다국어화 시 체계적.
- **선택 이유**
  - “일부 화면/문구만 다국어” 요구에 맞춰 가벼운 방식으로 선택. 전체 페이지 다국어가 필요해지면 i18n 라이브러리 도입을 검토할 수 있음.

---

### 2.6 페이지네이션 (서버 vs 클라이언트)

- **사용한 방법**
  - **관리자/마이페이지 문의·신고·내 글:** 전체 목록 조회 후 **프론트에서 slice** (예: 3개씩, page state).
  - **일부 목록 API:** 백엔드에서 JPA **Pageable** 사용.
- **대안**
  - 모든 목록을 “페이지 단위로만” API 요청 (예: `?page=0&size=3`).
- **비교**
  - **클라이언트 페이지네이션:** 이미 가져온 데이터만 나누어 보여 주므로 추가 요청 없음. 데이터가 많아지면 첫 로딩·메모리 부담 증가.
  - **서버 페이지네이션:** 페이지마다 API 호출, 데이터 양이 커도 서버 부하는 제한적. “무한 스크롤”이나 “페이지 번호” 구현에 적합.
- **선택 이유**
  - 문의/신고/내 글 수가 수십~수백 수준이라고 가정하고, “한 번에 조회 후 3개씩 나누어 보여 주기”로 구현한 것으로 보임. 규모가 커지면 API를 페이지 단위 조회로 바꾸는 것이 좋음.

---

### 2.7 배포 (Docker + EC2 vs 서버리스 vs PaaS)

- **사용한 방법**
  - Docker 이미지 빌드 → EC2에 SSH로 배포 (GitHub Actions에서 **master_test** push 시 자동 실행).
- **대안**
  - AWS Lambda + API Gateway, Elastic Beanstalk, Heroku, Vercel(프론트) + 별도 백엔드 등.
- **비교**
  - **EC2 + Docker:** 서버 제어권이 크고, 기존 VM/인프라 지식으로 운영 가능. 스케일·모니터링은 직접 구성.
  - **서버리스/PaaS:** 운영 부담 감소, 트래픽에 따른 스케일은 편하지만, Cold start·타임아웃·벤더 종속 등 고려 필요.
- **선택 이유**
  - 단일 서버로 충분한 규모이고, “배포 스크립트 한 번 짜서 반복 실행”하는 방식으로 단순하게 가져간 것으로 해석 가능. 실무에서도 소규모 서비스는 EC2 + Docker 조합이 자주 쓰임.

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

### 3.3 React·프론트

- **리스트를 렌더할 때 key를 왜 넣나요?**  
  - React가 어떤 항목이 바뀌었는지 구분해 효율적으로 DOM을 갱신하고, state와 올바르게 매칭하려고. key는 고유·안정적인 값(예: id)이어야 함.
- **props drilling이 뭔가요? Context는 언제 쓰나요?**  
  - props를 여러 단계로 내려 보내는 것. 깊어지면 유지보수가 어려워서, 전역에 가까운 값(user, refreshAdminCounts 등)은 Context로 제공하고 하위에서 useOutletContext 등으로 사용.
- **클라이언트 라우팅과 서버 라우팅 차이는?**  
  - 클라이언트: 브라우저가 한 번 페이지를 받은 뒤, JS가 URL에 맞는 컴포넌트만 바꿔서 그려줌. 새로고침 없이 빠름. 서버: 요청마다 서버가 새 HTML을 내려줌.

---

### 3.4 기능·비즈니스

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

### 3.5 DB·성능

- **Entity와 DTO 차이는?**  
  - Entity: DB 테이블과 1:1 매핑, JPA가 관리. DTO: API 요청/응답·계층 간 데이터 전달용 객체. 응답에 Entity를 그대로 쓰면 불필요한 필드·연관 노출·순환 참조 위험이 있어, 필요한 필드만 담은 DTO(Map)로 반환하는 경우가 많음.
- **트랜잭션이 왜 필요한가요?**  
  - 여러 DB 작업을 “전부 성공” 또는 “전부 취소”로 묶기 위함. 예: 회원가입 시 member insert + 권한 insert가 하나의 트랜잭션으로 처리되어야 함.

---

### 3.6 배포·운영

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

14. **master_test 브랜치에 push하면 배포가 어떻게 되나요?**  
    - GitHub Actions 워크플로(aws.yml)가 master_test push 시 실행됨.  
    - Docker 이미지 빌드 → 레지스트리 푸시 → EC2 SSH 접속 후 기존 컨테이너 중지·제거 → 새 이미지 pull → 새 컨테이너 실행.  
    - 즉, master_test가 “배포용 메인 브랜치” 역할을 함.

---

### 3.7 협업·프로세스

- **Git에서 merge와 rebase 차이는?**  
  - merge: 두 브랜치를 합친 “merge 커밋”을 만듦. rebase: 한 브랜치의 커밋을 다른 브랜치 끝에 다시 쌓아서 히스토리를 한 줄로 만듦. 공유 브랜치에는 보통 merge 사용.
- **코드 리뷰에서 무엇을 보나요?**  
  - 로직 오류, 예외 처리, 보안(입력 검증·SQL/XSS), 네이밍·가독성, 테스트 가능 여부 등.

---

### 3.8 확장·개선

15. **목록 데이터가 매우 많아지면 어떻게 대응할 계획인가요?**  
    - 문의/신고/내 글 목록을 “페이지 단위 API”(page, size)로 바꾸고, 프론트는 “현재 페이지”만 요청.  
    - 무한 스크롤이나 “더 보기”를 넣을 수도 있음.

16. **다국어를 전체 앱으로 넓히려면?**  
    - react-i18next 등 라이브러리 도입 후, 문구를 JSON/네임스페이스로 분리하고, 현재는 `currentLang`만 i18n의 locale로 연결하면 됨.

17. **관리자 권한을 “URL만으로” 막지 않고 서버에서도 막나요?**  
    - 프론트에서는 관리자 메뉴/라우트를 숨기거나 리다이렉트할 수 있지만, 실제 보안은 백엔드에서.  
    - `/api/admin/**`는 서버에서 “JWT 검증 + mb_rol 등이 ADMIN인지” 확인해 403을 반환하도록 구현하는 것이 맞음. (현재 permitAll이면 추가로 메서드/경로별 role 체크가 필요할 수 있음.)

---

## 4. 시스템 구조·주요 데이터·API (발표 시 설명용)

### 4.1 전체 흐름

- **사용자 → React(SPA)**  
  - 브라우저가 하나의 `index.html` + JS 번들을 받고, 라우팅은 클라이언트에서 처리.
- **React → Spring Boot**  
  - 인증 필요 API: `api/axios.js` 인스턴스로 요청(Authorization: Bearer + withCredentials).  
  - 공개 API: axios 기본 또는 `REACT_APP_API_URL` 기준으로 호출.
- **Spring Boot → MySQL**  
  - JPA Repository(엔티티 기반) + MyBatis(DAO + XML) 병행.
- **인증 흐름**  
  - 로그인/카카오 → 서버가 accessToken(응답 body) + refreshToken(HttpOnly 쿠키) 발급 → 프론트는 accessToken을 localStorage에 저장 후 요청 시 헤더에 부착. 401 시 `/auth/refresh`로 재발급 후 재시도.

### 4.2 주요 테이블/엔티티

| 테이블(엔티티) | 역할 |
|----------------|------|
| **member** | 회원(mb_uid, mb_nickname, mb_rol, mb_provider 등). 로그인·권한·프로필. |
| **inquiry_box** | 1:1 문의(ib_title, ib_content, ib_reply, ib_status, ib_mb_num). |
| **report_box** | 신고(rb_name=게시판타입, rb_id=글/댓글ID, rb_content, rb_reply, rb_manage, rb_mb_num). |
| **recommend_post** | 여행 추천 게시글. (free_post, review_post, comment 등 다른 게시판·댓글 테이블도 존재.) |
| **book_mark** | 즐겨찾기. |
| **likes** | 좋아요. |

문의·신고 “작성자/대상 닉네임”은 **member**와 조인(또는 서비스에서 mb_num으로 조회)해 채움.

### 4.3 주요 API 목록 (발표 시 언급용)

- **인증:** `POST /login`, `POST /signup`, `POST /auth/refresh`, `POST /auth/logout`, `POST /auth/kakao`, `POST /auth/verify-user`, `POST /auth/reset-password`, `PUT /auth/update-nickname`, `DELETE /auth/profile-photo`, `GET /auth/profile-photo/check` 등.
- **게시판:** `GET/POST /api/recommend/posts`, `GET /api/freeboard/posts`, 댓글 `GET/POST /api/comment/...`, 좋아요·즐겨찾기 등.
- **마이페이지:** `GET /api/mypage/posts`, `GET /api/mypage/reports`, 문의 내역 등.
- **관리자:** `GET /api/admin/inquiries`, `GET /api/admin/reports`, `GET /api/admin/notification-counts`, 답변/처리 `PUT`·`PUT status` 등.
- **문의:** `POST /api/inquiry`, `GET /api/inquiry/my` 등.

---

## 5. 로컬 실행 방법·환경 변수

**백엔드**
- MySQL 실행 후 `community_java`에서 Gradle로 실행 (`./gradlew bootRun` 또는 IDE Run).
- `application.properties`에 설정: DB URL·계정, `jwt.secret`, `jwt.token-validity-in-seconds`, `jwt.refresh-token-validity-in-seconds`, 카카오용 `kakao.rest-api-key`, `kakao.redirect-uri`, `kakao.client-secret`, 파일 업로드 경로 등.

**프론트**
- `community_react`에서 `npm install` 후 `npm start`.
- **환경 변수:** `REACT_APP_API_URL`(예: `http://localhost:8080`). 없으면 빈 문자열(상대 경로)로 동작(프록시 또는 동일 호스트 가정).

**동작 확인**
- 로그인, 글 목록, 문의/신고, 관리자 알림 등이 정상인지 확인.

---

## 6. 발표 시 해결했던 문제(트러블슈팅)

**관리자 알림이 안 보이던 이유**
- 관리자 로그인 시 `notification-counts`를 **일반 axios**로 호출해 JWT가 안 붙었고, 서버가 401을 반환해 건수가 0으로 나옴.
- **해결:** 인증용 **api 인스턴스**(`api/axios.js`)로 호출해 interceptor가 Bearer를 붙이도록 수정.

**비로그인 새로고침 시 콘솔에 401**
- 앱이 “일단” `/auth/refresh`를 시도하고, 쿠키에 refresh가 없으면 401. 동작은 정상(비로그인 유지). 필요 시 “refresh 토큰 존재할 때만” 호출하도록 조건 추가 가능.

**문의/신고 “대상·작성자”를 닉네임으로 표시**
- DB에는 rbName(게시판 타입), rbId, rbMbNum 등만 있음. 서비스에서 rbName+rbId로 글/댓글 작성자 mb_num을 찾고, member에서 닉네임을 조회해 Map에 넣어 반환.

---

## 7. 데모 시나리오 제안 (발표 순서)

1. **소개** — 프로젝트 목적, 타겟, 기술 스택 요약.
2. **회원·인증** — 회원가입 → 로그인 → 로그아웃, (가능하면) 카카오 로그인, 새로고침 시 로그인 유지.
3. **게시판** — 목록·상세·글쓰기, 댓글, 좋아요/즐겨찾기.
4. **마이페이지** — 내가 쓴 글, 신고함·문의함, 프로필 수정(닉네임·사진).
5. **1:1 문의·신고** — 문의 등록, 신고(게시글/댓글) 후 마이페이지에서 확인.
6. **관리자** — 관리자 계정으로 로그인 → 헤더 알림(미처리 건수) → 관리자 페이지에서 문의 답변·신고 처리 → 알림 감소/사라짐.
7. **배포** — master_test push → CI/CD로 자동 배포되는 흐름 간단히 설명.

---

## 8. 한계·향후 계획 (발표 마무리용)

**한계**
- 목록이 많을 때 클라이언트 페이지네이션 부담, 다국어는 일부만 적용, 관리자 API에 role 검증 강화 여지.

**향후**
- 문의/신고/내 글 **서버 페이지네이션** 전환, 전체 다국어(i18n 라이브러리), 관리자 메서드별 권한 체크, 필요 시 단위/통합 테스트 보강.

---

## 9. 추가 예상 질문 (성능·테스트·보안)

18. **단위 테스트나 E2E 테스트를 하고 있나요?**  
    - React(react-scripts)에 테스트 설정은 있으나, 프로젝트에서는 제한적으로 사용. 향후 중요 API·컴포넌트에 대해 테스트를 확대할 수 있음.

19. **이미지나 정적 자산은 어떻게 서빙하나요?**  
    - 프로필 사진 등은 백엔드에서 BLOB 또는 파일 경로로 제공. 업로드 파일은 `file.upload-dir` 등 설정 경로에 저장 후 URL로 접근.

20. **CORS를 왜 특정 Origin만 허용하나요?**  
    - 쿠키(withCredentials)를 쓰고, 인증이 붙은 요청이 오므로 “우리 프론트가 뜨는 도메인”만 허용해 다른 사이트에서 API를 호출하는 것을 막기 위함.

21. **SPA란 무엇인가요? SSR과 차이는?**  
    - SPA(Single Page Application): 최초 한 번 HTML+JS 로드 후, 라우팅·데이터 변경은 클라이언트에서 JS로 처리. 우리 프로젝트가 이 방식.  
    - SSR(Server-Side Rendering): 매 요청마다 서버가 HTML을 그려서 내려줌. SEO·첫 화면 속도에 유리. Next.js 등.

22. **useEffect 의존성 배열을 비우면 언제 실행되나요?**  
    - 마운트 시 한 번만 실행. `[user]`처럼 넣으면 user가 바뀔 때마다 실행. 의존성을 생략하면 매 렌더마다 실행되므로 보통 배열을 넣음.

23. **useCallback은 왜 쓰나요?**  
    - 함수를 메모이제이션해, 의존성이 바뀌지 않으면 같은 참조를 유지. 자식에게 함수를 props로 넘길 때 불필요한 리렌더를 줄이거나, useEffect 의존성으로 넣을 때 무한 루프를 막기 위해 사용.

24. **REST API란? GET/POST/PUT/DELETE 의미는?**  
    - 자원(URI)을 HTTP 메서드로 조작하는 API 스타일. GET(조회), POST(생성), PUT(전체 수정), PATCH(일부 수정), DELETE(삭제). 우리 프로젝트는 이 규칙으로 설계.

25. **Spring에서 Controller–Service–Repository 역할은?**  
    - Controller: HTTP 요청/응답, 파라미터 검증, Service 호출.  
    - Service: 비즈니스 로직, 트랜잭션 경계, 여러 Repository/DAO 조합.  
    - Repository: DB 접근(CRUD). 계층을 나누어 유지보수·테스트가 쉬워짐.

26. **@Transactional이 뭔가요?**  
    - 메서드(또는 클래스) 단위로 트랜잭션을 시작·커밋/롤백. 예외 시 롤백. 여러 DB 작업을 “한 단위”로 묶을 때 사용. 서비스 계층에 보통 적용.

27. **JPA N+1 문제가 뭔가요?**  
    - 1번 쿼리로 목록을 가져온 뒤, 연관 엔티티를 lazy로 조회할 때마다 추가 쿼리가 N번 나가는 현상. 해결: fetch join, @EntityGraph, Batch Size 등. 우리 프로젝트에서 복잡한 연관 조회가 많다면 의식할 부분.

28. **SQL Injection을 어떻게 막나요?**  
    - PreparedStatement(?) 또는 JPA/MyBatis의 파라미터 바인딩 사용. 사용자 입력을 SQL 문자열에 직접 붙이지 않음.

29. **XSS는 무엇이고 어떻게 막나요?**  
    - 사용자가 입력한 스크립트가 그대로 실행되는 공격. 방어: 출력 시 이스케이프(React는 기본적으로 텍스트 이스케이프), CSP 헤더, `dangerouslySetInnerHTML` 사용 최소화.

30. **OAuth 2.0에서 authorization code 방식이란?**  
    - 클라이언트가 사용자를 인증 서버(카카오 등)로 보내고, 인증 후 서버가 **code**를 redirect로 넘김. 클라이언트가 그 code를 서버에 보내면 서버가 access_token을 받아 옴. code는 일회용·짧은 유효기간이라 토큰보다 안전.

31. **Docker를 쓰는 이유는?**  
    - “어디서나 같은 환경”에서 실행 가능(이미지로 OS·런타임·앱 고정). 로컬·CI·운영 서버에서 동일하게 동작하게 하고, 배포를 이미지 단위로 단순화.

32. **Git 브랜치 전략은 어떻게 가져갔나요?**  
    - master_test가 배포용 메인. 기능 개발은 개인/기능 브랜치에서 하고, 테스트 후 master_test에 merge → push 시 자동 배포. (팀에 따라 main/develop 등 이름은 다를 수 있음.)

33. **에러가 났을 때 어떻게 디버깅했나요?**  
    - 프론트: 콘솔·Network 탭, breakpoint, API 응답 확인.  
    - 백엔드: 로그, 디버거, DB 쿼리 로그.  
    - 예: 관리자 알림 401 → Network에서 요청에 Authorization 없음 확인 → api 인스턴스 사용으로 해결.

34. **배포 후 문제가 생기면 어떻게 하나요?**  
    - 로그 확인, 이전 이미지로 롤백(재배포), DB/환경 변수 점검. GitHub Actions에서 이전 커밋으로 다시 빌드·배포하는 방식으로 롤백 가능.

35. **프로젝트에서 본인이 가장 기여한 부분은?**  
    - (실제로 담당한 부분으로 답변) 예: 카카오 로그인 연동, 관리자 알림(notification-counts·헤더 패널), 문의/신고 닉네임 표시, 페이지네이션, JWT refresh 재시도 로직 등.

---

## 10. 꼭 알아둘 개념·용어 (발표·면접 대비)

### 10.1 프론트엔드(React)

| 용어 | 설명 |
|------|------|
| **SPA** | Single Page Application. 한 번 로드 후 라우팅·데이터 변경을 클라이언트에서 처리. |
| **Virtual DOM** | React가 실제 DOM 대신 메모리상 트리로 변경을 계산한 뒤, 필요한 부분만 실제 DOM에 반영. |
| **useState** | 함수형 컴포넌트에서 상태를 두고, set 함수로 변경 시 리렌더 유도. |
| **useEffect** | 부수 효과(API 호출, 구독, DOM)를 렌더 후 실행. 의존성 배열로 실행 시점 제어. |
| **useCallback** | 함수를 메모이제이션. 의존성이 바뀔 때만 새 함수 생성. |
| **Context** | 상위에서 제공한 값을 하위가 구독. props drilling을 줄일 때 사용(우리: user, refreshAdminCounts 등). |
| **Outlet** | react-router에서 중첩 라우트의 자식 경로를 렌더하는 자리. 레이아웃 + 자식 화면 구성에 사용. |
| **비동기 (async/await, Promise)** | API 호출은 응답을 기다리는 동안 다른 코드가 실행됨. await·.then()으로 응답 후 처리. axios는 Promise 기반. |
| **HTTP 상태 코드** | 200 OK, 201 Created, 400 Bad Request(잘못된 요청), 401 Unauthorized(인증 필요), 403 Forbidden(권한 없음), 404 Not Found, 500 Server Error. |

### 10.2 백엔드(Spring)

| 용어 | 설명 |
|------|------|
| **REST** | URI로 자원을 표현하고, HTTP 메서드(GET/POST/PUT/DELETE)로 조작하는 API 설계 방식. |
| **RESTful 설계** | 자원은 명사(URI), 동작은 메서드로. 예: GET /api/posts(목록), GET /api/posts/1(상세), POST /api/posts(생성). |
| **JWT** | JSON Web Token. 헤더·페이로드·서명으로 이루어진 문자열. 서버가 서명해 검증 가능. |
| **Entity vs DTO** | Entity는 DB 테이블 매핑·JPA 관리. DTO는 API·계층 간 데이터 전달용. 응답은 보통 DTO/Map으로. |
| **Filter vs Interceptor** | Filter는 서블릿 전에 동작, Interceptor는 Spring MVC 요청 전후. JWT 검증은 Filter로 구현한 경우 많음. |
| **@Transactional** | 선언적 트랜잭션. 메서드 실행을 하나의 트랜잭션으로 묶고, 예외 시 롤백. |
| **Repository** | Spring Data JPA에서 DB 접근을 인터페이스로 정의. 메서드 이름 또는 @Query로 쿼리 생성. |

### 10.3 DB

| 용어 | 설명 |
|------|------|
| **ACID** | 트랜잭션의 특성: 원자성, 일관성, 고립성, 지속성. |
| **PK / FK** | Primary Key(기본키), Foreign Key(외래키). member.mb_num, report_box.rb_mb_num 등. |
| **Index** | 검색·조건 조회 속도를 위해 컬럼에 걸어 두는 자료 구조. 과도하면 쓰기 성능 저하. |
| **N+1** | 1번 쿼리로 N개 row를 가져온 뒤, 연관 데이터를 lazy로 N번 조회하는 문제. fetch join 등으로 해결. |
| **Lazy vs Eager** | JPA에서 연관 엔티티 로딩 시점. Lazy: 접근할 때 조회. Eager: 부모 조회 시 함께 조회. 기본은 Lazy. |

### 10.4 보안·네트워크

| 용어 | 설명 |
|------|------|
| **XSS** | Cross-Site Scripting. 악성 스크립트 삽입. 방어: 출력 이스케이프, CSP. |
| **CSRF** | Cross-Site Request Forgery. 다른 사이트에서 사용자 권한으로 요청을 보내는 공격. JWT를 헤더로 보내면 쿠키 기반 CSRF와는 무관. |
| **HttpOnly 쿠키** | JS에서 읽을 수 없어 XSS로 쿠키 탈취가 어렵다. Refresh Token 저장에 사용. |
| **BCrypt** | 비밀번호 해시 알고리즘. salt 포함, 한 방향이라 복원 불가. |
| **Same-Origin Policy** | 브라우저가 “다른 출처(도메인·포트·프로토콜)”로의 요청을 제한. CORS는 서버가 “이 출처는 허용한다”고 헤더로 알려 주는 것. |

### 10.5 배포·인프라

| 용어 | 설명 |
|------|------|
| **CI/CD** | Continuous Integration / Continuous Deployment. 빌드·테스트·배포를 자동화. 우리: GitHub Actions → Docker → EC2. |
| **Docker 이미지** | 앱 + 런타임 + 설정을 담은 읽기 전용 레이어. 컨테이너는 이미지를 실행한 인스턴스. |
| **Multi-stage build** | Dockerfile에서 여러 FROM을 사용해, 빌드 단계와 실행 단계를 나누어 최종 이미지 크기를 줄임. |

---

## 11. 프로젝트 경험·자기 PR용 답변 (발표·면접)

**“가장 어려웠던 점은?”**
- 예: 관리자 알림이 401로 안 나왔을 때, “인증 필요한 API는 반드시 api 인스턴스로 호출해야 한다”는 점을 놓쳤음. Network 탭으로 요청 헤더를 확인한 뒤 interceptor가 붙는 인스턴스로 통일해 해결.

**“기술 선택을 왜 그렇게 했나?”**
- 프로젝트 규모와 팀 상황에 맞춰 “단순함”을 우선함. Redux 없이 context, JPA·MyBatis 병행으로 기존 코드를 유지하면서 새 기능을 JPA로 추가.

**“트러블슈팅 경험은?”**
- JWT refresh 후 재요청 시 동시에 여러 요청이 401을 받으면 refresh가 중복 호출될 수 있어, “refresh 중일 때는 대기 큐에 넣고 한 번만 refresh 후 일괄 재시도”하도록 구현함.

**“협업·버전 관리는?”**
- Git 브랜치로 기능 단위 개발, master_test에 merge 후 자동 배포. (실제 팀 규칙이 있으면 그에 맞게 답변.)

**“앞으로 이 프로젝트를 어떻게 발전시키고 싶나?”**
- 서버 페이지네이션 전환, 관리자 API 권한 검증 강화, 테스트 코드 보강, 다국어 확대 등으로 안정성과 확장성을 높이고 싶다.

---

이 문서는 **master_test** 브랜치 기준으로, “무엇을 어떻게 했는지”, “다른 선택지와 비교해 왜 이렇게 했는지”, “발표·면접에서 물어볼 만한 질문”을 한곳에 모은 요약입니다. CI/CD는 master_test push 시 동작하는 배포 브랜치를 전제로 작성되었으며, 발표 시 “우리 팀의 기술 선택과 트레이드오프”를 설명할 때 참고하면 됩니다.
