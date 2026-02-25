import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import axios from 'axios';
// 🚩 디자인 및 기능을 유지하면서 참조 파일만 NewsLetterDetail.css로 확정
import './NewsLetterDetail.css'; 

const NewsLetterDetail = () => {
    // App.js 라우트 설정(<Route path="/news/newsletter/:poNum">)에 맞춰 poNum 수신
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

    const SERVER_URL = "http://localhost:8080";

    // poNum이 숫자인지 확인
    const isNumericId = poNum && !isNaN(Number(poNum));

    /**
     * 🚩 본문 내 이미지 경로를 영구 저장소 경로로 변환
     * 에디터에서 삽입된 상대 경로(/pic/...)를 서버의 전체 URL로 변환하여 영구 보존 대응
     */
    const formatContent = (content) => {
        if (!content) return "";
        // /pic/ 경로로 시작하는 이미지 src를 서버 주소와 결합
        return content.replace(/src="\/pic\//g, `src="${SERVER_URL}/pic/`);
    };

    const fetchPostData = useCallback(async () => {
        if (!isNumericId) return;
        try {
            setLoading(true);
            // 🚩 뉴스레터 전용 API 엔드포인트 호출
            const postRes = await axios.get(`${SERVER_URL}/api/newsletter/posts/${poNum}?mbNum=${currentUserNum || ''}`);
            setPost(postRes.data);
            
            // 좋아요 여부 설정 (백엔드 필드 대응)
            setIsLiked(postRes.data.isLikedByMe || postRes.data.liked || false);
            setLoading(false);
        } catch (err) {
            console.error("뉴스레터 로딩 에러:", err);
            if (err.response?.status === 404) {
                alert("뉴스레터를 찾을 수 없습니다.");
                navigate(`/news/newsletter`);
            }
            setLoading(false);
        }
    }, [poNum, navigate, isNumericId, currentUserNum]);

    useEffect(() => { 
        if(isNumericId) {
            fetchPostData();       
        }
    }, [isNumericId, fetchPostData]);

    const handleDeletePost = async () => {
        if (!window.confirm("정말 뉴스레터를 삭제하시겠습니까?")) return;
        try {
            // 🚩 뉴스레터 전용 삭제 API 호출
            await axios.delete(`${SERVER_URL}/api/newsletter/posts/${poNum}`);
            alert("뉴스레터가 삭제되었습니다.");
            if (loadPosts) loadPosts(); // 리스트 갱신 함수 호출
            navigate(`/news/newsletter`); 
        } catch (err) {
            alert("뉴스레터 삭제 중 오류가 발생했습니다.");
        }
    };

    const handleLikeToggle = async () => {
        if(!isLoggedIn) return alert("로그인이 필요한 서비스입니다.");
        try {
            // 🚩 뉴스레터 전용 추천 API 호출
            const res = await axios.post(`${SERVER_URL}/api/newsletter/posts/${poNum}/like`, { mbNum: currentUserNum });
            
            // 응답 데이터 포맷에 맞춰 처리
            if (res.data.status === "liked" || res.data === "liked") {
                setIsLiked(true);
                setPost(prev => ({ 
                    ...prev, 
                    po_up: (prev.po_up || prev.poUp || 0) + 1,
                    poUp: (prev.poUp || prev.po_up || 0) + 1 
                }));
            } else if (res.data.status === "unliked" || res.data === "unliked") {
                setIsLiked(false);
                setPost(prev => ({ 
                    ...prev, 
                    po_up: Math.max(0, (prev.po_up || prev.poUp || 1) - 1),
                    poUp: Math.max(0, (prev.poUp || prev.po_up || 1) - 1) 
                }));
            }
        } catch (err) { 
            alert("추천 처리 중 오류 발생"); 
        }
    };

    if (loading) return <div className="loading-box" style={{textAlign: 'center', padding: '100px'}}>데이터 로딩 중...</div>;
    if (!post) return <div className="loading-box" style={{textAlign: 'center', padding: '100px'}}>뉴스레터를 찾을 수 없습니다.</div>;

    return (
        <div className="event-detail-wrapper">
            <div className="detail-container">
                <div className="detail-header-section">
                    <h1 className="detail-main-title">{post.po_title || post.poTitle || "제목 없음"}</h1>
                    <div className="detail-sub-info">
                        <span>작성자: 관리자</span> 
                        <span className="info-divider">|</span>
                        <span>조회 {post.po_view || post.poView || 0}</span> 
                        <span className="info-divider">|</span>
                        <span>추천 {post.po_up || post.poUp || 0}</span> 
                        <span className="info-divider">|</span>
                        <span>작성일 {new Date(post.po_date || post.poDate).toLocaleDateString()}</span>
                    </div>
                </div>
                
                <div className="detail-body-text">
                    {/* 🚩 가공된 content를 적용하여 이미지 경로 유실 방지 */}
                    <div dangerouslySetInnerHTML={{ __html: formatContent(post.po_content || post.poContent) }} />
                </div>

                <div className="detail-bottom-actions">
                    <div className="left-group">
                        {isLoggedIn && (
                            <button className={`btn-like-action ${isLiked ? 'active' : ''}`} onClick={handleLikeToggle}>
                                {isLiked ? '❤️ 추천취소' : '🤍 추천'} {post.po_up || post.poUp || 0}
                            </button>
                        )}
                        {isAdmin && (
                            <>
                                {/* 🚩 수정 시 뉴스레터 작성 페이지로 이동하며 데이터 전달 */}
                                <button className="btn-edit-action" onClick={() => navigate(`/news/newsletter/write`, { state: { mode: 'edit', postData: post, boardType: 'newsletter' } })}>✏️ 수정</button>
                                <button className="btn-delete-action" onClick={handleDeletePost}>🗑️ 삭제</button>
                            </>
                        )}
                    </div>
                    {/* 🚩 목록으로 돌아가기 경로: 뉴스레터 메인 */}
                    <button className="btn-list-return" onClick={() => navigate(`/news/newsletter`)}>목록으로</button>
                </div>
            </div>
        </div>
    );
};

export default NewsLetterDetail;