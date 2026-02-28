import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { getMemberNum } from '../../utils/user';
import './FAQDetail.css';

const FAQDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useOutletContext() || {};
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    const [isLiked, setIsLiked] = useState(false);
    const [isScrapped, setIsScrapped] = useState(false);

    const isLoggedIn = !!user;
    const currentUserNum = getMemberNum(user);
    
    /**
     * 🚩 관리자 여부 확인
     */
    const isAdmin = useMemo(() => {
        if (!user) return false;
        const role = user.mb_rol || user.mbRol || user.mbRole || "";
        return role.toUpperCase() === 'ADMIN';
    }, [user]);

    const SERVER_URL = "";

    const formatContent = (content) => {
        if (!content) return "";
        return content.replace(/src="\/pic\//g, `src="${SERVER_URL}/pic/`);
    };

    const fetchDetail = useCallback(async () => {
        // 글쓰기 모드('write')일 경우 즉시 로딩 해제
        if (id === 'write') {
            setLoading(false);
            return;
        }

        // id가 없거나 비정상적일 경우 리스트로 튕기기
        if (!id || id === 'undefined') {
            navigate('/cscenter/faq');
            return;
        }
        
        try {
            setLoading(true);
            const res = await axios.get(`${SERVER_URL}/api/faq/posts/${id}?mbNum=${currentUserNum || 0}`, { withCredentials: true });
            if (res.data) {
                setPost(res.data);
                setIsLiked(res.data.isLikedByMe);
                setIsScrapped(res.data.isScrappedByMe);
            }
        } catch (err) {
            console.error("FAQ 로딩 에러:", err);
            alert("게시글을 불러올 수 없습니다.");
            navigate('/cscenter/faq');
        } finally {
            setLoading(false);
        }
    }, [id, navigate, SERVER_URL, currentUserNum]);

    useEffect(() => { 
        fetchDetail(); 
    }, [fetchDetail]);

    const handleLike = async () => {
        if (!isLoggedIn) return alert("로그인이 필요한 서비스입니다.");
        try {
            const res = await axios.post(`${SERVER_URL}/api/faq/posts/${id}/like`, { mbNum: currentUserNum });
            setIsLiked(res.data.status === 'liked');
            setPost(prev => ({ ...prev, poUp: res.data.status === 'liked' ? (prev.poUp || 0) + 1 : Math.max(0, (prev.poUp || 0) - 1) }));
        } catch (err) {
            alert("추천 처리 중 오류가 발생했습니다.");
        }
    };

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

    // 로딩 중일 때 표시
    if (loading) {
        return <div className="loading-box" style={{textAlign: 'center', padding: '100px'}}>데이터 로딩 중...</div>;
    }
    
    // 데이터가 없고 글쓰기 모드도 아닐 때의 방어 로직 (null 대신 로딩 메시지 유지 혹은 빈 화면 방지)
    if (!post && id !== 'write') {
        return <div className="loading-box" style={{textAlign: 'center', padding: '100px'}}>게시글을 찾을 수 없습니다.</div>;
    }

    return (
        <div className="faq-detail-wrapper">
            <div className="detail-container">
                
                <div className="detail-header-section">
                    <h1 className="detail-main-title">
                        {id === 'write' ? '새 글 작성' : (post?.poTitle || '제목 없음')}
                    </h1>
                    {post && id !== 'write' && (
                        <div className="detail-sub-info">
                            <span>작성자: {post.mbNickname || '관리자'}</span> 
                            <span className="info-divider">|</span>
                            <span>조회 {post.poView || 0}</span> 
                            <span className="info-divider">|</span>
                            <span>추천 {post.poUp || 0}</span>
                            <span className="info-divider">|</span>
                            <span>작성일 {post.poDate ? new Date(post.poDate).toLocaleString() : ""}</span>
                        </div>
                    )}
                </div>

                <div className="detail-body-text">
                    <div dangerouslySetInnerHTML={{ __html: formatContent(post?.poContent || "") }} />
                </div>
                
                <div className="detail-bottom-actions">
                    <div className="left-group">
                        {isLoggedIn && post && id !== 'write' && (
                            <>
                                <button 
                                    className="btn-bookmark-action" 
                                    onClick={handleLike} 
                                    style={{ 
                                        backgroundColor: isLiked ? '#ff4757' : '#f1f2f6', 
                                        color: isLiked ? 'white' : 'black', 
                                        marginRight: 8 
                                    }}
                                >
                                    {isLiked ? '❤️ 추천됨' : '🤍 추천하기'}
                                </button>
                                <button 
                                    className="btn-bookmark-action" 
                                    onClick={handleScrap}
                                    style={{ 
                                        backgroundColor: isScrapped ? '#ffa502' : '#f1f2f6', 
                                        color: isScrapped ? 'white' : 'black', 
                                        marginRight: 8 
                                    }}
                                >
                                    {isScrapped ? '★ 즐겨찾기됨' : '☆ 즐겨찾기'}
                                </button>
                            </>
                        )}

                        {isAdmin && post && id !== 'write' && (
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
                    
                    <button className="btn-list-return" onClick={() => navigate('/cscenter/faq')}>
                        목록으로
                    </button>
                </div>

            </div>
        </div>
    );
};

export default FAQDetail;