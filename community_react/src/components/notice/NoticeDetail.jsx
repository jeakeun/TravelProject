import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { getMemberNum } from '../../utils/user';
// 🚩 디자인 통일을 위해 기존 CSS 유지
import './NoticeDetail.css';

const NoticeDetail = () => {
    // 🚩 App.jsx의 :poNum과 이름을 맞춥니다.
    const { poNum } = useParams(); 
    const navigate = useNavigate();
    const { user } = useOutletContext() || {};
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    // 추천 및 즐겨찾기 상태 관리를 위한 state
    const [isLiked, setIsLiked] = useState(false);
    const [isScrapped, setIsScrapped] = useState(false);

    const isLoggedIn = !!user;
    const currentUserNum = getMemberNum(user);
    // 🚩 관리자 여부 확인 (mbRol 또는 mb_rol 등 서버 규격에 맞게 보완 가능)
    const isAdmin = isLoggedIn && user.mbRol === 'ADMIN';

    const SERVER_URL = "";

    const formatContent = (content) => {
        if (!content) return "";
        return content.replace(/src="\/pic\//g, `src="${SERVER_URL}/pic/`);
    };

    const fetchDetail = useCallback(async () => {
        // 🚩 id 대신 poNum을 체크합니다.
        if (!poNum || poNum === 'undefined' || poNum === 'write') return;
        
        try {
            setLoading(true);
            // 🚩 API 경로에 poNum을 사용합니다.
            const res = await axios.get(`${SERVER_URL}/api/notice/posts/${poNum}?mbNum=${currentUserNum || 0}`, { withCredentials: true });
            setPost(res.data);
            // 서버 응답에서 본인의 추천/스크랩 상태를 받아와 설정
            setIsLiked(res.data.isLikedByMe);
            setIsScrapped(res.data.isScrappedByMe);
        } catch (err) {
            console.error("공지사항 로딩 에러:", err);
            alert("게시글을 불러올 수 없습니다.");
            navigate('/news/notice');
        } finally {
            setLoading(false);
        }
    }, [poNum, navigate, SERVER_URL, currentUserNum]);

    useEffect(() => { fetchDetail(); }, [fetchDetail]);

    // 추천 토글 함수
    const handleLike = async () => {
        if (!isLoggedIn) return alert("로그인이 필요한 서비스입니다.");
        try {
            // 🚩 poNum 사용
            const res = await axios.post(`${SERVER_URL}/api/notice/posts/${poNum}/like`, { mbNum: currentUserNum });
            setIsLiked(res.data.status === 'liked');
            // 실시간 추천 수 업데이트를 위해 상세 정보 재호출 또는 로컬 카운트 업데이트
            setPost(prev => ({ ...prev, nnUp: res.data.status === 'liked' ? prev.nnUp + 1 : prev.nnUp - 1 }));
        } catch (err) {
            alert("추천 처리 중 오류가 발생했습니다.");
        }
    };

    // 즐겨찾기(스크랩) 토글 함수
    const handleScrap = async () => {
        if (!isLoggedIn) return alert("로그인이 필요한 서비스입니다.");
        try {
            // 🚩 poNum 사용
            const res = await axios.post(`${SERVER_URL}/api/notice/posts/${poNum}/scrap`, { mbNum: currentUserNum });
            setIsScrapped(res.data.status === 'scrapped');
            alert(res.data.status === 'scrapped' ? "즐겨찾기에 추가되었습니다." : "즐겨찾기가 해제되었습니다.");
        } catch (err) {
            alert("즐겨찾기 처리 중 오류가 발생했습니다.");
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("삭제하시겠습니까?")) return;
        try {
            // 🚩 poNum 사용
            await axios.delete(`${SERVER_URL}/api/notice/posts/${poNum}`);
            alert("삭제되었습니다.");
            navigate('/news/notice');
        } catch (err) {
            alert("삭제에 실패했습니다.");
        }
    };

    if (loading) return <div className="loading-box" style={{textAlign: 'center', padding: '100px'}}>데이터 로딩 중...</div>;
    if (!post) return null;

    return (
        <div className="review-detail-wrapper">
            <div className="detail-container">
                
                {/* 헤더 섹션: 디자인 완벽 통일 */}
                <div className="detail-header-section">
                    <h1 className="detail-main-title">{post.nnTitle}</h1>
                    <div className="detail-sub-info">
                        <span>작성자: 관리자</span> 
                        <span className="info-divider">|</span>
                        <span>조회 {post.nnView}</span> 
                        <span className="info-divider">|</span>
                        <span>추천 {post.nnUp}</span>
                        <span className="info-divider">|</span>
                        <span>작성일 {new Date(post.nnDate).toLocaleString()}</span>
                    </div>
                </div>

                {/* 본문 섹션 */}
                <div className="detail-body-text">
                    <div dangerouslySetInnerHTML={{ __html: formatContent(post.nnContent) }} />
                </div>
                
                {/* 하단 버튼 영역 */}
                <div className="detail-bottom-actions">
                    <div className="left-group">
                        {/* 🚩 로그인한 모든 유저에게 추천/즐겨찾기 버튼 노출 */}
                        {isLoggedIn && (
                            <>
                                <button 
                                    className="btn-bookmark-action" 
                                    onClick={handleLike} 
                                    style={{ backgroundColor: isLiked ? '#ff4757' : '#f1f2f6', color: isLiked ? 'white' : 'black', marginRight: 8 }}
                                >
                                    {isLiked ? '❤️ 추천됨' : '🤍 추천하기'}
                                </button>
                                <button 
                                    className="btn-bookmark-action" 
                                    onClick={handleScrap}
                                    style={{ backgroundColor: isScrapped ? '#ffa502' : '#f1f2f6', color: isScrapped ? 'white' : 'black', marginRight: 8 }}
                                >
                                    {isScrapped ? '★ 즐겨찾기됨' : '☆ 즐겨찾기'}
                                </button>
                            </>
                        )}

                        {/* 🚩 오직 관리자(ADMIN)만 수정/삭제 가능 */}
                        {isAdmin && (
                            <>
                                <button 
                                    className="btn-edit-action" 
                                    onClick={() => navigate(`/news/notice/edit/${poNum}`)}
                                >
                                    ✏️ 수정
                                </button>
                                <button 
                                    className="btn-delete-action" 
                                    onClick={handleDelete}
                                >
                                    🗑️ 삭제
                                </button>
                            </>
                        )}
                    </div>
                    
                    {/* 우측 목록으로 버튼 */}
                    <button className="btn-list-return" onClick={() => navigate('/news/notice')}>
                        목록으로
                    </button>
                </div>

            </div>
        </div>
    );
};

export default NoticeDetail;