import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// 🚩 src/components 위치에서 src/map 폴더로 접근하기 위해 ../ 경로 사용
import Mapha from '../map/Mapha';

function MainList({ photos = [], setPhotos, activeMenu, setActiveMenu, menuItems, goToDetail }) {
  const [inputValue, setInputValue] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; 
  const navigate = useNavigate();

  // 지도 관련 상태 관리
  const [mapInput, setMapInput] = useState('');
  const [mapKeyword, setMapKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('식당');

  // 🚩 카테고리별 아이콘 정의
  const categoryIcons = {
    '식당': '🍴',
    '카페': '☕',
    '관광지': '🏛️',
    '숙박': '🏨'
  };

  // 🚩 기본 이미지 경로
  const FALLBACK_IMAGE = "https://placehold.co/300x200?text=No+Image";

  useEffect(() => {
    setAppliedSearch('');
    setInputValue('');
    setCurrentPage(1);
  }, [activeMenu]);

  const handleSearch = () => {
    setAppliedSearch(inputValue);
    setCurrentPage(1);
  };

  // 🚩 지도 장소 검색 로직
  const handleMapSearch = () => {
    if (!mapInput.trim()) return;
    setMapKeyword(mapInput);
    setSelectedCategory(null); // 키워드 검색 시 카테고리 선택 해제
  };

  const toggleFav = (e, id) => {
    e.stopPropagation();
    if (setPhotos) {
        setPhotos(prev => prev.map(p => p.postId === id ? { ...p, isFav: !p.isFav } : p));
    }
  };

  const handleLike = (e, id) => {
    e.stopPropagation();
    if (setPhotos) {
        setPhotos(prev => prev.map(p => {
          if (p.postId === id) {
            const currentlyLiked = p.likedByMe || false;
            return { 
              ...p, 
              likes: currentlyLiked ? (p.likes || 1) - 1 : (p.likes || 0) + 1, 
              likedByMe: !currentlyLiked 
            };
          }
          return p;
        }));
    }
  };

  // 서버의 poTitle 필드로 검색
  const filteredItems = useMemo(() => 
    photos.filter(p => (p.poTitle || p.title || "").toLowerCase().includes(appliedSearch.toLowerCase())), 
    [photos, appliedSearch]
  );
  
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;
  const currentItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // 검색창 디자인 스타일
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
    const menu = activeMenu.trim();
    if (menu === '이벤트' || menu === '이벤트 게시판') return '/news/event/write';
    if (menu === '뉴스레터') return '/news/newsletter/write';
    return '/community/write';
  };

  return (
    <div className="main-content-inner" style={{ width: '100%' }}>
      {/* 🚩 [수정] '국내여행' 메뉴일 때 지도 레이아웃 노출 */}
      {activeMenu.trim() === '국내여행' ? (
        <div className="map-section" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '20px' }}>
          
          {/* 1. 지도 상단 카테고리 필터 버튼 */}
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
                onClick={() => { setSelectedCategory(cat); setMapKeyword(''); setMapInput(''); }}
              >
                <span style={{ fontSize: '18px' }}>{categoryIcons[cat]}</span>
                {cat}
              </button>
            ))}
          </div>
          
          {/* 2. 지도 영역 */}
          <div style={{ 
            width: '500px', 
            height: '450px', 
            marginBottom: '25px', 
            borderRadius: '15px', 
            overflow: 'hidden', 
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            border: '1px solid #eee'
          }}>
            <Mapha category={selectedCategory} keyword={mapKeyword} />
          </div>

          {/* 3. 지도 하단 장소 검색창 */}
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
      ) : (
        <>
          {/* 게시판 목록 레이아웃 */}
          <div className="gallery-grid">
            {currentItems.length > 0 ? (
              currentItems.map((photo, idx) => {
                const virtualNum = filteredItems.length - ((currentPage - 1) * itemsPerPage + idx);

                return (
                  <div key={photo.postId || idx} className="photo-card" onClick={() => goToDetail(photo.postId)} style={{ position: 'relative' }}>
                    <span className="card-badge" style={{ 
                        position: 'absolute', top: '12px', left: '12px', background: 'rgba(0,0,0,0.7)', 
                        color: '#fff', padding: '3px 9px', borderRadius: '5px', fontSize: '11px', fontWeight: 'bold', zIndex: 5
                    }}>
                      No.{virtualNum}
                    </span>
                    <div className="img-placeholder">
                      <img src={photo.fileUrl || FALLBACK_IMAGE} alt="" onError={(e) => { e.target.src = FALLBACK_IMAGE; }} />
                    </div>
                    <div className="photo-info">
                      <strong className="photo-title">{photo.poTitle || photo.title}</strong>
                      <div className="info-actions">
                        <button onClick={(e) => toggleFav(e, photo.postId)} className="fav-btn" style={{ color: photo.isFav ? '#FFD700' : '#ccc' }}>
                          {photo.isFav ? '★' : '☆'}
                        </button>
                        <div className="info-bottom">
                          <span>👁️ {photo.poView || 0}</span>
                          <span onClick={(e) => handleLike(e, photo.postId)} style={{ color: photo.likedByMe ? '#ff4d4d' : '#666' }}>
                            {photo.likedByMe ? '❤️' : '🤍'} {photo.likes || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '100px 0', color: '#888' }}>등록된 게시글이 없습니다.</div>
            )}
          </div>

          <div className="page-buttons" style={{ marginTop: '24px' }}>
            <button className="pagination-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}>&lt;</button>
            {[...Array(totalPages)].map((_, i) => (
              <button key={i+1} className={`pagination-btn ${currentPage === i+1 ? 'active' : ''}`} onClick={() => setCurrentPage(i+1)}>{i+1}</button>
            ))}
            <button className="pagination-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}>&gt;</button>
          </div>

          {['여행 추천 게시판', '여행 후기 게시판', '자유 게시판', '이벤트', '뉴스레터'].includes(activeMenu.trim()) && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-30px', paddingRight: '20px' }}>
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
        </>
      )}
    </div>
  );
}

export default MainList;