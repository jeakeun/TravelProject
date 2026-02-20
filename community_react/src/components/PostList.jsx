import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import './PostList.css';

const PostList = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    // 게시글 목록 가져오기
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                // API 주소는 실제 프로젝트 설정에 맞게 수정하세요.
                const response = await api.get('http://localhost:8080/api/posts');
                // 최신글이 위로 오도록 정렬 (서버에서 정렬해서 보내주면 생략 가능)
                const sortedPosts = response.data.sort((a, b) => b.postId - a.postId);
                setPosts(sortedPosts);
            } catch (error) {
                console.error("게시글 로딩 실패:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    // 작성일 포맷팅 (YYYY.MM.DD)
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
    };

    if (loading) return <div className="loading-text">로딩 중...</div>;

    return (
        <div className="post-list-container">
            <div className="list-header">
                <h2>전체 게시글</h2>
                <Link to="/write" className="write-btn">글쓰기</Link>
            </div>

            <table className="post-table">
                <thead>
                    <tr>
                        <th className="th-num">번호</th>
                        <th className="th-title">제목</th>
                        <th className="th-author">작성자</th>
                        <th className="th-date">날짜</th>
                        <th className="th-view">조회</th>
                    </tr>
                </thead>
                <tbody>
                    {posts.length > 0 ? (
                        posts.map((post) => (
                            <tr key={post.postId}>
                                <td className="td-num">{post.postId}</td>
                                <td className="td-title">
                                    <Link to={`/post/${post.postId}`}>
                                        {post.title}
                                        {/* 🚩 댓글 개수 표시: 0보다 클 때만 노출 */}
                                        {post.commentCount > 0 && (
                                            <span className="comment-count-badge">
                                                [{post.commentCount}]
                                            </span>
                                        )}
                                    </Link>
                                </td>
                                <td className="td-author">User {post.userId}</td>
                                <td className="td-date">{formatDate(post.createdAt)}</td>
                                <td className="td-view">{post.viewCount}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" className="no-data">게시글이 없습니다.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default PostList;