import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Kakaomap from './Kakaomap.jsx';

function MainList({ photos = [], setPhotos, activeMenu = '', setActiveMenu, menuItems, goToDetail, onAreaClick }) {
  const [inputValue, setInputValue] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; 
  const navigate = useNavigate();
  const location = useLocation();

  const SERVER_URL = process.env.REACT_APP_API_URL || "";

  // 지도 관련 상태 관리
  const [mapInput, setMapInput] = useState('');
  const [mapKeyword, setMapKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('식당');

  const categoryIcons = {
    '식당': '🍴',
    '카페': '☕',
    '관광지': '🏛️',
    '숙박': '🏨'
  };

  const FALLBACK_IMAGE = "https://placehold.co/300x200?text=No+Image";

  // 외부(TOP 5)에서 클릭 이벤트가 들어오면 이 함수를 실행하여 지도를 움직입니다.
  const handleExternalClick = useCallback((areaName) => {
    if (!areaName) return;
    setMapKeyword(areaName);      
    setSelectedCategory(null);   
    setMapInput(areaName);       
  }, []);

  useEffect(() => {
    if (onAreaClick && typeof onAreaClick === 'string') {
      handleExternalClick(onAreaClick);
    }
  }, [onAreaClick, handleExternalClick]);

  const isDomesticMode = useMemo(() => {
    const path = location.pathname.toLowerCase();
    const menuStr = (typeof activeMenu === 'string') ? activeMenu : (activeMenu?.name || '');
    return path.includes('domestic') || menuStr.includes('국내여행');
  }, [location.pathname, activeMenu]);

  const safeActiveMenu = useMemo(() => {
    if (!activeMenu || typeof activeMenu !== 'string') {
      return isDomesticMode ? '국내여행' : '해외여행';
    }
    return activeMenu.trim();
  }, [activeMenu, isDomesticMode]);

  useEffect(() => {
    setAppliedSearch('');
    setInputValue('');
    setCurrentPage(1);
  }, [activeMenu, location.pathname]);

  const handleSearch = () => {
    setAppliedSearch(inputValue);
    setCurrentPage(1);
  };

  const handleMapSearch = () => {
    if (!mapInput.trim()) return;
    setMapKeyword(mapInput);
    setSelectedCategory(null);
  };

  const toggleFav = (e, id) => {
    e.stopPropagation();
    if (setPhotos) {
      setPhotos(prev => {
        if (!Array.isArray(prev)) return [];
        return prev.map(p => {
          const postId = p.poNum || p.po_num || p.postId || p.id;
          return postId === id ? { ...p, isFav: !p.isFav } : p;
        });
      });
    }
  };

  const handleLike = (e, id) => {
    e.stopPropagation();
    if (setPhotos) {
      setPhotos(prev => {
        if (!Array.isArray(prev)) return [];
        return prev.map(p => {
          const postId = p.poNum || p.po_num || p.postId || p.id;
          if (postId === id) {
            const currentlyLiked = p.likedByMe || false;
            return { 
              ...p, 
              likes: currentlyLiked ? (p.likes || 1) - 1 : (p.likes || 0) + 1, 
              likedByMe: !currentlyLiked 
            };
          }
          return p;
        });
      });
    }
  };

  const filteredItems = useMemo(() => {
    const safePhotos = Array.isArray(photos) ? photos : [];
    return safePhotos.filter(p => {
      const title = p.poTitle || p.po_title || p.title || "";
      return title.toLowerCase().includes(appliedSearch.toLowerCase());
    });
  }, [photos, appliedSearch]);
  
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;
  const currentItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const searchBoxStyle = {
    display: 'flex',
    alignItems: 'center',
    width: '450px', 
    height: '45px',
    border: '2px solid #4a6a8a',
    borderRadius: '30px',
    padding: '3px 3px 3px 20px',
    backgroundColor: '#fff',
    boxSizing: 'border-box'
  };

  const searchInputStyle = {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: '14px',
    color: '#666'
  };

  const searchButtonStyle = {
    width: '80px',
    height: '100%',
    backgroundColor: '#4a6a8a',
    color: '#fff',
    border: 'none',
    borderRadius: '25px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '14px'
  };

  const getWritePath = () => {
    const menu = safeActiveMenu;
    if (menu === '이벤트' || menu === '이벤트 게시판') return '/news/event/write';
    if (menu === '뉴스레터') return '/news/newsletter/write';
    return '/community/write';
  };

  return (
    <div className="main-content-inner" style={{ width: '100%', minHeight: '600px' }}>
      {isDomesticMode ? (
        <div style={{ display: 'flex', padding: '20px', gap: '20px', alignItems: 'flex-start' }}>
          <div className="map-section" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
              {['식당', '카페', '관광지', '숙박'].map(cat => (
                <button 
                  key={cat} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    padding: '10px 22px', 
                    borderRadius: '30px', 
                    border: '1px solid #ddd', 
                    backgroundColor: selectedCategory === cat ? '#2c3e50' : '#fff', 
                    color: selectedCategory === cat ? '#fff' : '#2c3e50', 
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: selectedCategory === cat ? '0 4px 8px rgba(0,0,0,0.15)' : 'none'
                  }} 
                  // 🚩 [수정 포인트] 카테고리 클릭 시 mapKeyword를 비워줘야 Kakaomap에서 카테고리 검색이 작동합니다.
                  onClick={() => { 
                    setSelectedCategory(cat); 
                    setMapKeyword(''); // 키워드를 초기화하여 카테고리 검색 모드로 전환
                  }}
                >
                  <span style={{ fontSize: '18px' }}>{categoryIcons[cat]}</span>
                  {cat}
                </button>
              ))}
            </div>
            
            <div style={{ 
              width: '100%', 
              maxWidth: '850px', 
              height: '500px', 
              marginBottom: '25px', 
              borderRadius: '15px', 
              overflow: 'hidden', 
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
              border: '1px solid #eee',
              backgroundColor: '#f9f9f9',
              position: 'relative'
            }}>
              {window.kakao && window.kakao.maps ? (
                <Kakaomap 
                  category={selectedCategory} 
                  keyword={mapKeyword} 
                />
              ) : (
                <div style={{ width: '100%', height: '100%', display:'flex', justifyContent:'center', alignItems:'center', color:'#888', textAlign: 'center' }}>
                  카카오 지도를 불러오는 중입니다...<br/>(잠시만 기다려주세요)
                </div>
              )}
            </div>

            <div style={{ ...searchBoxStyle, marginTop: '10px' }}>
              <input 
                type="text" 
                placeholder="국내 여행지를 검색하세요." 
                style={searchInputStyle}
                value={mapInput} 
                onChange={(e) => setMapInput(e.target.value)} 
                onKeyPress={(e) => e.key === 'Enter' && handleMapSearch()} 
              />
              <button onClick={handleMapSearch} style={searchButtonStyle}>검색</button>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ padding: '20px' }}>
          <div className="gallery-grid">
            {currentItems.length > 0 ? (
              currentItems.map((photo, idx) => {
                const virtualNum = filteredItems.length - ((currentPage - 1) * itemsPerPage + idx);
                const postId = photo.poNum || photo.po_num || photo.postId || photo.id;
                const displayTitle = photo.poTitle || photo.po_title || photo.title;

                let displayImg = FALLBACK_IMAGE;
                if (photo.fileUrl) {
                  displayImg = photo.fileUrl;
                } else if (photo.poImg || photo.fileName) {
                  const targetImg = photo.poImg || photo.fileName;
                  const firstImgName = String(targetImg).split(',')[0].trim();
                  displayImg = firstImgName.startsWith('http') 
                    ? firstImgName 
                    : `${SERVER_URL}/pic/${firstImgName}`;
                }

                return (
                  <div key={postId || idx} className="photo-card" onClick={() => goToDetail && goToDetail(postId)} style={{ position: 'relative' }}>
                    <span className="card-badge" style={{ 
                        position: 'absolute', top: '12px', left: '12px', background: 'rgba(0,0,0,0.7)', 
                        color: '#fff', padding: '3px 9px', borderRadius: '5px', fontSize: '11px', fontWeight: 'bold', zIndex: 5
                    }}>
                      No.{virtualNum}
                    </span>
                    <div className="img-placeholder">
                      <img 
                        src={displayImg} 
                        alt={displayTitle} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { 
                          e.target.onerror = null; 
                          e.target.src = FALLBACK_IMAGE; 
                        }} 
                      />
                    </div>
                    <div className="photo-info">
                      <strong className="photo-title">{displayTitle}</strong>
                      <div className="info-actions">
                        <button onClick={(e) => toggleFav(e, postId)} className="fav-btn" style={{ color: photo.isFav ? '#FFD700' : '#ccc' }}>
                          {photo.isFav ? '★' : '☆'}
                        </button>
                        <div className="info-bottom">
                          <span>👁️ {photo.poView || photo.po_view || 0}</span>
                          <span onClick={(e) => handleLike(e, postId)} style={{ color: photo.likedByMe ? '#ff4d4d' : '#666', cursor: 'pointer' }}>
                            {photo.likedByMe ? '❤️' : '🤍'} {photo.likes || photo.poUp || photo.po_up || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '100px 0', color: '#888', fontSize: '18px', fontWeight: 'bold' }}>
                {safeActiveMenu && safeActiveMenu.includes('해외여행') ? "." : "등록된 게시글이 없습니다."}
              </div>
            )}
          </div>

          <div className="page-buttons" style={{ marginTop: '24px' }}>
            <button className="pagination-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}>&lt;</button>
            {[...Array(totalPages)].map((_, i) => (
              <button key={i+1} className={`pagination-btn ${currentPage === i+1 ? 'active' : ''}`} onClick={() => setCurrentPage(i+1)}>{i+1}</button>
            ))}
            <button className="pagination-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}>&gt;</button>
          </div>

          {safeActiveMenu && ['여행 추천 게시판', '여행 후기 게시판', '자유 게시판', '이벤트', '뉴스레터', '이벤트 게시판'].some(m => safeActiveMenu.includes(m)) && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-45px', paddingRight: '20px' }}>
              <button className="write-btn" onClick={() => navigate(getWritePath())}>글쓰기</button>
            </div>
          )}

          <div className="search-container" style={{ marginTop: '24px', display: 'flex', justifyContent: 'center' }}>
            <div style={searchBoxStyle}>
              <input 
                type="text" 
                placeholder="검색어를 입력하세요." 
                style={searchInputStyle}
                value={inputValue} 
                onChange={(e) => setInputValue(e.target.value)} 
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()} 
              />
              <button onClick={handleSearch} style={searchButtonStyle}>검색</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MainList;