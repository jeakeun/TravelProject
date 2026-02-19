import { useState, useEffect } from 'react';
import axios from 'axios';
import './Board.css';
import { Link, useNavigate } from "react-router-dom";

function Board() {
	const [photos, setPhotos] = useState([]);
	const navigate = useNavigate();

	useEffect(() => {
		// API 호출 (실패 시 더미 데이터 사용)
		axios.get('http://localhost:8080/api/photos')
			.then(res => setPhotos(res.data))
			.catch(() => {
				setPhotos([
					{ id: 1, title: "지각", url: "http://localhost:8080/pic/1.jpg" },
					{ id: 2, title: "조퇴", url: "http://localhost:8080/pic/2.jpg" },
					{ id: 3, title: "외출", url: "http://localhost:8080/pic/3.jpg" },
					{ id: 4, title: "결석1번", url: "http://localhost:8080/pic/4.jpg" },
					{ id: 5, title: "결석4번은", url: "http://localhost:8080/pic/5.jpg" },
					{ id: 6, title: "안대~", url: "http://localhost:8080/pic/6.jpg" },
				]);
			});
	}, []);

	const goPost = (id) => {
    // 모든 사진 클릭 시 같은 Post 페이지로 이동
    navigate(`/post`); 
    // 나중에 id별로 다른 포스트 페이지 만들고 싶으면 navigate(`/post/${id}`)
  }

	return (
		<div className="App">
			{/* ===== 헤더 ===== */}
      <header>
        <Link to="/" className="logo">TRAVEL</Link>

        <nav>
          <Link to="/destination">여행지</Link>
          <Link to="/board">추천</Link>       {/* 클릭 시 Board 페이지로 이동 */}
          <Link to="/community">커뮤니티</Link>
          <Link to="/ranking">랭킹</Link>
        </nav>

        <div className="user-menu">
          <span>KR ▾</span>
          <span>로그인</span>
          <span>회원가입</span>
        </div>
      </header>

			{/* 2. 중간 컨텐츠 영역 (사이드바 + 메인) */}
			<div className="container">
				<aside className="sidebar">
					<ul>
						<li>여행 추천 게시판</li>
						<li>여행 후기 게시판</li>
						<li>자유 게시판</li>
						<li>커뮤니티</li>
					</ul>
				</aside>

				<main className="main-content">
					<div className="gallery-grid">
						{photos.slice(0, 6).map(photo => (
							<div key={photo.id} className="photo-card"
							onClick={() => goPost(photo.id)}
							style={{ cursor: "pointer" }}>
								<div className="img-placeholder">
									<img src={photo.url} alt={photo.title} />
								</div>
								<div className="photo-info"><p>{photo.title}</p></div>
							</div>
						))}
					</div>

			 <footer className="site-footer">
					<div className="footer-content">
						<div className="footer-controls">
							<div className="search-bar">
								<input type="text" placeholder="검색어를 입력하세요" />
								<button>검색</button>
							</div>
							<div className="pagination">
								<button>이전</button>
								<span className="page-numbers">1 2 3 4 5</span>
								<button>다음</button>
							</div>
						</div>
						<p className="copyright">김진영바보. 그나저나 집에 가고싶어</p>
					</div>
				</footer>
				</main>
			</div>
		</div>

		
	);

	
}

export default Board;