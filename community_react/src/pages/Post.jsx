import React, { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import "./Post.css";
import Header from "../components/Header";

const Post = () => {
	const navigate = useNavigate();
	const outletContext = useOutletContext() || {};
	const { user, setShowLogin, setShowSignup, onLogout, currentLang, setCurrentLang } = outletContext;

	return (
		<div>
			{/* ===== 헤더 ===== */}
			<Header
				user={user}
				onLogout={onLogout}
				setShowLogin={setShowLogin}
				setShowSignup={setShowSignup}
				currentLang={currentLang || "KR"}
				setCurrentLang={setCurrentLang}
			/>

			{/* ===== 메인 ===== */}
			<main className="container">
				<div className="post-layout">

					{/* 왼쪽: 글 + 댓글 */}
					<div className="post-main">

						<article className="post">

							<h1 className="post-title">혼자 떠난 오사카 여행 후기</h1>

							<div className="post-info">
								<span>작성자: 홍길동</span>
								<span>2026-01-22</span>
								<span>조회수 123</span>
							</div>

							{/* 대표 이미지 */}
							<div className="post-thumbnail">대표 이미지</div>

							{/* 본문 */}
							<div className="post-content">
								<p>이번에 혼자 오사카 여행을 다녀왔습니다. 정말 너무 좋았고...</p>
								<p>도톤보리, 유니버설 스튜디오, 우메다까지 전부 돌아봤고요...</p>
								<p>혼자 여행하시는 분들께 정말 추천드립니다!</p>
							</div>

							{/* 좋아요 */}
							<div className="post-like">
								<button>👍 좋아요 24</button>
							</div>

							{/* 버튼 */}
							<div className="post-actions">
								<button onClick={() => navigate("/")}>목록으로</button>
								<div>
									<button>수정</button>
									<button>삭제</button>
								</div>
							</div>

						</article>

						{/* 댓글 */}
						<section className="comments">
							<h3>💬 댓글 2</h3>

							<div className="comment-write">
								<textarea placeholder="댓글을 입력하세요"></textarea>
								<button>등록</button>
							</div>

							<div className="comment-list">

								<div className="comment-item">
									<div className="comment-author">김철수</div>
									<div className="comment-text">와... 저도 혼자 가보고 싶네요!</div>
								</div>

								<div className="comment-item">
									<div className="comment-author">이영희</div>
									<div className="comment-text">사진도 올려주세요!</div>
								</div>

							</div>
						</section>

					</div>

					{/* 오른쪽: 사이드바 */}
					<aside className="post-side">

						<div className="side-box">
							<h3>🔥 인기글</h3>
							<ul>
								<li>오사카 혼자 여행 후기</li>
								<li>제주 커플 여행 코스</li>
								<li>부산 맛집 투어</li>
								<li>도쿄 여행 질문</li>
								<li>강릉 혼행 추천</li>
							</ul>
						</div>

						<div className="side-box">
							<h3>🏷 인기 태그</h3>
							<div className="tags">
								<span>#혼자여행</span>
								<span>#커플여행</span>
								<span>#맛집</span>
								<span>#힐링</span>
								<span>#가성비</span>
							</div>
						</div>

					</aside>

				</div>
			</main>
		</div>
	);
};

export default Post;
