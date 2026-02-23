import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { getUserId } from "../utils/user";
import api from "../api/axios";
import "./MyPage.css";

const PROFILE_IMAGE = process.env.PUBLIC_URL + "/profile-default.png";

const BOARD_OPTIONS = [
  { value: "", label: "전체" },
  { value: "recommend", label: "여행 추천" },
  { value: "reviewboard", label: "여행 후기" },
  { value: "freeboard", label: "자유 게시판" },
];

function MyPage() {
  const { user, setUser, openChangePassword } = useOutletContext() || {};
  const navigate = useNavigate();
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedBoard, setSelectedBoard] = useState("");
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [editEmailValue, setEditEmailValue] = useState("");
  const [emailSaving, setEmailSaving] = useState(false);

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

  useEffect(() => {
    loadMyPosts();
  }, [loadMyPosts]);

  useEffect(() => {
    if (!user) {
      alert("로그인이 필요한 서비스입니다.");
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const goToPost = (post) => {
    navigate(`/community/${post.boardType}/${post.poNum || post.id}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const d = new Date(dateString);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const startEditEmail = () => {
    setEditEmailValue(user?.mb_email ?? user?.mb_Email ?? "");
    setIsEditingEmail(true);
  };

  const cancelEditEmail = () => {
    setIsEditingEmail(false);
    setEditEmailValue("");
  };

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

  const email = user.mb_email ?? user.mb_Email ?? "-";

  // 게시판 선택 + 검색어로 필터
  const filteredPosts = myPosts.filter((post) => {
    const matchBoard = !selectedBoard || post.boardType === selectedBoard;
    const title = post.poTitle || post.title || "";
    const matchSearch = !searchKeyword.trim() || title.toLowerCase().includes(searchKeyword.trim().toLowerCase());
    return matchBoard && matchSearch;
  });

  return (
    <div className="mypage-wrapper">
      <h1 className="mypage-page-title">내 프로필</h1>

      {/* 프로필 카드: 사진 + 아이디/이메일/비밀번호 */}
      <section className="mypage-profile-card">
        <div className="mypage-profile-photo-wrap">
          <img
            src={PROFILE_IMAGE}
            alt="프로필"
            className="mypage-profile-photo"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextElementSibling?.classList.add("show");
            }}
          />
          <div className="mypage-profile-photo-fallback">👤</div>
        </div>
        <div className="mypage-profile-info">
          <div className="mypage-info-list">
            <div className="mypage-info-row">
              <span className="mypage-info-icon" aria-hidden>👤</span>
              <span className="mypage-info-label">아이디</span>
              <span className="mypage-info-text">{getUserId(user)}</span>
            </div>
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
            <div className="mypage-info-row">
              <span className="mypage-info-icon" aria-hidden>🔒</span>
              <span className="mypage-info-label">비밀번호</span>
              <span className="mypage-info-text">••••••••</span>
              <button type="button" className="mypage-info-btn" onClick={() => openChangePassword?.()}>
                수정
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 내가 쓴 글 - 헤더 오른쪽에 검색창·게시판 선택, 목록은 게시판명 - 제목 */}
      <section className="mypage-posts">
        <div className="mypage-posts-header">
          <h2 className="mypage-posts-title">내가 쓴 글</h2>
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
        </div>
        <div className="mypage-posts-body">
          {loading ? (
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
                <ul className="mypage-posts-list">
                  {filteredPosts.map((post) => (
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
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}

export default MyPage;
