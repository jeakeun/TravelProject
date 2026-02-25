import React, { useState, useEffect, useRef } from 'react';

function KakaoMap({ searchKeyword, isCategorySearch }) {
  const mapContainer = useRef(null);
  const [map, setMap] = useState(null);
  
  // 🚩 [에러 해결] markers 변수를 직접 사용하지 않으므로 [, setMarkers]로 작성하여 경고를 제거합니다.
  const [, setMarkers] = useState([]);
  const infowindowRef = useRef(null);

  useEffect(() => {
    const { kakao } = window;
    if (kakao && kakao.maps) {
      kakao.maps.load(() => {
        const options = { 
          center: new kakao.maps.LatLng(35.115, 129.042), 
          level: 4 
        };
        const newMap = new kakao.maps.Map(mapContainer.current, options);
        infowindowRef.current = new kakao.maps.InfoWindow({ zIndex: 1 });
        setMap(newMap);
      });
    }
  }, []);

  useEffect(() => {
    if (!map || !searchKeyword) return;

    const { kakao } = window;
    const ps = new kakao.maps.services.Places();
    const searchOptions = isCategorySearch ? { bounds: map.getBounds() } : {};

    ps.keywordSearch(searchKeyword, (data, status) => {
      if (status === kakao.maps.services.Status.OK) {
        
        // 이전 마커들을 지우기 위해 함수형 업데이트 사용
        setMarkers((prevMarkers) => {
          // 1. 기존 마커 지우기
          prevMarkers.forEach((marker) => marker.setMap(null));
          
          if (infowindowRef.current) {
            infowindowRef.current.close();
          }

          const newMarkers = [];
          const bounds = new kakao.maps.LatLngBounds();

          for (let i = 0; i < data.length; i++) {
            const position = new kakao.maps.LatLng(data[i].y, data[i].x);
            const marker = new kakao.maps.Marker({
              map: map,
              position: position,
            });

            kakao.maps.event.addListener(marker, 'click', () => {
              const content = `<div style="padding:10px; font-size:12px; border:none; min-width:150px;">
                                <strong>${data[i].place_name}</strong><br/>
                                ${data[i].address_name}
                               </div>`;
              infowindowRef.current.setContent(content);
              infowindowRef.current.open(map, marker);
            });

            newMarkers.push(marker);
            bounds.extend(position);
          }

          if (!isCategorySearch) {
            map.setBounds(bounds);
          }

          return newMarkers;
        });
      }
    }, searchOptions);
  }, [map, searchKeyword, isCategorySearch]); 

  return (
    <div 
      ref={mapContainer} 
      style={{ 
        width: '50%', 
        height: '450px', 
        borderRadius: '15px', 
        backgroundColor: '#f9f9f9', 
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)', 
        border: '1px solid #ddd' 
      }} 
    />
  );
}

export default KakaoMap;