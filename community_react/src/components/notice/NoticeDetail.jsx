import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { getMemberNum } from '../../utils/user'; 
// 🚩 자유게시판과 동일한 디자인 적용을 위해 CSS 및 구조 유지
import './NoticeDetail.css'; 

const NoticeDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useOutletContext() || {}; 
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    const isLoggedIn = !!user;
    const currentUserNum = getMemberNum(user);

    // 🚩 [수정] 자동 배포 환경을 위해 배포 서버 IP로 고정 설정
    const SERVER_URL = "http://3.37.160.108:8080";

    /**
     * 🚩 본문 내 이미지 경로를 영구 저장소 경로로 변환 (FreeBoardDetail과 동일 기능)
     * 에디터에서 삽입된 상대 경로(/pic/...)를 서버의 전체 URL로 변환
     */
    const formatContent = (content) => {
        if (!content) return "";
        return content.replace(/src="\/pic\//g, `src="${SERVER_URL}/pic/`);
    };

    const fetchDetail = useCallback(async () => {
        if (!id || id === 'undefined' || id === 'write') return;
        
        try {
            setLoading(true);
            // 🚩 고정된 SERVER_URL 사용 및 공지사항 엔드포인트 호출
            const res = await axios.get(`${SERVER_URL}/api/notice/posts/${id}`, { withCredentials: true });
            setPost(res.data);
        } catch (err) {
            console.error("공지사항 로딩 에러:", err);
            alert("게시글을 불러올 수 없습니다.");
            navigate('/news/notice');
        } finally {
            setLoading(false);
        }
    }, [id, navigate, SERVER_URL]);

    useEffect(() => { fetchDetail(); }, [fetchDetail]);

    const handleDelete = async () => {
        if (!window.confirm("삭제하시겠습니까?")) return;
        try {
            // 🚩 삭제 경로 배포 서버 주소로 수정
            await axios.delete(`${SERVER_URL}/api/notice/posts/${id}`);
            alert("삭제되었습니다.");
            navigate('/news/notice');
        } catch (err) {
            alert("삭제에 실패했습니다.");
        }
    };

    if (loading) return <div className="loading-box" style={{textAlign: 'center', padding: '100px'}}>데이터 로딩 중...</div>;
    if (!post) return null;

    // 공지사항 필드명(nnMbNum)에 맞춰 소유권 확인
    const isOwner = isLoggedIn && Number(post.nnMbNum) === Number(currentUserNum);

    return (
        <div className="review-detail-wrapper">
            <div className="detail-container">
                
                {/* 헤더 섹션: FreeBoardDetail과 디자인 통일 */}
                <div className="detail-header-section">
                    <h1 className="detail-main-title">{post.nnTitle}</h1>
                    <div className="detail-sub-info">
                        <span>작성자: User {post.nnMbNum}</span> 
                        <span className="info-divider">|</span>
                        <span>조회 {post.nnView}</span> 
                        <span className="info-divider">|</span>
                        <span>작성일 {new Date(post.nnDate).toLocaleString()}</span>
                    </div>
                </div>

                {/* 본문 섹션: 이미지 경로 치환 로직 적용 및 디자인 통일 */}
                <div className="detail-body-text">
                    <div dangerouslySetInnerHTML={{ __html: formatContent(post.nnContent) }} />
                </div>
                
                {/* 하단 버튼 영역: FreeBoardDetail과 레이아웃 및 클래스 완벽 통일 */}
                <div className="detail-bottom-actions">
                    <div className="left-group">
                        {isOwner && (
                            <>
                                <button 
                                    className="btn-edit-action" 
                                    onClick={() => navigate(`/news/notice/edit/${id}`)}
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
                    
                    {/* 우측 끝 '목록으로' 버튼 */}
                    <button className="btn-list-return" onClick={() => navigate('/news/notice')}>
                        목록으로
                    </button>
                </div>

            </div>
        </div>
    );
};

export default NoticeDetail;