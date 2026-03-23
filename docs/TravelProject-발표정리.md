# TravelProject 발표 정리

메뉴 구조·라우팅·페이지 흐름, React 컴포넌트 + axios + 상태관리, 캡처 위치, 코드 요약, **왜 그렇게 했는지**를 한 파일로 정리한 문서입니다.

---

## 1. 메뉴 구조 / 라우팅 / 페이지 흐름

### 1-1. 캡처하기 좋은 위치

| 구분 | 어디서 캡처 | 설명 |
|------|-------------|------|
| **캡처 1** | 브라우저 `http://localhost:3000/` | 상단 헤더에 있는 전체 메뉴가 한 번에 보이도록 (국내여행, 해외여행, 커뮤니티, 뉴스, 고객센터, 마이페이지, 관리자페이지 등) |
| **캡처 2** | VSCode에서 `community_react/src/App.jsx` 열기 | 최상위 `<Routes>` ~ 하위 `<Route>` 정의 부분이 한 화면에 보이도록 |

### 1-2. 라우팅 코드 구조 (요약)

```
<Routes>
  <Route element={<GlobalLayout ... />}>
    <Route path="/" element={<Main />} />

    <Route path="/domestic/*" element={<CommunityContainer ... />} />
    <Route path="/foreigncountry/*" element={<CommunityContainer ... />} />
    <Route path="/community/*" element={<CommunityContainer ... />} />

    <Route path="/news/event" element={<EventBoardList ... />} />
    <Route path="/news/event/write" element={<PostWrite boardType="event" ... />} />
    <Route path="/news/event/:poNum" element={<EventBoardDetail />} />

    <Route path="/news/newsletter" element={<NewsLetterList ... />} />
    <Route path="/news/newsletter/write" element={<PostWrite boardType="newsletter" ... />} />
    <Route path="/news/newsletter/:poNum" element={<NewsLetterDetail />} />

    <Route path="/cscenter/faq" element={<FAQList ... />} />
    <Route path="/cscenter/faq/write" element={<PostWrite boardType="faq" ... />} />
    <Route path="/cscenter/faq/posts/:id" element={<FAQDetail />} />
    <Route path="/cscenter/faq/edit/:id" element={<PostWrite boardType="faq" isEdit={true} ... />} />

    <Route path="/kakao-callback" element={<KakaoCallback />} />
    <Route path="/mypage" element={<MyPage />} />
    <Route path="/admin" element={<AdminPage />} />
    <Route path="/login" element={<OpenLoginModal ... />} />
    <Route path="/signup" element={<OpenSignupModal ... />} />

    <Route path="/news/notice" element={<NoticeList ... />} />
    <Route path="/news/notice/write" element={<PostWrite boardType="notice" ... />} />
    <Route path="/news/notice/edit/:id" element={<PostWrite boardType="notice" isEdit={true} ... />} />
    <Route path="/news/notice/:poNum" element={<NoticeDetail />} />
    <Route path="/inquiry" element={<InquiryPage />} />
  </Route>
</Routes>
```

**발표 포인트**
- GlobalLayout으로 공통 레이아웃을 감싸고, 하위 Route가 각 메뉴와 1:1로 매핑됨.
- `/domestic/*`, `/community/*` 처럼 서브라우팅으로 게시판 계층 구조를 표현함.

### 1-3. 왜 그렇게 했는지 / 사용한 방법·필요한 것

| 항목 | 왜 그렇게 했는지 | 사용한 방법·필요한 것 |
|------|------------------|------------------------|
| **GlobalLayout으로 감쌈** | 헤더, 푸터, 로그인/회원가입 모달을 모든 페이지에서 공통으로 쓰기 위해. 레이아웃을 한 곳에서 관리하면 새 메뉴 추가 시 Route만 추가하면 됨. | `react-router-dom`의 Route `element`에 레이아웃 컴포넌트 지정 |
| **path에 `/*` 사용** | 그 안에서 다시 서브 경로(목록/글쓰기/상세/수정)를 쓰려고. CommunityContainer 안에 중첩 `<Routes>`로 recommend, recommend/:id 등 정의. | `path="/community/*"`, 자식 Route에서 `path="recommend"`, `path="recommend/:id"` 등 |
| **PostWrite를 boardType 하나로** | 추천/자유/이벤트/뉴스레터/공지/FAQ가 모두 제목+내용+이미지 구조라 하나의 폼으로 처리 가능. boardType만 바꿔서 같은 API를 다른 게시판에 맞게 호출. | `boardType="recommend"` | `"freeboard"` | `"event"` 등, PostWrite 내부에서 분기 |
| **필요한 것** | - | react-router-dom (Routes, Route, Outlet, useNavigate, useOutletContext) |

---

## 2. React 컴포넌트 + axios(API) + 상태관리 (MyPage 예시)

### 2-1. 캡처하기 좋은 위치

| 구분 | 어디서 캡처 | 설명 |
|------|-------------|------|
| **캡처 3** | 브라우저 `http://localhost:3000/mypage` (로그인 후) | 상단 프로필(닉네임/이메일/프로필 사진)과 하단 탭(내가 쓴 글 / 신고함 / 문의함) + 목록 + 페이지네이션이 보이도록 |
| **캡처 4** | VSCode에서 `community_react/src/pages/MyPage.jsx` 열기 | 위쪽 import / useState / useEffect / useCallback 부분이 한 화면에 나오도록 |

### 2-2. 상태 관리 구조 (요약 코드)

```javascript
function MyPage() {
  const { user, setUser, openChangePassword, onLogout } = useOutletContext() || {};
  const navigate = useNavigate();
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedBoard, setSelectedBoard] = useState("");
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [editEmailValue, setEditEmailValue] = useState("");
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [editNicknameValue, setEditNicknameValue] = useState("");
  const [bookmarks, setBookmarks] = useState([]);
  const [bottomTab, setBottomTab] = useState("posts");
  const [myReports, setMyReports] = useState([]);
  const [myInquiries, setMyInquiries] = useState([]);
  const [postsPage, setPostsPage] = useState(1);
  const [reportsPage, setReportsPage] = useState(1);
  const [inquiriesPage, setInquiriesPage] = useState(1);

  const POSTS_PER_PAGE = 3;
  const REPORTS_PER_PAGE = 3;
  const INQUIRIES_PER_PAGE = 3;
  // ...
}
```

- 여러 useState로 프로필/북마크/신고/문의/페이지네이션 상태를 분리 관리.
- `*_PER_PAGE` 상수를 3으로 두고, 한 페이지당 3개씩만 보여주도록 구현.

### 2-3. axios(api)로 "내가 쓴 글" 불러오기

```javascript
const loadMyPosts = useCallback(async () => {
  if (!user) {
    setLoading(false);
    return;
  }
  setLoading(true);
  try {
    const res = await api.get("/api/mypage/posts");
    const data = res.data;
    if (!Array.isArray(data)) {
      setMyPosts([]);
      return;
    }
    const norm = (p) => ({
      ...p,
      poNum: p.poNum ?? p.po_num,
      poTitle: p.poTitle ?? p.po_title,
      poDate: p.poDate ?? p.po_date,
    });
    const combined = data
      .map(norm)
      .sort((a, b) => new Date(b.poDate || 0) - new Date(a.poDate || 0));
    setMyPosts(combined);
  } catch (err) {
    console.error("내 글 목록 조회 실패:", err);
    setMyPosts([]);
  } finally {
    setLoading(false);
  }
}, [user]);

useEffect(() => {
  loadMyPosts();
}, [loadMyPosts]);
```

- api(axios 인스턴스)로 `/api/mypage/posts` 호출 → 응답을 정규화/정렬 후 `myPosts` 상태에 저장.
- useEffect에서 loadMyPosts를 호출해 마운트 시 자동 로딩.

### 2-4. 신고/문의 목록 불러오기 (같은 패턴)

```javascript
useEffect(() => {
  if (!user) return;
  const fetchReports = async () => {
    try {
      const res = await api.get("/api/mypage/reports");
      setMyReports(Array.isArray(res.data) ? res.data : []);
    } catch (_) {
      setMyReports([]);
    }
  };
  fetchReports();
}, [user]);

useEffect(() => {
  if (!user) return;
  const fetchInquiries = async () => {
    try {
      const res = await api.get("/api/inquiry/my");
      setMyInquiries(Array.isArray(res.data) ? res.data : []);
    } catch (_) {
      setMyInquiries([]);
    }
  };
  fetchInquiries();
}, [user]);
```

- 동일한 패턴(axios 호출 → 배열 확인 → useState 업데이트)을 재사용.
- 발표에서 "컴포넌트 하나 안에 상태관리 + API 호출 + 페이지네이션이 다 들어있는 예시"로 설명 가능.

### 2-5. 왜 그렇게 했는지 / 사용한 방법·필요한 것

| 항목 | 왜 그렇게 했는지 | 사용한 방법·필요한 것 |
|------|------------------|------------------------|
| **useState를 목록/탭마다 나눔** | 한 상태가 바뀔 때 다른 부분까지 같이 리렌더되면 복잡해지므로, 역할별로 나누면 유지보수·디버깅이 쉬움. myPosts / myReports / myInquiries를 따로 두어 각각 로딩·표시. | useState 여러 개로 분리 |
| **useCallback으로 loadMyPosts 감쌈** | 이 함수를 useEffect 의존성에 넣었기 때문에, 매 렌더마다 새 함수가 되면 useEffect가 계속 실행됨. user가 바뀔 때만 함수를 새로 만들게 해서 불필요한 재요청 방지. | useCallback(fn, [user]) |
| **useEffect에서 api.get 호출** | 페이지가 열릴 때 한 번만 서버에서 데이터를 가져오면 됨. 로그인한 user가 있을 때만 요청하도록 if (!user) return으로 비로그인 시 에러·빈 호출 방지. | useEffect(() => { fetch... }, [user]) |
| **api(axios 인스턴스) 사용** | baseURL, withCredentials(쿠키), 요청/응답 인터셉터를 한 곳에서 설정. 만료된 accessToken이면 refresh로 갱신한 뒤 재요청하는 로직을 인터셉터에 넣음. | src/api/axios.js 등에서 create + interceptors |
| **norm(p)로 필드명 통일** | 백엔드는 스네이크_case, 프론트는 카멜Case를 쓸 수 있어서 한쪽으로 통일해 두면 컴포넌트에서 다루기 쉬움. | po_num → poNum 등 매핑 |
| **페이지당 3개(POSTS_PER_PAGE=3)** | 발표/과제에서 페이지네이션 구현을 보여주기 좋고, 한 화면에 목록이 너무 길어지지 않게 하기 위해. | 상수로 정의 후 slice로 잘라서 표시 |
| **필요한 것** | - | axios, useState, useEffect, useCallback (React 훅) |

---

## 3. 백엔드 레이어 (Controller → Service → DAO/Repository)

| 항목 | 왜 그렇게 했는지 | 사용한 방법·필요한 것 |
|------|------------------|------------------------|
| **Controller만 요청/응답** | HTTP 상태코드, JSON 변환, 권한 체크를 한 곳에서 하면 Service는 순수 비즈니스 로직만 담당 가능. | @RestController, ResponseEntity, Authentication 파라미터 |
| **Service에서 Map/List 반환** | 화면에 보여줄 때 "권한·상태 라벨" 등 DB 컬럼과 다른 값으로 보여줘야 해서. Entity를 그대로 내보내지 않고 Service에서 DTO처럼 Map으로 가공해 전달. | AdminService.getAllMembers() 등에서 Map으로 가공 |
| **회원 정지/해제를 mb_rol만 사용** | 실제 서버 DB에 mb_status, mb_ban_until 컬럼이 없어서 스키마 변경 없이 구현. mb_rol에 USER, ADMIN, SUB_ADMIN 외에 BANNED_7D, BANNED_30D, BANNED_PERM 등을 넣어 "역할+정지"를 같이 표현. | AdminService.updateMemberStatus(mbNum, statusCode) → mb_rol 업데이트 |
| **SUB_ADMIN 도입** | 문의/신고 처리만 맡기고, 회원 목록·정지·권한 변경은 하지 못하게 하려고. AdminController에서 회원 관련 API는 isAdmin(auth)만, 문의/신고/알림은 isAdminOrSubAdmin(auth)로 열어둠. | isAdmin(auth), isAdminOrSubAdmin(auth) 분기 |
| **필요한 것** | - | Spring Security, JWT(access+refresh), Authentication 객체로 role 확인 |

---

## 4. 관리자 알림 (신규 문의/신고)

| 항목 | 왜 그렇게 했는지 | 사용한 방법·필요한 것 |
|------|------------------|------------------------|
| **2초마다 폴링** | WebSocket/SSE를 쓰지 않고 단순 HTTP만으로 구현. 짧은 주기(2초)로 /api/admin/notification-counts를 호출해 새 건수가 있으면 헤더에 알림 표시. | setInterval(..., 2000), fetchCounts() |
| **?t=Date.now() 붙임** | 브라우저나 프록시가 GET 응답을 캐시해서 "새 문의가 있어도 숫자가 안 바뀌는" 문제를 줄이려고. | /api/admin/notification-counts?t=Date.now() |
| **API 실패 시 setAdminNewCounts(prev=>prev)** | 네트워크 오류 등으로 한 번 실패했을 때 기존 알림 숫자를 0으로 덮어쓰지 않기 위해. | .catch(() => setAdminNewCounts(prev => prev)) |
| **필요한 것** | - | setInterval, window focus 이벤트로 탭 전환 후 다시 숫자 갱신 |

---

## 5. 로그인·인증 (JWT + 쿠키)

| 항목 | 왜 그렇게 했는지 | 사용한 방법·필요한 것 |
|------|------------------|------------------------|
| **accessToken은 메모리, refreshToken은 httpOnly 쿠키** | accessToken이 JS에서 안 보이면 XSS로 훔치기 어렵지만 매 요청에 넣기 번거로우므로, 짧은 수명의 access는 상태로 두고, 장기 수명의 refresh는 쿠키에만 두어 서버가 재발급할 때만 사용. | 프론트: useState 등에 access 보관, 쿠키는 서버에서 Set-Cookie |
| **401 시 /auth/refresh 호출** | accessToken 만료 시 자동으로 갱신 후 원래 요청을 다시 보내서 사용자가 로그아웃되지 않게 하려고. | axios 인터셉터에서 response 401 → POST /auth/refresh → 재요청 |
| **BANNED_* 회원 로그인 차단** | 정지 회원이 토큰만 있으면 API를 쓰는 것을 막으려고. MemberController에서 mb_rol 확인 후 403 + 메시지 반환. | login/refresh/kakaoAuth 시 mb_rol.startsWith("BANNED_") 체크 |
| **필요한 것** | - | JwtTokenProvider, 쿠키 설정(withCredentials), SecurityConfig에서 permitAll/authenticated 경로 구분 |

---

## 6. DB·엔티티

| 항목 | 왜 그렇게 했는지 | 사용한 방법·필요한 것 |
|------|------------------|------------------------|
| **JPA + MyBatis 동시 사용** | 단순 CRUD·연관관계는 JPA Repository로, 복잡한 조건 검색·집계는 MyBatis XML로 작성하기 위해. | @Repository (JPA), @Mapper (MyBatis) |
| **Member에 mb_status, mb_ban_until 없음** | 운영 DB에 해당 컬럼이 없어서 추가 마이그레이션 없이 mb_rol만으로 정지/기간을 표현하도록 함. | Member 엔티티에는 mb_rol만, Service에서 BANNED_* 해석 |
| **필요한 것** | - | JPA Repository, MyBatis Mapper, DDL과 엔티티 필드 일치 |
