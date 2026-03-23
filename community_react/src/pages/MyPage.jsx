import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { getUserId, getNickname, isAdmin } from "../utils/user";
import ProfileImage from "../components/ProfileImage";
import { getRecentViews } from "../utils/recentViews";
import api from "../api/axios";
import "./MyPage.css";

const BOARD_OPTIONS = [
  { value: "", label: "전체" },
  { value: "recommend", label: "여행 추천" },
  { value: "reviewboard", label: "여행 후기" },
  { value: "freeboard", label: "자유 게시판" },
];

function MyPage() {
  const { user, setUser, openChangePassword, onLogout } = useOutletContext() || {};
  const navigate = useNavigate();
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedBoard, setSelectedBoard] = useState("");
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [editEmailValue, setEditEmailValue] = useState("");
  const [emailSaving, setEmailSaving] = useState(false);
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [editNicknameValue, setEditNicknameValue] = useState("");
  const [nicknameSaving, setNicknameSaving] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawPassword, setWithdrawPassword] = useState("");
  const [withdrawSubmitting, setWithdrawSubmitting] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
  const [bottomTab, setBottomTab] = useState("posts");
  const [photoSaving, setPhotoSaving] = useState(false);
  const [photoDeleting, setPhotoDeleting] = useState(false);
  const [hasProfilePhoto, setHasProfilePhoto] = useState(false);
  const [photoVersion, setPhotoVersion] = useState(0);
  const photoInputRef = useRef(null);
  const [myReports, setMyReports] = useState([]);
  const [myInquiries, setMyInquiries] = useState([]);
  const [detailModal, setDetailModal] = useState(null);
  const [postsPage, setPostsPage] = useState(1);
  const [reportsPage, setReportsPage] = useState(1);
  const [inquiriesPage, setInquiriesPage] = useState(1);

  const POSTS_PER_PAGE = 3;
  const REPORTS_PER_PAGE = 3;
  const INQUIRIES_PER_PAGE = 3;

  /**
   * 내가 쓴 글 로딩 (마이페이지)
   * - 인증된 user 기준으로 백엔드가 `/api/mypage/posts`에서
   *   추천/후기/자유 게시판의 “내 글만” 합쳐서 반환
   * - 프론트에서는 응답 필드명을 po_num/poNum 등을 맞추고
   *   날짜 기준으로 정렬한 뒤 myPosts 상태에 저장
   */
  const loadMyPosts = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // 백엔드 전용 API: JWT로 회원 번호 확인 후 DB에서 내가 쓴 글만 조회
      const res = await api.get("/api/mypage/posts");
      const data = res.data;
      if (!Array.isArray(data)) {
        setMyPosts([]);
        return;
      }
      const toNum = (v) => (v != null && v !== "" ? Number(v) : null);
      const norm = (p) => ({
        ...p,
        poNum: p.poNum ?? p.po_num,
        poTitle: p.poTitle ?? p.po_title,
        poDate: p.poDate ?? p.po_date,
        poMbNum: toNum(p.poMbNum ?? p.po_mb_num),
      });
      const combined = data.map(norm).sort((a, b) => new Date(b.poDate || 0) - new Date(a.poDate || 0));
      setMyPosts(combined);
    } catch (err) {
      console.error("내 글 목록 조회 실패:", err);
      setMyPosts([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * myPosts 로딩 트리거
   * - user가 준비된 이후(로그인 이후)에 1회 로딩
   */
  useEffect(() => {
    loadMyPosts();
  }, [loadMyPosts]);

  /**
   * 북마크 미리보기 로딩
   * - `/api/mypage/bookmarks`는 백엔드에서 상위 일부만 내려주므로
   *   프론트에서는 추가로 slice(상단 몇 개만 표시)
   */
  useEffect(() => {
    if (!user) {
      setBookmarks([]);
      return;
    }
    setBookmarks([]);
    const fetchBookmarks = async () => {
      try {
        const res = await api.get("/api/mypage/bookmarks");
        setBookmarks(Array.isArray(res.data) ? res.data.slice(0, 5) : []);
      } catch (_) {
        setBookmarks([]);
      }
    };
    fetchBookmarks();
  }, [user?.mb_num ?? user?.mbNum]);

  /**
   * 내가 받은/남긴 신고 내역 로딩
   * - `/api/mypage/reports`에서 신고 목록 + 대상 닉네임 등을 함께 내려줌
   * - 실패 시 빈 배열로 안전하게 처리
   */
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

  /**
   * 내가 작성한 1:1 문의 로딩
   * - `/api/inquiry/my`는 로그인 사용자의 문의 목록을 내려줌
   * - 마이페이지에서 “문의함” 탭 데이터로 사용
   */
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

  /**
   * 프로필 사진 존재 여부 확인 (삭제 버튼 표시용)
   * - `/auth/profile-photo/check`에서 hasPhoto를 받아 UI 분기
   */
  useEffect(() => {
    if (!user) {
      setHasProfilePhoto(false);
      return;
    }
    api.get("/auth/profile-photo/check")
      .then((res) => setHasProfilePhoto(Boolean(res.data?.hasPhoto)))
      .catch(() => setHasProfilePhoto(false));
  }, [user]);

  useEffect(() => {
    if (!user) {
      alert("로그인이 필요한 서비스입니다.");
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const goToPost = (post) => {
    navigate(`/community/${post.boardType}/${post.poNum || post.id}`);
  };

  const recentViews = getRecentViews(5, user?.mb_num ?? user?.mbNum);
  const handleRemoveBookmark = async (e, bmNum) => {
    e.stopPropagation();
    e.preventDefault();
    if (!bmNum) return;
    try {
      const res = await api.delete(`/api/mypage/bookmarks/${bmNum}`);
      if (res.status === 200) {
        setBookmarks((prev) => prev.filter((b) => b.bmNum !== bmNum));
        alert("즐겨찾기에서 삭제되었습니다.");
      }
    } catch (err) {
      const data = err?.response?.data;
      const msg = typeof data === "string" ? data : (data?.error ?? data?.message ?? "삭제에 실패했습니다.");
      alert(msg);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const d = new Date(dateString);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };
  const getReportStatusLabel = (r) => {
    // 관리자 답변이 있으면 처리완료
    if (r?.rbReply && String(r.rbReply).trim()) return "처리완료";

    // rbManage가 "대기"를 의미하는 값만 대기로 표시
    // 지금 코드 기준으로 "Y/D/H"가 아니면 대기 처리였음
    const m = String(r?.rbManage ?? "").toUpperCase();
    if (m === "Y" || m === "D" || m === "H") return "처리완료";

    return "대기";
  };
  const isReportUnseen = (r) =>
    r.rbReply &&
    String(r.rbReply).trim() &&
    !/^[Yy]$/.test(r.rbSeen ?? "");
  const isInquiryUnseen = (q) =>
    ((q.ibReply && String(q.ibReply).trim()) || q.ibStatus === "Y") &&
    !/^[Yy]$/.test(q.ibSeen ?? "");

  const openReportDetail = async (r) => {
    /**
     * 신고 상세 열기 + seen 처리
     * - 상세 모달을 열고,
     * - rbReply가 존재하지만 아직 seen이 아니면 `/api/mypage/reports/{rbNum}/seen` 호출
     * - 성공 시 myReports 상태에서 rbSeen을 "Y"로 갱신
     */
    setDetailModal({ type: "report", data: r });
    if (isReportUnseen(r)) {
      try {
        await api.put(`/api/mypage/reports/${r.rbNum}/seen`);
        setMyReports((prev) =>
          prev.map((x) => (x.rbNum === r.rbNum ? { ...x, rbSeen: "Y" } : x))
        );
      } catch (_) {
        const res = await api.get("/api/mypage/reports");
        setMyReports(Array.isArray(res.data) ? res.data : []);
      }
    }
  };

  const openInquiryDetail = async (q) => {
    /**
     * 문의 상세 열기 + seen 처리
     * - 상세 모달을 열고,
     * - ibReply/ibStatus 조건이 충족되는데 seen이 아니면 `/api/inquiry/my/{ibNum}/seen` 호출
     * - 성공 시 myInquiries 상태에서 ibSeen을 "Y"로 갱신
     */
    setDetailModal({ type: "inquiry", data: q });
    if (isInquiryUnseen(q)) {
      try {
        await api.put(`/api/inquiry/my/${q.ibNum}/seen`);
        setMyInquiries((prev) =>
          prev.map((x) => (x.ibNum === q.ibNum ? { ...x, ibSeen: "Y" } : x))
        );
      } catch (_) {
        const res = await api.get("/api/inquiry/my");
        setMyInquiries(Array.isArray(res.data) ? res.data : []);
      }
    }
  };

  const startEditEmail = () => {
    setEditEmailValue(user?.mb_email ?? user?.mb_Email ?? "");
    setIsEditingEmail(true);
  };

  const cancelEditEmail = () => {
    setIsEditingEmail(false);
    setEditEmailValue("");
  };

  /**
   * 회원 탈퇴 로직
   * - 로컬 가입(local) 사용자는 비밀번호 확인이 필요
   * - 카카오 가입(kakao) 사용자는 비밀번호 없이 탈퇴가 가능하도록 서버에서 처리
   * - 프론트는 /auth/withdraw 호출 후 성공 시 onLogout + 메인 이동
   */
  const handleWithdraw = async () => {
    const pw = (withdrawPassword || "").trim();
    if (!isKakaoUser && !pw) {
      alert("비밀번호를 입력하세요.");
      return;
    }
    setWithdrawSubmitting(true);
    try {
      const res = await api.post("/auth/withdraw", { password: pw || "" });
      if (res.status === 200) {
        setShowWithdrawModal(false);
        setWithdrawPassword("");
        onLogout?.();
        navigate("/", { replace: true });
        alert("회원 탈퇴되었습니다.");
      }
    } catch (err) {
      const msg = err.response?.data ?? "탈퇴에 실패했습니다.";
      alert(typeof msg === "string" ? msg : "비밀번호가 일치하지 않거나 탈퇴에 실패했습니다.");
    } finally {
      setWithdrawSubmitting(false);
    }
  };

  const startEditNickname = () => {
    setEditNicknameValue(getNickname(user));
    setIsEditingNickname(true);
  };

  const cancelEditNickname = () => {
    setIsEditingNickname(false);
    setEditNicknameValue("");
  };


  /**
   * 프로필 사진 변경 버튼 클릭 시 숨겨진 file input을 강제 오픈
   */
  const handlePhotoChangeClick = () => {
    photoInputRef.current?.click();
  };

  /**
   * 프로필 사진 업로드
   * - 유효한 이미지 타입 검증(jpeg/jpg/png/gif/webp)
   * - POST `/auth/update-photo`로 BLOB 업로드
   * - 응답의 mb_photo_ver로 local user state를 갱신(캐시 무효화/버전 관리)
   */
  const handlePhotoFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !user) return;
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      alert("이미지 파일만 업로드 가능합니다. (jpg, png, gif, webp)");
      return;
    }
    setPhotoSaving(true);
    try {
      const formData = new FormData();
      formData.append("photo", file);
      const res = await api.post("/auth/update-photo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const mbPhotoVer = res.data?.mb_photo_ver ?? res.data?.mbPhotoVer;
      if (mbPhotoVer != null) {
        const updated = { ...user, mb_photo_ver: mbPhotoVer, mbPhotoVer: mbPhotoVer };
        setUser?.(updated);
        setHasProfilePhoto(true);
        try {
          localStorage.setItem("user", JSON.stringify(updated));
        } catch (_) {}
        alert("프로필 사진이 변경되었습니다.");
      }
    } catch (err) {
      const msg = err?.response?.data ?? "프로필 사진 변경에 실패했습니다.";
      alert(typeof msg === "string" ? msg : "프로필 사진 변경에 실패했습니다.");
    } finally {
      setPhotoSaving(false);
    }
  };

  /**
   * 프로필 사진 삭제
   * - DELETE `/auth/profile-photo`
   * - 성공 시 hasProfilePhoto=false 및 user의 photo 버전 갱신
   */
  const handlePhotoDelete = async () => {
    if (!window.confirm("프로필 사진을 삭제하시겠습니까?")) return;
    setPhotoDeleting(true);
    try {
      const res = await api.delete("/auth/profile-photo");
      const mbPhotoVer = res.data?.mb_photo_ver ?? res.data?.mbPhotoVer;
      if (mbPhotoVer != null && setUser) {
        const updated = { ...user, mb_photo_ver: mbPhotoVer, mbPhotoVer: mbPhotoVer };
        setUser(updated);
        setHasProfilePhoto(false);
        try {
          localStorage.setItem("user", JSON.stringify(updated));
        } catch (_) {}
        alert("프로필 사진이 삭제되었습니다.");
      }
    } catch (err) {
      const msg = err?.response?.data ?? "프로필 사진 삭제에 실패했습니다.";
      alert(typeof msg === "string" ? msg : "프로필 사진 삭제에 실패했습니다.");
    } finally {
      setPhotoDeleting(false);
    }
  };

  /**
   * 닉네임 저장
   * - 입력 유효성 검사(길이/문자 규칙)
   * - POST `/auth/update-nickname`으로 변경
   * - 성공 시 localStorage/user 및 UI 편집 상태 갱신
   */
  const saveNickname = async () => {
    const trimmed = (editNicknameValue || "").trim();
    if (!trimmed) {
      alert("닉네임을 입력하세요.");
      return;
    }
    if (trimmed.length < 2 || trimmed.length > 15) {
      alert("닉네임은 2~15자로 입력하세요.");
      return;
    }
    if (!/^[가-힣a-zA-Z0-9_]+$/.test(trimmed)) {
      alert("닉네임은 한글, 영문, 숫자, 밑줄만 사용 가능합니다.");
      return;
    }
    setNicknameSaving(true);
    try {
      const res = await api.post("/auth/update-nickname", { nickname: trimmed });
      if (res.status === 200) {
        const updated = { ...user, mb_nickname: trimmed, mbNickname: trimmed };
        setUser?.(updated);
        try {
          localStorage.setItem("user", JSON.stringify(updated));
        } catch (_) {}
        setIsEditingNickname(false);
        setEditNicknameValue("");
        alert("닉네임이 변경되었습니다.");
      }
    } catch (err) {
      const msg = err.response?.data ?? "닉네임 변경에 실패했습니다.";
      alert(typeof msg === "string" ? msg : "닉네임 변경에 실패했습니다.");
    } finally {
      setNicknameSaving(false);
    }
  };

  /**
   * 이메일 저장
   * - POST `/auth/update-email`으로 변경
   * - 성공 시 localStorage/user 및 UI 편집 상태 갱신
   */
  const saveEmail = async () => {
    const trimmed = (editEmailValue || "").trim();
    if (!trimmed) {
      alert("이메일을 입력하세요.");
      return;
    }
    setEmailSaving(true);
    try {
      const res = await api.post("/auth/update-email", { email: trimmed });
      if (res.status === 200) {
        const updated = { ...user, mb_email: trimmed, mb_Email: trimmed };
        setUser?.(updated);
        try {
          localStorage.setItem("user", JSON.stringify(updated));
        } catch (_) {}
        setIsEditingEmail(false);
        setEditEmailValue("");
        alert("이메일이 변경되었습니다.");
      }
    } catch (err) {
      const msg = err.response?.data ?? err.response?.statusText ?? "이메일 변경에 실패했습니다.";
      alert(typeof msg === "string" ? msg : "이미 사용 중인 이메일이거나 변경에 실패했습니다.");
    } finally {
      setEmailSaving(false);
    }
  };

  if (!user) {
    return null;
  }

  const isKakaoUser = (user.mb_provider || user.mbProvider) === "kakao";
  const email = user.mb_email ?? user.mb_Email ?? "-";

  const reportsWithReply = myReports.filter(isReportUnseen).length;
  const inquiriesWithReply = myInquiries.filter(isInquiryUnseen).length;

  // 게시판 선택 + 검색어로 필터
  const filteredPosts = myPosts.filter((post) => {
    const matchBoard = !selectedBoard || post.boardType === selectedBoard;
    const title = post.poTitle || post.title || "";
    const matchSearch = !searchKeyword.trim() || title.toLowerCase().includes(searchKeyword.trim().toLowerCase());
    return matchBoard && matchSearch;
  });

  /**
   * 마이페이지 페이지네이션
   * - 백엔드에서 전체 목록을 받은 뒤(practice: `/api/mypage/posts` 등)
   * - 프론트에서 slice로 1페이지당 3개(POSTS_PER_PAGE/REPORTS_PER_PAGE/INQUIRIES_PER_PAGE)씩 표시
   */
  const postsTotalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE) || 1;
  const postsCurrentPage = Math.min(postsPage, postsTotalPages);
  const postsPaginated = filteredPosts.slice((postsCurrentPage - 1) * POSTS_PER_PAGE, postsCurrentPage * POSTS_PER_PAGE);

  const reportsTotalPages = Math.ceil(myReports.length / REPORTS_PER_PAGE) || 1;
  const reportsCurrentPage = Math.min(reportsPage, reportsTotalPages);
  const reportsPaginated = myReports.slice((reportsCurrentPage - 1) * REPORTS_PER_PAGE, reportsCurrentPage * REPORTS_PER_PAGE);

  const inquiriesTotalPages = Math.ceil(myInquiries.length / INQUIRIES_PER_PAGE) || 1;
  const inquiriesCurrentPage = Math.min(inquiriesPage, inquiriesTotalPages);
  const inquiriesPaginated = myInquiries.slice((inquiriesCurrentPage - 1) * INQUIRIES_PER_PAGE, inquiriesCurrentPage * INQUIRIES_PER_PAGE);

  return (
    <div className="mypage-wrapper">
      <h1 className="mypage-page-title">내 프로필</h1>

      {/* 프로필 칸 + 사이드바 (높이 맞춤) */}
      <div className="mypage-top-row">
        {/* 프로필 카드: 사진 + 아이디/이메일/비밀번호 */}
        <section className="mypage-profile-card">
        <div className="mypage-profile-photo-wrap">
          <input
            ref={photoInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            className="mypage-profile-photo-input"
            onChange={handlePhotoFileChange}
            aria-hidden
          />
          <div className="mypage-profile-photo-box">
            <ProfileImage user={user} className="mypage-profile-photo" alt="프로필" />
          </div>
          <button
            type="button"
            className="mypage-profile-photo-btn"
            onClick={handlePhotoChangeClick}
            disabled={photoSaving || photoDeleting}
          >
            {photoSaving ? "업로드 중..." : "프로필 사진 변경"}
          </button>
          {hasProfilePhoto && (
            <button
              type="button"
              className="mypage-profile-photo-btn mypage-profile-photo-delete-btn"
              onClick={handlePhotoDelete}
              disabled={photoSaving || photoDeleting}
            >
              {photoDeleting ? "삭제 중..." : "프로필 사진 삭제"}
            </button>
          )}
        </div>
        <div className="mypage-profile-info">
          <div className="mypage-info-list">
            <div className="mypage-info-row">
              <span className="mypage-info-icon" aria-hidden>📝</span>
              <span className="mypage-info-label">닉네임</span>
              {!isEditingNickname ? (
                <>
                  <span className="mypage-info-text">{getNickname(user)}</span>
                  <button type="button" className="mypage-info-btn" onClick={startEditNickname}>
                    수정
                  </button>
                </>
              ) : (
                <div className="mypage-email-edit">
                  <input
                    type="text"
                    className="mypage-email-input"
                    value={editNicknameValue}
                    onChange={(e) => setEditNicknameValue(e.target.value)}
                    placeholder="닉네임 입력 (2~15자)"
                    aria-label="닉네임"
                    maxLength={15}
                  />
                  <button type="button" className="mypage-info-btn" onClick={saveNickname} disabled={nicknameSaving}>
                    {nicknameSaving ? "저장 중..." : "저장"}
                  </button>
                  <button type="button" className="mypage-info-btn mypage-email-cancel" onClick={cancelEditNickname} disabled={nicknameSaving}>
                    취소
                  </button>
                </div>
              )}
            </div>
            <div className="mypage-info-row">
              <span className="mypage-info-icon" aria-hidden>👤</span>
              <span className="mypage-info-label">아이디</span>
              <span className="mypage-info-text">{getUserId(user)}</span>
            </div>
            {/* [카카오 로그인] 카카오 유저는 이메일/비밀번호를 사용하지 않으므로 완전히 숨김 */}
            {!isKakaoUser && (
              <div className="mypage-info-row">
                <span className="mypage-info-icon" aria-hidden>✉</span>
                <span className="mypage-info-label">이메일</span>
                {!isEditingEmail ? (
                  <>
                    <span className="mypage-info-text">{email}</span>
                    <button type="button" className="mypage-info-btn" onClick={startEditEmail}>
                      수정
                    </button>
                  </>
                ) : (
                  <div className="mypage-email-edit">
                    <input
                      type="email"
                      className="mypage-email-input"
                      value={editEmailValue}
                      onChange={(e) => setEditEmailValue(e.target.value)}
                      placeholder="이메일 입력"
                      aria-label="이메일"
                    />
                    <button type="button" className="mypage-info-btn" onClick={saveEmail} disabled={emailSaving}>
                      {emailSaving ? "저장 중..." : "저장"}
                    </button>
                    <button type="button" className="mypage-info-btn mypage-email-cancel" onClick={cancelEditEmail} disabled={emailSaving}>
                      취소
                    </button>
                  </div>
                )}
              </div>
            )}
            {/* [카카오 로그인] 카카오 유저는 비밀번호를 사용하지 않으므로 비밀번호 영역 숨김 */}
            {!isKakaoUser && (
              <div className="mypage-info-row">
                <span className="mypage-info-icon" aria-hidden>🔒</span>
                <span className="mypage-info-label">비밀번호</span>
                <span className="mypage-info-text">••••••••</span>
                <button type="button" className="mypage-info-btn" onClick={() => openChangePassword?.()}>
                  수정
                </button>
              </div>
            )}
            <div className="mypage-info-row mypage-withdraw-row">
              <span className="mypage-info-icon" aria-hidden />
              <span className="mypage-info-label" />
              <span className="mypage-info-text" style={{ flex: 1 }} />
              <button
                type="button"
                className="mypage-btn-withdraw"
                onClick={() => setShowWithdrawModal(true)}
              >
                회원탈퇴
              </button>
            </div>
          </div>
        </div>
      </section>

        {/* 오른쪽 사이드바: 즐겨찾기, 최근 본 게시글 */}
        <aside className="mypage-sidebar">
          <div className="mypage-sidebar-block">
            <h3 className="mypage-sidebar-title">⭐ 즐겨찾기</h3>
            <ul className="mypage-sidebar-list">
              {bookmarks.length === 0 ? (
                <li className="mypage-sidebar-empty">즐겨찾기한 글이 없습니다</li>
              ) : (
                bookmarks.map((b) => (
                  <li
                    key={b.bmNum}
                    className="mypage-sidebar-item"
                    onClick={() => goToPost({ boardType: b.boardType, poNum: b.poNum })}
                  >
                    <span className="mypage-sidebar-item-title" title={b.poTitle}>
                      {b.poTitle && b.poTitle.length > 18 ? `${b.poTitle.slice(0, 18)}...` : b.poTitle}
                    </span>
                    <button
                      type="button"
                      className="mypage-sidebar-remove"
                      onClick={(e) => handleRemoveBookmark(e, b.bmNum)}
                      aria-label="즐겨찾기 해제"
                    >
                      ×
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
          <div className="mypage-sidebar-block">
            <h3 className="mypage-sidebar-title">🕐 최근에 본 게시글</h3>
            <ul className="mypage-sidebar-list">
              {recentViews.length === 0 ? (
                <li className="mypage-sidebar-empty">최근 본 글이 없습니다</li>
              ) : (
                recentViews.map((r, idx) => (
                  <li
                    key={`${r.boardType}-${r.poNum}-${idx}`}
                    className="mypage-sidebar-item"
                    onClick={() => goToPost({ boardType: r.boardType, poNum: r.poNum })}
                  >
                    <span className="mypage-sidebar-item-title" title={r.poTitle}>
                      {r.poTitle && r.poTitle.length > 18 ? `${r.poTitle.slice(0, 18)}...` : r.poTitle || "(제목 없음)"}
                    </span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </aside>
      </div>

      {showWithdrawModal && (
        <div className="mypage-withdraw-overlay" onClick={() => !withdrawSubmitting && setShowWithdrawModal(false)}>
          <div className="mypage-withdraw-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="mypage-withdraw-title">회원 탈퇴</h3>
            <p className="mypage-withdraw-desc">정말 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.</p>
            {!isKakaoUser && (
              <input
                type="password"
                className="mypage-withdraw-password"
                placeholder="비밀번호 입력"
                value={withdrawPassword}
                onChange={(e) => setWithdrawPassword(e.target.value)}
                aria-label="비밀번호"
              />
            )}
            <div className="mypage-withdraw-actions">
              <button type="button" className="mypage-withdraw-btn-cancel" onClick={() => !withdrawSubmitting && setShowWithdrawModal(false)} disabled={withdrawSubmitting}>
                취소
              </button>
              <button type="button" className="mypage-withdraw-btn-confirm" onClick={handleWithdraw} disabled={withdrawSubmitting}>
                {withdrawSubmitting ? "처리 중..." : "탈퇴하기"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 하단 탭: 내가 쓴 글 | 신고함 | 1:1 문의함 (관리자는 내가 쓴 글만 표시) */}
      <section className="mypage-posts">
            <div className="mypage-posts-header">
              <div className="mypage-bottom-tabs">
                <button
                  className={`mypage-bottom-tab ${(bottomTab === "posts" || isAdmin(user)) ? "active" : ""}`}
                  onClick={() => setBottomTab("posts")}
                >
                  내가 쓴 글
                </button>
                {!isAdmin(user) && (
                  <>
                    <button
                      className={`mypage-bottom-tab ${bottomTab === "reports" ? "active" : ""}`}
                      onClick={() => setBottomTab("reports")}
                    >
                      신고함
                      {reportsWithReply > 0 && (
                        <span className="mypage-tab-badge" title="답변 있음">
                          {reportsWithReply}
                        </span>
                      )}
                    </button>
                    <button
                      className={`mypage-bottom-tab ${bottomTab === "inquiries" ? "active" : ""}`}
                      onClick={() => setBottomTab("inquiries")}
                    >
                      1:1 문의함
                      {inquiriesWithReply > 0 && (
                        <span className="mypage-tab-badge" title="답변 있음">
                          {inquiriesWithReply}
                        </span>
                      )}
                    </button>
                  </>
                )}
              </div>
              {(bottomTab === "posts" || isAdmin(user)) && (
              <div className="mypage-posts-toolbar">
                <input
                  type="text"
                  className="mypage-posts-search"
                  placeholder="제목으로 검색"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  aria-label="검색창"
                />
                <select
                  className="mypage-posts-board-select"
                  value={selectedBoard}
                  onChange={(e) => setSelectedBoard(e.target.value)}
                  aria-label="게시판 선택"
                >
                  {BOARD_OPTIONS.map((opt) => (
                    <option key={opt.value || "all"} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              )}
            </div>
            <div className="mypage-posts-body">
              {(bottomTab === "posts" || isAdmin(user)) && (loading ? (
                <p className="mypage-posts-loading">불러오는 중...</p>
              ) : (
                <>
                  <div className="mypage-posts-table-header">
                    <span className="mypage-posts-th-board">게시판</span>
                    <span className="mypage-posts-th-title">제목</span>
                  </div>
                  {filteredPosts.length === 0 ? (
                    <p className="mypage-posts-empty">작성한 글이 없습니다.</p>
                  ) : (
                    <>
                      <ul className="mypage-posts-list">
                        {postsPaginated.map((post) => (
                          <li
                            key={`${post.boardType}-${post.poNum || post.id}`}
                            className="mypage-posts-item"
                            onClick={() => goToPost(post)}
                          >
                            <span className="mypage-post-board">{post.boardName}</span>
                            <span className="mypage-post-title">{post.poTitle || post.title || "-"}</span>
                          </li>
                        ))}
                      </ul>
                      {postsTotalPages > 1 && (
                        <div className="mypage-pagination">
                          <button type="button" className="mypage-pagination-btn" disabled={postsCurrentPage <= 1} onClick={() => setPostsPage((p) => Math.max(1, p - 1))}>이전</button>
                          <span className="mypage-pagination-info">{postsCurrentPage} / {postsTotalPages}</span>
                          <button type="button" className="mypage-pagination-btn" disabled={postsCurrentPage >= postsTotalPages} onClick={() => setPostsPage((p) => Math.min(postsTotalPages, p + 1))}>다음</button>
                        </div>
                      )}
                    </>
                  )}
                </>
              )              )}

              {!isAdmin(user) && bottomTab === "reports" && (
                <>
                  <div className="mypage-posts-table-header">
                    <span className="mypage-posts-th-board">대상</span>
                    <span className="mypage-posts-th-title">신고 내용</span>
                    <span className="mypage-posts-th-date">상태</span>
                  </div>
                  {myReports.length === 0 ? (
                    <p className="mypage-posts-empty">신고 내역이 없습니다.</p>
                  ) : (
                    <>
                      <ul className="mypage-posts-list">
                        {reportsPaginated.map((r) => (
                          <li
                            key={r.rbNum}
                            className="mypage-posts-item"
                            onClick={() => openReportDetail(r)}
                          >
                            {/* 신고 대상 표기: rbTargetNickname이 있으면 닉네임, 없으면 rbName + rbId fallback */}
                            <span className="mypage-post-board">{r.rbTargetNickname ?? `${r.rbName} #${r.rbId}`}</span>
                            <span className="mypage-post-title">{(r.rbContent || "").slice(0, 40)}{(r.rbContent || "").length > 40 ? "..." : ""}</span>
                            <span className="mypage-post-date">{getReportStatusLabel(r)}</span>
                          </li>
                        ))}
                      </ul>
                      {reportsTotalPages > 1 && (
                        <div className="mypage-pagination">
                          <button type="button" className="mypage-pagination-btn" disabled={reportsCurrentPage <= 1} onClick={() => setReportsPage((p) => Math.max(1, p - 1))}>이전</button>
                          <span className="mypage-pagination-info">{reportsCurrentPage} / {reportsTotalPages}</span>
                          <button type="button" className="mypage-pagination-btn" disabled={reportsCurrentPage >= reportsTotalPages} onClick={() => setReportsPage((p) => Math.min(reportsTotalPages, p + 1))}>다음</button>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}

              {!isAdmin(user) && bottomTab === "inquiries" && (
                <>
                  <div className="mypage-posts-table-header">
                    <span className="mypage-posts-th-board">제목</span>
                    <span className="mypage-posts-th-title">내용</span>
                    <span className="mypage-posts-th-date">상태</span>
                  </div>
                  {myInquiries.length === 0 ? (
                    <p className="mypage-posts-empty">문의 내역이 없습니다.</p>
                  ) : (
                    <>
                      <ul className="mypage-posts-list">
                        {inquiriesPaginated.map((q) => (
                          <li
                            key={q.ibNum}
                            className="mypage-posts-item"
                            onClick={() => openInquiryDetail(q)}
                          >
                            <span className="mypage-post-board">{(q.ibTitle || "").slice(0, 15)}{(q.ibTitle || "").length > 15 ? "..." : ""}</span>
                            <span className="mypage-post-title">{(q.ibContent || "").slice(0, 40)}{(q.ibContent || "").length > 40 ? "..." : ""}</span>
                            <span className="mypage-post-date">{q.ibStatus === "Y" ? "답변완료" : "대기"}</span>
                          </li>
                        ))}
                      </ul>
                      {inquiriesTotalPages > 1 && (
                        <div className="mypage-pagination">
                          <button type="button" className="mypage-pagination-btn" disabled={inquiriesCurrentPage <= 1} onClick={() => setInquiriesPage((p) => Math.max(1, p - 1))}>이전</button>
                          <span className="mypage-pagination-info">{inquiriesCurrentPage} / {inquiriesTotalPages}</span>
                          <button type="button" className="mypage-pagination-btn" disabled={inquiriesCurrentPage >= inquiriesTotalPages} onClick={() => setInquiriesPage((p) => Math.min(inquiriesTotalPages, p + 1))}>다음</button>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
      </section>

      {detailModal && (
        <div className="mypage-detail-overlay" onClick={() => setDetailModal(null)}>
          <div className="mypage-detail-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="mypage-detail-title">
              {detailModal.type === "report" ? "신고 상세" : "문의 상세"}
            </h3>
            {detailModal.type === "report" ? (
              <div className="mypage-detail-body">
                {/* 신고 대상 상세 표기: backend이 rbTargetNickname을 함께 내려주는 경우 닉네임 표시 */}
                <p><strong>대상:</strong> {detailModal.data.rbTargetNickname ?? `${detailModal.data.rbName} #${detailModal.data.rbId}`}</p>
                <p><strong>신고 내용:</strong></p>
                <p className="mypage-detail-content">{detailModal.data.rbContent}</p>
                {detailModal.data.rbReply && (
                  <div className="mypage-detail-reply">
                    <strong>관리자 답변:</strong>
                    <p>{detailModal.data.rbReply}</p>
                  </div>
                )}
                <p><strong>상태:</strong> {(detailModal.data.rbReply && String(detailModal.data.rbReply).trim()) ? "답변완료" : detailModal.data.rbManage === "Y" ? "처리완료" : detailModal.data.rbManage === "D" ? "삭제됨" : detailModal.data.rbManage === "H" ? "보류" : "대기"}</p>
              </div>
            ) : (
              <div className="mypage-detail-body">
                <p><strong>제목:</strong> {detailModal.data.ibTitle}</p>
                <p><strong>내용:</strong></p>
                <p className="mypage-detail-content">{detailModal.data.ibContent}</p>
                {detailModal.data.ibReply && (
                  <div className="mypage-detail-reply">
                    <strong>관리자 답변:</strong>
                    <p>{detailModal.data.ibReply}</p>
                  </div>
                )}
                <p><strong>상태:</strong> {detailModal.data.ibStatus === "Y" ? "답변완료" : "대기"}</p>
              </div>
            )}
            <button type="button" className="mypage-detail-close" onClick={() => setDetailModal(null)}>닫기</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyPage;
