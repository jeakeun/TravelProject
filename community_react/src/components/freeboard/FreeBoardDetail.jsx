import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { getMemberNum } from '../../utils/user';
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
        try {
            setLoading(true);
            const res = await axios.get(`http://localhost:8080/api/freeboard/posts/${id}`);
            setPost(res.data);
        } catch (err) {
            alert("게시글을 불러올 수 없습니다.");
            navigate('/community/freeboard');
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => { fetchDetail(); }, [fetchDetail]);

    if (loading) return <div style={{padding: '100px', textAlign: 'center'}}>로딩 중...</div>;
    if (!post) return null;

    const isOwner = isLoggedIn && Number(post.poMbNum) === Number(currentUserNum);

    return (
        <div className="freeboard-list-wrapper" style={{marginTop: '30px'}}>
            <div style={{background: '#fff', padding: '30px', borderRadius: '15px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)'}}>
                <h2 style={{fontSize: '1.8rem', marginBottom: '10px'}}>{post.poTitle}</h2>
                <div style={{color: '#888', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px'}}>
                    작성자: User {post.poMbNum} | 조회: {post.poView} | 날짜: {new Date(post.poDate).toLocaleString()}
                </div>
                <div style={{minHeight: '200px', lineHeight: '1.6'}} dangerouslySetInnerHTML={{ __html: post.poContent }} />
                
                <div className="board-footer-wrapper" style={{marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px'}}>
                    <div className="left-group" style={{display: 'flex', gap: '10px'}}>
                        {isOwner && <button className="nav-btn" onClick={() => navigate(`/community/freeboard/edit/${id}`)}>수정</button>}
                        {isOwner && <button className="nav-btn" style={{color: 'red'}} onClick={() => {/* 삭제로직 */}}>삭제</button>}
                    </div>
                    <button className="write-btn" onClick={() => navigate('/community/freeboard')}>목록으로</button>
                </div>
            </div>
        </div>
    );
};

export default FreeBoardDetail;