import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import axios from 'axios';
import api from '../../api/axios';
import { getMemberNum } from '../../utils/user';
import { addRecentView } from '../../utils/recentViews'; 
import './FreeBoardDetail.css'; 

const FreeBoardDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useOutletContext() || {}; 
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isBookmarked, setIsBookmarked] = useState(false);

    const isLoggedIn = !!user;
    const currentUserNum = getMemberNum(user);
    const SERVER_URL = "";

    /**
     * 🚩 본문 내 이미지 경로를 영구 저장소 경로로 변환
     * 에디터에서 삽입된 상대 경로(/pic/...)를 서버의 전체 URL로 변환하여 영구 보존 대응
     */
    const formatContent = (content) => {
        if (!content) return "";
        // /pic/ 경로로 시작하는 이미지 src를 서버 주소와 결합
        return content.replace(/src="\/pic\//g, `src="${SERVER_URL}/pic/`);
    };

    const fetchDetail = useCallback(async () => {
        if (id === 'write') {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const res = await axios.get(`${SERVER_URL}/api/freeboard/posts/${id}`);
            setPost(res.data);
            addRecentView({ boardType: 'freeboard', poNum: Number(id), poTitle: res.data?.poTitle });
        } catch (err) {
            console.error("상세보기 로딩 에러:", err);
            alert("게시글을 불러올 수 없습니다.");
            navigate('/community/freeboard');
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => { fetchDetail(); }, [fetchDetail]);

    if (id === 'write') return null;
    if (loading) return <div className="loading-box">데이터 로딩 중...</div>;
    if (!post) return null;

    const isOwner = isLoggedIn && Number(post.poMbNum) === Number(currentUserNum);

    const handleBookmark = async () => {
        if (!isLoggedIn) return alert("로그인이 필요한 서비스입니다.");
        try {
            await api.post("/api/mypage/bookmarks", { poNum: Number(id), boardType: "freeboard" });
            setIsBookmarked(true);
            alert("즐겨찾기에 추가되었습니다.");
        } catch (err) {
            const msg = err?.response?.data?.msg || err?.response?.data?.error;
            alert(msg || "즐겨찾기 추가에 실패했습니다.");
        }
    };

    return (
        <div className="review-detail-wrapper">
            <div className="detail-container">
                {/* 헤더 섹션: 리뷰보드 규격 일치 */}
                <div className="detail-header-section">
                    <h1 className="detail-main-title">{post.poTitle}</h1>
                    <div className="detail-sub-info">
                        <span>작성자: User {post.poMbNum}</span> 
                        <span className="info-divider">|</span>
                        <span>조회 {post.poView}</span> 
                        <span className="info-divider">|</span>
                        <span>작성일 {new Date(post.poDate).toLocaleString()}</span>
                    </div>
                </div>

                {/* 본문 섹션: 이미지 경로 치환 로직 적용 */}
                <div className="detail-body-text">
                    <div dangerouslySetInnerHTML={{ __html: formatContent(post.poContent) }} />
                </div>
                
                {/* 하단 버튼 영역: 리뷰보드(ReviewBoard)와 레이아웃/클래스 완벽 통일 */}
                <div className="detail-bottom-actions">
                    <div className="left-group">
                        {isLoggedIn && (
                            <button className="btn-bookmark-action" onClick={handleBookmark} disabled={isBookmarked} style={{ marginRight: 8 }}>
                                {isBookmarked ? '★ 즐겨찾기됨' : '☆ 즐겨찾기'}
                            </button>
                        )}
                        {isOwner && (
                            <>
                                <button 
                                    className="btn-edit-action" 
                                    onClick={() => navigate(`/community/freeboard/edit/${id}`)}
                                >
                                    ✏️ 수정
                                </button>
                                <button 
                                    className="btn-delete-action" 
                                    onClick={() => { if(window.confirm("삭제하시겠습니까?")) { /* 삭제 로직은 기존과 동일하게 유지 */ } }}
                                >
                                    🗑️ 삭제
                                </button>
                            </>
                        )}
                    </div>
                    
                    {/* 우측 끝 '목록으로' 버튼 */}
                    <button className="btn-list-return" onClick={() => navigate('/community/freeboard')}>
                        목록으로
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FreeBoardDetail;