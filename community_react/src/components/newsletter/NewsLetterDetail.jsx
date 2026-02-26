import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import axios from 'axios';
/** * 🚩 경로 확인 완료: src/components/newsletter/NewsLetterDetail.css 사용
 * EventBoardDetail과 동일한 디자인 규격을 적용합니다.
 */
import './NewsLetterDetail.css'; 

const NewsLetterDetail = () => {
    // App.js 라우트 설정에 맞춰 poNum 수신
    const { poNum } = useParams(); 
    const navigate = useNavigate();
    
    // 상위 context에서 주입되는 유저 정보 및 포스트 갱신 함수
    const { user, loadPosts } = useOutletContext() || {}; 
    
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isLiked, setIsLiked] = useState(false);

    const isLoggedIn = !!user; 
    const currentUserNum = user ? (user.mb_num || user.mbNum) : null; 
    const isAdmin = user ? (user.mb_rol === 'ADMIN' || user.mbRol === 'ADMIN' || user.mbLevel >= 10) : false; 

    // 서버 설정 (이벤트 게시판과 동일하게 유지)
    const SERVER_URL = "http://localhost:8080";

    // poNum이 숫자인지 확인
    const isNumericId = poNum && !isNaN(Number(poNum));

    /**
     * 🚩 본문 내 이미지 경로 가공 (EventBoardDetail 로직과 동기화)
     */
    const formatContent = (content) => {
        if (!content) return "";
        return content.replace(/src="\/pic\//g, `src="${SERVER_URL}/pic/`);
    };

    const fetchPostData = useCallback(async () => {
        if (!isNumericId) return;
        try {
            setLoading(true);
            // 뉴스레터 전용 API 호출
            const postRes = await axios.get(`${SERVER_URL}/api/newsletter/posts/${poNum}?mbNum=${currentUserNum || ''}`);
            const data = postRes.data;
            
            // 데이터 필드 정규화 (이벤트 게시판의 normalizedData 방식 적용)
            const normalizedData = {
                ...data,
                po_title: data.po_title || data.poTitle || "제목 없음",
                po_content: data.po_content || data.poContent || "",
                po_view: data.po_view || data.poView || 0,
                po_up: data.po_up || data.poUp || 0,
                po_date: data.po_date || data.poDate
            };
            
            setPost(normalizedData);
            setIsLiked(data.isLikedByMe || data.liked || false);
        } catch (err) {
            console.error("뉴스레터 로딩 실패:", err);
            navigate(`/news/newsletter`); 
        } finally {
            setLoading(false);
        }
    }, [poNum, navigate, isNumericId, currentUserNum, SERVER_URL]);

    useEffect(() => { 
        if(isNumericId) fetchPostData();
    }, [isNumericId, fetchPostData]);

    const handleDeletePost = async () => {
        if (!window.confirm("정말 뉴스레터를 삭제하시겠습니까?")) return;
        try {
            await axios.delete(`${SERVER_URL}/api/newsletter/posts/${poNum}`);
            alert("뉴스레터가 삭제되었습니다.");
            if (loadPosts) loadPosts(); 
            navigate(`/news/newsletter`); 
        } catch (err) {
            alert("뉴스레터 삭제 중 오류가 발생했습니다.");
        }
    };

    const handleLikeToggle = async () => {
        if(!isLoggedIn) return alert("로그인이 필요한 서비스입니다.");
        try {
            const res = await axios.post(`${SERVER_URL}/api/newsletter/posts/${poNum}/like`, { mbNum: currentUserNum });
            if (res.data.status === "liked" || res.data === "liked") {
                setIsLiked(true);
                setPost(prev => ({ ...prev, po_up: (prev.po_up || 0) + 1 }));
            } else {
                setIsLiked(false);
                setPost(prev => ({ ...prev, po_up: Math.max(0, (prev.po_up || 1) - 1) }));
            }
        } catch (err) { 
            alert("추천 처리 중 오류 발생"); 
        }
    };

    if (loading) return <div style={{textAlign: 'center', padding: '100px'}}>데이터 로딩 중...</div>;
    if (!post) return null;

    return (
        /* 🚩 EventBoardDetail과 완벽하게 동일한 래퍼 및 컨테이너 클래스 구조 적용 */
        <div className="review-detail-wrapper">
            <div className="detail-container">
                
                {/* 🚩 헤더 섹션: 구조 및 클래스명 일치 */}
                <div className="detail-header-section">
                    <h1 className="detail-main-title">{post.po_title}</h1>
                    <div className="detail-sub-info">
                        <span>작성자: 관리자</span> 
                        <span className="info-divider">|</span>
                        <span>조회 {post.po_view}</span> 
                        <span className="info-divider">|</span>
                        <span>추천 {post.po_up}</span> 
                        <span className="info-divider">|</span>
                        <span>작성일 {post.po_date ? new Date(post.po_date).toLocaleString() : ''}</span>
                    </div>
                </div>
                
                {/* 🚩 본문 섹션: 클래스명 일치 */}
                <div className="detail-body-text">
                    <div dangerouslySetInnerHTML={{ __html: formatContent(post.po_content) }} />
                </div>

                {/* 🚩 하단 버튼 영역: 버튼 구성 및 스타일 조건 일치 */}
                <div className="detail-bottom-actions">
                    <div className="left-group">
                        {isLoggedIn && (
                            <button 
                                className="btn-bookmark-action" 
                                onClick={handleLikeToggle}
                                style={{ 
                                    backgroundColor: isLiked ? '#ff4757' : '#f1f2f6', 
                                    color: isLiked ? 'white' : 'black', 
                                    marginRight: 8 
                                }}
                            >
                                {isLiked ? '❤️ 추천됨' : '🤍 추천하기'} {post.po_up}
                            </button>
                        )}
                        {isAdmin && (
                            <>
                                <button 
                                    className="btn-edit-action" 
                                    onClick={() => navigate(`/news/newsletter/write`, { 
                                        state: { mode: 'edit', postData: post, boardType: 'newsletter' } 
                                    })}
                                >
                                    ✏️ 수정
                                </button>
                                <button className="btn-delete-action" onClick={handleDeletePost}>🗑️ 삭제</button>
                            </>
                        )}
                    </div>
                    {/* 🚩 우측 목록으로 버튼 위치 고정 */}
                    <button className="btn-list-return" onClick={() => navigate(`/news/newsletter`)}>
                        목록으로
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NewsLetterDetail;