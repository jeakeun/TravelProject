import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import axios from 'axios';
import './EventBoardDetail.css'; 

const EventBoardDetail = () => {
    // App.jsx 라우트 설정 <Route path="/event/:poNum" ... /> 에 맞춰 poNum 수신
    const { poNum } = useParams(); 
    const navigate = useNavigate();
    
    // App.js 또는 상위 context에서 주입되는 유저 정보 및 포스트 갱신 함수
    const { user, refreshPosts } = useOutletContext() || {}; 
    
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isLiked, setIsLiked] = useState(false);

    const isLoggedIn = !!user; 
    // DB의 mb_num 또는 세션의 mbNum 대응
    const currentUserNum = user ? (user.mb_num || user.mbNum) : null; 
    // DB 스키마 mb_rol 컬럼이 'ADMIN'인 경우 관리자로 판단
    const isAdmin = user ? (user.mb_rol === 'ADMIN' || user.mbLevel >= 10) : false; 

    // poNum이 숫자인지 확인
    const isNumericId = poNum && !isNaN(Number(poNum));

    const fetchPostData = useCallback(async () => {
        if (!isNumericId) return;
        try {
            setLoading(true);
            // 이벤트 전용 엔드포인트 호출
            const postRes = await axios.get(`http://localhost:8080/api/event/posts/${poNum}?mbNum=${currentUserNum || ''}`);
            setPost(postRes.data);
            
            // 백엔드 반환 필드명에 따라 추천 여부 확인
            setIsLiked(postRes.data.isLikedByMe || false);
            setLoading(false);
        } catch (err) {
            if (err.response?.status === 404) {
                alert("게시글을 찾을 수 없습니다.");
                navigate(`/event`);
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
        if (!window.confirm("정말 게시글을 삭제하시겠습니까?")) return;
        try {
            // 이벤트 전용 삭제 API 호출
            await axios.delete(`http://localhost:8080/api/event/posts/${poNum}`);
            alert("게시글이 삭제되었습니다.");
            if (refreshPosts) refreshPosts();
            navigate(`/event`); // 삭제 후 이벤트 목록으로 이동
        } catch (err) {
            alert("게시글 삭제 중 오류가 발생했습니다.");
        }
    };

    const handleLikeToggle = async () => {
        if(!isLoggedIn) return alert("로그인이 필요한 서비스입니다.");
        try {
            // 이벤트 전용 추천 API 호출
            const res = await axios.post(`http://localhost:8080/api/event/posts/${poNum}/like`, { mbNum: currentUserNum });
            if (res.data.status === "liked") {
                setIsLiked(true);
                setPost(prev => ({ ...prev, po_up: (prev.po_up || 0) + 1 }));
            } else {
                setIsLiked(false);
                setPost(prev => ({ ...prev, po_up: Math.max(0, (prev.po_up || 1) - 1) }));
            }
        } catch (err) { alert("추천 처리 중 오류 발생"); }
    };

    if (loading) return <div className="loading-box">데이터 로딩 중...</div>;
    if (!post) return <div className="loading-box">게시글을 찾을 수 없습니다.</div>;

    return (
        <div className="event-detail-wrapper">
            <div className="detail-container">
                <div className="detail-header-section">
                    <h1 className="detail-main-title">{post.po_title}</h1>
                    <div className="detail-sub-info">
                        <span>작성자: 관리자</span> 
                        <span className="info-divider">|</span>
                        <span>조회 {post.po_view}</span> 
                        <span className="info-divider">|</span>
                        <span>추천 {post.po_up}</span> 
                        <span className="info-divider">|</span>
                        <span>작성일 {new Date(post.po_date).toLocaleString()}</span>
                    </div>
                </div>
                
                <div className="detail-body-text">
                    {/* HTML 태그가 포함된 내용을 렌더링 */}
                    <div dangerouslySetInnerHTML={{ __html: post.po_content }} />
                </div>

                <div className="detail-bottom-actions">
                    <div className="left-group">
                        {isLoggedIn && (
                            <button className={`btn-like-action ${isLiked ? 'active' : ''}`} onClick={handleLikeToggle}>
                                {isLiked ? '❤️ 추천취소' : '🤍 추천'} {post.po_up}
                            </button>
                        )}
                        {isAdmin && (
                            <>
                                <button className="btn-edit-action" onClick={() => navigate(`/community/write`, { state: { mode: 'edit', postData: post } })}>✏️ 수정</button>
                                <button className="btn-delete-action" onClick={handleDeletePost}>🗑️ 삭제</button>
                            </>
                        )}
                    </div>
                    {/* 목록으로 버튼 경로를 /event로 유지 */}
                    <button className="btn-list-return" onClick={() => navigate(`/event`)}>목록으로</button>
                </div>
            </div>
        </div>
    );
};

export default EventBoardDetail;