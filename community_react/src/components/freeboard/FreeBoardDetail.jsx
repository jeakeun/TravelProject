import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import axios from 'axios';
import './FreeBoardDetail.css'; 

const FreeBoardDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useOutletContext() || {}; 
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    const isLoggedIn = !!user;
    const currentUserNum = getMemberNum(user);

    const fetchDetail = useCallback(async () => {
        if (id === 'write') {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const res = await axios.get(`http://localhost:8080/api/freeboard/posts/${id}`);
            setPost(res.data);
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

                {/* 본문 섹션 */}
                <div className="detail-body-text">
                    <div dangerouslySetInnerHTML={{ __html: post.poContent }} />
                </div>
                
                {/* 🚩 하단 버튼 영역: 리뷰보드(ReviewBoard)와 레이아웃/클래스 완벽 통일 */}
                <div className="detail-bottom-actions">
                    <div className="left-group">
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
                                    onClick={() => { if(window.confirm("삭제하시겠습니까?")) { /* 삭제 로직 */ } }}
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