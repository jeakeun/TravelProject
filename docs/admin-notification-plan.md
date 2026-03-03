# 관리자 알림 (1:1 문의·신고 접수) 계획

## 목표
- 1:1 문의 또는 신고가 접수되면 **관리자 로그인 시** 오른쪽 상단 관리자 닉네임 **밑에** 알림 문구 표시: `문의(신고)가 접수되었습니다.`
- **관리자 페이지** 상단에 미처리 건수 상태 표시 (예: 미답변 문의 N건, 미처리 신고 M건)
- 관리자가 문의 답변 또는 신고 처리 시 **상태가 갱신**되도록 (헤더 알림·관리자 페이지 상태 모두 반영)

---

## 1. 백엔드: 미처리 건수 API

### 1-1. Repository
- **InquiryRepository**
  - `long countByIbStatus(String ibStatus)`  
    - `ib_status = 'N'` 인 건수 → 미답변 문의
- **ReportRepository**
  - 미처리 신고 건수: `rb_manage` 가 `NULL` 이거나 `'Y'` 가 아닌 경우
  - `@Query("SELECT COUNT(r) FROM ReportBox r WHERE r.rbManage IS NULL OR r.rbManage <> 'Y'")`  
    `long countNewReports();`  
    또는 메서드명으로 derived query 가능하면 사용

### 1-2. AdminService
- `Map<String, Long> getNewCounts()`  
  - `newInquiries` = `inquiryRepository.countByIbStatus("N")`  
  - `newReports` = `reportRepository.countNewReports()`  
  - 반환: `{ "newInquiries": Long, "newReports": Long }`

### 1-3. AdminController
- `GET /api/admin/notification-counts`  
  - 관리자만 허용 (기존 `isAdmin(auth)` 사용)  
  - `adminService.getNewCounts()` 결과 그대로 JSON 반환  
  - 401/403 처리 기존과 동일

---

## 2. 프론트: 헤더 알림 (닉네임 밑)

### 2-1. App.jsx
- **상태**: `adminNewCounts = { newInquiries: 0, newReports: 0 }`
- **조회**: `user` 가 있고 `isAdmin(user)` 일 때  
  `GET /api/admin/notification-counts` 호출 후 `setAdminNewCounts(res.data)`  
  - 의존성: `[user]` (로그인/로그아웃 시 자동 갱신)
- **갱신 트리거**: 관리자 페이지에서 문의/신고 처리 후 헤더 숫자도 바뀌어야 하므로  
  - `refreshAdminCounts` 콜백 정의: 위와 동일하게 notification-counts 재호출 후 `setAdminNewCounts`  
  - `GlobalLayout` → `Outlet` context 에 `refreshAdminCounts` 전달 (관리자 페이지에서 호출용)
- **GlobalLayout**: `Header` 에 `adminNewCounts` props 로 전달

### 2-2. Header.jsx
- **props**: `adminNewCounts` (기본값 `{}`)
- **표시 조건**: `isAdmin(user)` 이고  
  `(adminNewCounts.newInquiries > 0 || adminNewCounts.newReports > 0)`
- **표시 위치**: 관리자 닉네임 **밑** (기존 닉네임+드롭다운 구조 유지)
  - 닉네임과 같은 블록 안에 `user-name-and-alert` 래퍼 사용
  - 그 안에 닉네임 텍스트 + 알림 문구 한 줄
- **문구**: `문의(신고)가 접수되었습니다.`  
  - 둘 다 0이 아닐 때만 한 문장으로 표시 (문의만 있으면 문의, 신고만 있으면 신고 등 세분화 가능하나 요구사항상 한 문장으로 통일)
- **스타일**: 기존 Main.css 의 `.admin-alert-msg` 활용 (노란색 등 눈에 띄는 스타일)

---

## 3. 프론트: 관리자 페이지 상태 표시

### 3-1. AdminPage.jsx
- **상태**: `newCounts = { newInquiries: 0, newReports: 0 }`  
  - 페이지 전용 (헤더와 동일한 API로 채움)
- **초기 로딩**: 관리자 페이지 마운트 시  
  `GET /api/admin/notification-counts` 호출 → `setNewCounts(res.data)`
- **표시 위치**: 탭 위 또는 탭과 섹션 제목 사이  
  - 예: `미답변 문의 {newCounts.newInquiries}건, 미처리 신고 {newCounts.newReports}건`
  - 0건이어도 표시해도 됨 (0건이면 “미답변 문의 0건, 미처리 신고 0건”)
- **처리 후 갱신**
  - `saveInquiryReply` 성공 시:  
    - `GET /api/admin/notification-counts` 재호출 후 `setNewCounts`  
    - **그리고** `refreshAdminCounts?.()` 호출 (Outlet context 로 전달받음) → 헤더 알림 문구/숫자 갱신
  - `saveReportReply` 성공 시: 동일 (재호출 + `refreshAdminCounts?.()`)
  - `handleReportProcess` 성공 시: 동일

### 3-2. App.jsx – Outlet context
- `Outlet` context 에 `refreshAdminCounts` 추가  
  - 관리자 페이지에서 문의 답변/신고 처리 후 호출하면, App 에서 notification-counts 를 다시 불러와 `adminNewCounts` 를 갱신하고, Header 가 다시 렌더되면서 “문의(신고)가 접수되었습니다.” 표시 여부가 바뀜.

---

## 4. 처리 시 상태 반영 요약

| 동작 | AdminPage 상태 | 헤더 알림 |
|------|----------------|-----------|
| 문의 답변 저장 | notification-counts 재호출 → newCounts 갱신 | refreshAdminCounts() → adminNewCounts 갱신 |
| 신고 답변 저장 | 동일 | 동일 |
| 신고 처리(처리완료/삭제/보류) | 동일 | 동일 |

- “처리가 되면 상태가 바뀌는 것” =  
  - 관리자 페이지 상단의 미답변/미처리 건수 감소  
  - 헤더의 “문의(신고)가 접수되었습니다.” 표시 여부/유지 여부 갱신  
  둘 다 위 API 한 번씩 재호출로 일관되게 반영.

---

## 5. 구현 순서 제안

1. **백엔드**  
   InquiryRepository / ReportRepository 에 count 메서드 추가 → AdminService.getNewCounts() → AdminController GET /api/admin/notification-counts
2. **App + Header**  
   App 에 adminNewCounts·refreshAdminCounts 추가, GlobalLayout/Header 에 adminNewCounts 전달, Header 에 닉네임 밑 알림 문구·스타일 적용
3. **AdminPage**  
   newCounts 상태·초기 fetch, 상단에 “미답변 문의 N건, 미처리 신고 M건” 표시, saveInquiryReply / saveReportReply / handleReportProcess 성공 시 notification-counts 재호출 + refreshAdminCounts() 호출
4. **테스트**  
   - 관리자 로그인 → 문의/신고 없을 때 알림 없음, 있을 때 “문의(신고)가 접수되었습니다.” 표시  
   - 관리자 페이지에서 숫자 확인 후 답변/처리 → 숫자 감소 및 헤더 알림 사라짐(0건일 때)

---

## 6. 참고 (기존 구조)

- 문의: `ib_status` = 'N' 미답변, 'Y' 답변완료  
- 신고: `rb_manage` = 'Y' 처리완료, 그 외(null 포함) 미처리  
- AdminPage 는 이미 `PUT .../inquiries/{id}/reply`, `PUT .../reports/{id}/reply`, `PUT .../reports/{id}/process` 로 처리하고 있음.
