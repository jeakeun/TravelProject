import React from 'react';
import { Link} from "react-router-dom";
import './NavigationBar.css';

const NavigationBar = () => {
  const [recentPosts, setRecentPosts] = useState([]);
  const location = useLocation(); // 경로가 바뀔 때마다 데이터를 새로고침하기 위함

    const scrollToTop = () => {
      window.scrollTo({
        top:0,
        behavior: 'smooth' // 스크롤이 부드럽게 되도록 사용
      });
    };

    // 최근 본 게시물 업데이트 로직
   useEffect(() => {
    if (user) {
      // user 객체에서 ID(mb_num 등)를 추출 (유틸리티 함수 형식에 맞게)
      const userId = user.mbNum || user.mb_num || user.id;
      // 최대 3개만 가져오기
      const recent = getRecentViews(3, userId);
      setRecentPosts(recent);
    } else {
      setRecentPosts([]);
    }
  }, [user, location.pathname]); // 유저가 바뀌거나, 다른 페이지로 이동할 때마다 갱신

    const navItems = [
    /* 1. 인기 명소: /domestic 경로 적용 */
    { id: 1, name: '인기 명소', icon: '⛰️', url: '/domestic', isExternal: false },
    /* 2. 날씨 정보: 외부 링크 (새 탭) */
    { id: 2, name: '날씨 정보', icon: '🌤️', url: 'https://weather.naver.com/', isExternal: true },
    /* 3. 환율 계산: 외부 링크 (새 탭) */
    { id: 3, name: '환율 계산', icon: '💵', url: 'https://search.naver.com/search.naver?query=환율', isExternal: true },
    /* 4. 여행 게시판: /community/recommend 경로 적용 */
    { id: 4, name: '여행 게시판', icon: '🗒️', url: '/community/recommend', isExternal: false },
    /* 5. 고객 센터: /cscenter/faq 경로 적용 */
    { id: 5, name: '고객 센터', icon: '💬', url: '/cscenter/faq', isExternal: false }
  ];

  // boardType에 따라 상세 페이지 경로를 생성하는 함수
  const getDetailPath = (post) => {
    // 프로젝트의 Route 구조에 맞춰 경로 매핑
    if (post.boardType === 'freeboard') return `/community/freeboard/${post.poNum}`;
    if (post.boardType === 'recommend') return `/community/recommend/${post.poNum}`;
    if (post.boardType === 'notice') return `/news/notice/${post.poNum}`;
    return `/community/freeboard/${post.poNum}`; // 기본값
  };

  return (
    <nav className="side-nav-rect">
      <div 
        className="side-nav-title" 
        onClick={scrollToTop}
        style={{cursor: 'pointer'}}
        >
          TOP ▲
        </div>
      <ul className="side-nav-list-rect">
        {navItems.map((item) => (
          <li key={item.id} className="side-nav-item-rect">
            {item.isExternal ? (
              /* 외부 링크를 가기위해 a태그 사용 */
              <a 
                href={item.url}
                className="side-nav-btn-rect"
                target="_blank"  /* 외부 링크를 가기위해 새 탭에서 열기 */
                rel="noopener noreferrer" /* 보안 및 성능을 위한 필수 설정 */
              >
                  <span className="icon-rect">{item.icon}</span>
                  <span className="text-rect">{item.name}</span>
              </a>
            ) : (
              /* 내부 링크는 Link를 사용해서 현재 페이지에서 부드럽게 이동 */
              <Link to={item.url} className="side-nav-btn-rect">
                <span className="icon-rect">{item.icon}</span>
                <span className="text-rect">{item.name}</span>
              </Link>
            )}
          </li>
        ))}
      </ul>
      {/* 🚩 하단 박스 3개 (최근 본 게시물) */}
      <div className="side-nav-footer-rect">
        {[0, 1, 2].map((idx) => {
          const post = recentPosts[idx];
          return post ? (
            <Link 
              key={idx} 
              to={getDetailPath(post)} 
              className="square-box recent-box"
              title={post.poTitle} // 마우스 올리면 전체 제목 표시
            >
              <span className="recent-text">{post.poTitle}</span>
            </Link>
          ) : (
            <div key={idx} className="square-box empty-box"></div>
          );
        })}
      </div>
    </nav>
  );
};

export default NavigationBar;