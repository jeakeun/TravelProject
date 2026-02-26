import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { getMemberNum } from '../../utils/user';
// 🚩 에러 해결: 동일 폴더 내의 FAQDetail.css를 임포트하도록 수정
import './FAQDetail.css';

const FAQDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useOutletContext() || {};
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    // 추천 및 즐겨찾기 상태 관리를 위한 state
    const [isLiked, setIsLiked] = useState(false);
    const [isScrapped, setIsScrapped] = useState(false);

    const isLoggedIn = !!user;
    const currentUserNum = getMemberNum(user);
    // 🚩 관리자 여부 확인 (mbRol이 'ADMIN'인지 체크)
    const isAdmin = isLoggedIn && user.mbRol === 'ADMIN';

    // 🚩 AWS 자동 배포 환경 서버 URL 유지
    const SERVER_URL = "http://localhost:8080";

    const formatContent = (content) => {
        if (!content) return "";
        return content.replace(/src="\/pic\//g, `src="${SERVER_URL}/pic/`);
    };

    const fetchDetail = useCallback(async () => {
        if (!id || id === 'undefined' || id === 'write') return;
        
        try {
            setLoading(true);
            // 🚩 FAQ API 경로(/api/faq)로 변경 및 mbNum 쿼리 스트링 유지
            const res = await axios.get(`${SERVER_URL}/api/faq/posts/${id}?mbNum=${currentUserNum || 0}`, { withCredentials: true });
            setPost(res.data);
            // 서버 응답에서 본인의 추천/스크랩 상태를 받아와 설정
            setIsLiked(res.data.isLikedByMe);
            setIsScrapped(res.data.isScrappedByMe);
        } catch (err) {
            console.error("FAQ 로딩 에러:", err);
            alert("게시글을 불러올 수 없습니다.");
            navigate('/cscenter/faq');
        } finally {
            setLoading(false);
        }
    }, [id, navigate, SERVER_URL, currentUserNum]);

    useEffect(() => { fetchDetail(); }, [fetchDetail]);

    // 추천 토글 함수 (FAQ 경로로 변경)
    const handleLike = async () => {
        if (!isLoggedIn) return alert("로그인이 필요한 서비스입니다.");
        try {
            const res = await axios.post(`${SERVER_URL}/api/faq/posts/${id}/like`, { mbNum: currentUserNum });
            setIsLiked(res.data.status === 'liked');
            // 실시간 추천 수 업데이트 (poUp 필드 사용)
            setPost(prev => ({ ...prev, poUp: res.data.status === 'liked' ? prev.poUp + 1 : prev.poUp - 1 }));
        } catch (err) {
            alert("추천 처리 중 오류가 발생했습니다.");
        }
    };

    // 즐겨찾기(스크랩) 토글 함수 (FAQ 경로로 변경)
    const handleScrap = async () => {
        if (!isLoggedIn) return alert("로그인이 필요한 서비스입니다.");
        try {
            const res = await axios.post(`${SERVER_URL}/api/faq/posts/${id}/scrap`, { mbNum: currentUserNum });
            setIsScrapped(res.data.status === 'scrapped');
            alert(res.data.status === 'scrapped' ? "즐겨찾기에 추가되었습니다." : "즐겨찾기가 해제되었습니다.");
        } catch (err) {
            alert("즐겨찾기 처리 중 오류가 발생했습니다.");
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("삭제하시겠습니까?")) return;
        try {
            await axios.delete(`${SERVER_URL}/api/faq/posts/${id}`);
            alert("삭제되었습니다.");
            navigate('/cscenter/faq');
        } catch (err) {
            alert("삭제에 실패했습니다.");
        }
    };

    if (loading) return <div className="loading-box" style={{textAlign: 'center', padding: '100px'}}>데이터 로딩 중...</div>;
    if (!post) return null;

    return (
        <div className="faq-detail-wrapper">
            <div className="detail-container">
                
                {/* 헤더 섹션: 디자인 완벽 통일 */}
                <div className="detail-header-section">
                    <h1 className="detail-main-title">{post.poTitle}</h1>
                    <div className="detail-sub-info">
                        <span>작성자: 관리자</span> 
                        <span className="info-divider">|</span>
                        <span>조회 {post.poView}</span> 
                        <span className="info-divider">|</span>
                        <span>추천 {post.poUp}</span>
                        <span className="info-divider">|</span>
                        <span>작성일 {new Date(post.poDate).toLocaleString()}</span>
                    </div>
                </div>

                {/* 본문 섹션 */}
                <div className="detail-body-text">
                    <div dangerouslySetInnerHTML={{ __html: formatContent(post.poContent) }} />
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
                                    onClick={() => navigate(`/cscenter/faq/edit/${id}`)}
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
                    
                    {/* 우측 목록으로 버튼: FAQ 목록 경로로 수정 */}
                    <button className="btn-list-return" onClick={() => navigate('/cscenter/faq')}>
                        목록으로
                    </button>
                </div>

            </div>
        </div>
    );
};

export default FAQDetail;