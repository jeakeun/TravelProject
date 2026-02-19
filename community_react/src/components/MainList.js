import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Mapha from '../Mapha';

function MainList({ photos = [], setPhotos, activeMenu, setActiveMenu, menuItems, goToDetail }) {
  const [inputValue, setInputValue] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; 
  const navigate = useNavigate();

  const [mapInput, setMapInput] = useState('');
  const [mapKeyword, setMapKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('식당');

  const FALLBACK_IMAGE = "https://placehold.co";

  useEffect(() => {
    setAppliedSearch('');
    setInputValue('');
    setCurrentPage(1);
  }, [activeMenu]);

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
    setPhotos(prev => prev.map(p => p.postId === id ? { ...p, isFav: !p.isFav } : p));
  };

  const handleLike = (e, id) => {
    e.stopPropagation();
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
  };

  const filteredItems = useMemo(() => 
    photos.filter(p => (p.title || "").toLowerCase().includes(appliedSearch.toLowerCase())), 
    [photos, appliedSearch]
  );
  
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;
  const currentItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="main-content-inner" style={{ width: '100%' }}>
      {activeMenu === '여행 추천 지도' ? (
        <div className="map-section">
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            {['식당', '숙박', '관광지', '카페'].map(cat => (
              <button key={cat} style={{ padding: '8px 20px', borderRadius: '20px', border: '1px solid #ddd', backgroundColor: selectedCategory === cat ? '#000' : '#fff', color: selectedCategory === cat ? '#fff' : '#000', cursor: 'pointer' }} onClick={() => { setSelectedCategory(cat); setMapKeyword(''); }}>
                {cat}
              </button>
            ))}
          </div>
          <div style={{ width: '100%', height: '550px', marginBottom: '25px', borderRadius: '15px', overflow: 'hidden', border: '1px solid #ddd' }}>
            <Mapha category={selectedCategory} keyword={mapKeyword} />
          </div>
          <div className="search-box" style={{ margin: '0 auto' }}>
            <input type="text" placeholder="지도 내 장소 검색" value={mapInput} onChange={(e) => setMapInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleMapSearch()} />
            <button onClick={handleMapSearch}>검색</button>
          </div>
        </div>
      ) : (
        <>
          <div className="gallery-grid">
            {currentItems.length > 0 ? (
              currentItems.map((photo, idx) => {
                const virtualNum = filteredItems.length - ((currentPage - 1) * itemsPerPage + idx);

                return (
                  /* 🚩 [수정 포인트 1] 부모인 photo-card에 position: relative를 명시하여 
                        자식 요소인 No. 배지가 이 카드 안에서만 움직이도록 고정합니다. */
                  <div key={photo.postId || idx} className="photo-card" onClick={() => goToDetail(photo.postId)} style={{ position: 'relative' }}>
                    
                    {/* 🚩 [수정 포인트 2] 배지 위치를 카드 이미지 좌측 상단에 명확하게 고정합니다. */}
                    <span className="card-badge" style={{ 
                        position: 'absolute', 
                        top: '12px', 
                        left: '12px', 
                        background: 'rgba(0,0,0,0.7)', 
                        color: '#fff', 
                        padding: '3px 9px', 
                        borderRadius: '5px', 
                        fontSize: '11px', 
                        fontWeight: 'bold',
                        zIndex: 5
                    }}>
                      No.{virtualNum}
                    </span>

                    <div className="img-placeholder">
                      <img src={photo.fileUrl || FALLBACK_IMAGE} alt="" onError={(e) => e.target.src = FALLBACK_IMAGE} />
                    </div>
                    <div className="photo-info">
                      <strong className="photo-title">{photo.title}</strong>
                      <div className="info-actions">
                        <button onClick={(e) => toggleFav(e, photo.postId)} className="fav-btn" style={{ color: photo.isFav ? '#FFD700' : '#ccc' }}>
                          {photo.isFav ? '★' : '☆'}
                        </button>
                        <div className="info-bottom">
                          <span>👁️ {photo.viewCount || 0}</span>
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

          <div className="pagination" style={{ marginTop: '40px' }}>
            <button className="pagination-btn nav-btn" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}>이전</button>
            {[...Array(totalPages)].map((_, i) => (
              <button key={i+1} className={`pagination-btn ${currentPage === i+1 ? 'active' : ''}`} onClick={() => setCurrentPage(i+1)}>{i+1}</button>
            ))}
            <button className="pagination-btn nav-btn" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}>다음</button>
          </div>

          {['여행 추천 게시판', '여행 후기 게시판', '자유 게시판', '커뮤니티'].includes(activeMenu.trim()) && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-45px', paddingRight: '20px' }}>
              <button className="write-btn" onClick={() => navigate('/community/write')}>글쓰기</button>
            </div>
          )}

          <div className="search-container" style={{ marginTop: '50px' }}>
            <div className="search-box">
              <input type="text" placeholder={`${activeMenu} 내 검색`} value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSearch()} />
              <button onClick={handleSearch}>검색</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default MainList;