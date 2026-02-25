import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import axios from 'axios';
// 🚩 디자인 및 기능을 유지하면서 참조 파일 확인
import './EventBoardDetail.css'; 

const EventBoardDetail = () => {
    // App.jsx 라우트 설정 <Route path="/news/event/:poNum" ... /> 에 맞춰 poNum 수신
    const { poNum } = useParams(); 
    const navigate = useNavigate();
    
    // 상위 context에서 주입되는 데이터 및 함수
    const { user, loadPosts } = useOutletContext() || {}; 
    
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isLiked, setIsLiked] = useState(false);

    const isLoggedIn = !!user; 
    
    // 🚩 [수정] 자동 배포 환경을 위해 배포 서버 IP로 설정
    const SERVER_URL = "http://3.37.160.108:8080";

    // 유저 번호 추출 (mb_num 또는 mbNum 대응)
    const currentUserNum = user ? (user.mb_num || user.mbNum) : null; 
    // 관리자 여부 판단 (mb_rol 또는 mbRol 대응)
    const isAdmin = user ? (user.mb_rol === 'ADMIN' || user.mbRol === 'ADMIN' || user.mbLevel >= 10) : false; 

    const isNumericId = poNum && !isNaN(Number(poNum));

    /**
     * 🚩 본문 내 이미지 경로를 영구 저장소 경로로 변환
     * 에디터에서 삽입된 상대 경로(/pic/...)를 서버의 전체 URL로 변환하여 영구 보존 대응
     */
    const formatContent = (content) => {
        if (!content) return "";
        // /pic/ 경로로 시작하는 이미지 src를 서버 주소와 결합
        // 🚩 SERVER_URL을 동적으로 참조하여 배포 환경에서도 이미지가 깨지지 않게 함
        return content.replace(/src="\/pic\//g, `src="${SERVER_URL}/pic/`);
    };

    const fetchPostData = useCallback(async () => {
        if (!isNumericId) return;
        try {
            setLoading(true);
            // 이벤트 전용 엔드포인트 호출
            const postRes = await axios.get(`${SERVER_URL}/api/event/posts/${poNum}?mbNum=${currentUserNum || ''}`);
            
            const data = postRes.data;
            // 필드명 정규화 (Snake case / Camel case 모두 대응하여 데이터 유실 방지)
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
            console.error("데이터 로딩 실패:", err);
            if (err.response?.status === 404) {
                alert("게시글을 찾을 수 없습니다.");
                navigate(`/news/event`); 
            }
        } finally {
            setLoading(false);
        }
    }, [poNum, navigate, isNumericId, currentUserNum, SERVER_URL]);

    useEffect(() => { 
        if(isNumericId) {
            fetchPostData();       
        }
    }, [isNumericId, fetchPostData]);

    const handleDeletePost = async () => {
        if (!window.confirm("정말 게시글을 삭제하시겠습니까?")) return;
        try {
            // 이벤트 전용 삭제 API 호출
            await axios.delete(`${SERVER_URL}/api/event/posts/${poNum}`);
            alert("게시글이 삭제되었습니다.");
            
            // 삭제 후 부모 리스트의 상태를 동기화
            if (loadPosts) loadPosts(); 
            
            navigate(`/news/event`); 
        } catch (err) {
            alert("게시글 삭제 중 오류가 발생했습니다.");
        }
    };

    const handleLikeToggle = async () => {
        if(!isLoggedIn) return alert("로그인이 필요한 서비스입니다.");
        try {
            // 이벤트 전용 추천 API 호출
            const res = await axios.post(`${SERVER_URL}/api/event/posts/${poNum}/like`, { mbNum: currentUserNum });
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

    if (loading) return <div className="loading-box" style={{textAlign: 'center', padding: '100px'}}>데이터 로딩 중...</div>;
    if (!post) return <div className="loading-box" style={{textAlign: 'center', padding: '100px'}}>게시글을 찾을 수 없습니다.</div>;

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
                        <span>작성일 {post.po_date ? new Date(post.po_date).toLocaleString() : ''}</span>
                    </div>
                </div>
                
                <div className="detail-body-text">
                    {/* 🚩 가공된 content를 적용하여 이미지 경로 유실 방지 */}
                    <div dangerouslySetInnerHTML={{ __html: formatContent(post.po_content) }} />
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
                                <button 
                                    className="btn-edit-action" 
                                    onClick={() => navigate(`/news/event/write`, { 
                                        state: { mode: 'edit', postData: post, boardType: 'event' } 
                                    })}
                                >
                                    ✏️ 수정
                                </button>
                                <button className="btn-delete-action" onClick={handleDeletePost}>🗑️ 삭제</button>
                            </>
                        )}
                    </div>
                    <button className="btn-list-return" onClick={() => navigate(`/news/event`)}>목록으로</button>
                </div>
            </div>
        </div>
    );
};

export default EventBoardDetail;