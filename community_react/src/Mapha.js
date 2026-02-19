import React, { useEffect, useRef, useMemo } from 'react'; // 🚩 useMemo 추가

// 🚩 [최적화] 컴포넌트가 리렌더링될 때마다 객체가 새로 생성되는 것을 방지하기 위해 밖으로 이동
const CATEGORY_CODES = {
  '식당': 'FD6',
  '카페': 'CE7',
  '숙박': 'AD5',
  '관광지': 'AT4'
};

function Mapha({ category, keyword }) {
  const mapContainer = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const infowindowRef = useRef(null);

  // 🚩 [수정] useEffect 내부에서 안전하게 참조할 수 있도록 상수로 관리하거나 useMemo 사용
  const codes = useMemo(() => CATEGORY_CODES, []);

  useEffect(() => {
    const { kakao } = window;
    if (!kakao || !kakao.maps) return;

    kakao.maps.load(() => {
      // 1. 지도 초기화
      if (!mapInstance.current) {
        const options = {
          center: new kakao.maps.LatLng(33.3617, 126.5292), // 초기 중심: 제주도
          level: 9 
        };
        mapInstance.current = new kakao.maps.Map(mapContainer.current, options);
        infowindowRef.current = new kakao.maps.InfoWindow({ zIndex: 1 });
      }

      const map = mapInstance.current;
      const ps = new kakao.maps.services.Places();
      const infowindow = infowindowRef.current;

      const removeMarkers = () => {
        if (markersRef.current) {
          markersRef.current.forEach(m => m.setMap(null));
        }
        markersRef.current = [];
        if (infowindow) infowindow.close();
      };

      const displayInfoWindow = (marker, place) => {
        const detailUrl = "https://place.map.kakao.com/" + place.id;
        const phone = place.phone ? place.phone : "정보 없음";
        
        const content = `
          <div style="padding:15px; font-size:13px; border-radius:10px; min-width:200px; line-height:1.6; font-family: sans-serif;">
            <strong style="display:block; margin-bottom:6px; color:#333; font-size:15px;">${place.place_name}</strong>
            <div style="margin-bottom:10px;">
              <span style="display:block; font-size:11px; color:#666;">📍 ${place.address_name}</span>
              <span style="display:block; font-size:11px; color:#444;">📞 ${phone}</span>
              <span style="display:block; font-size:11px; color:#999;">🏷️ ${place.category_name}</span>
            </div>
            <a href="${detailUrl}" target="_blank" style="display:inline-block; background:#000; color:#fff; padding:6px 15px; border-radius:20px; text-decoration:none; font-size:11px; font-weight:bold;">
              상세정보 보기
            </a>
          </div>
        `;
        infowindow.setContent(content);
        infowindow.open(map, marker);
      };

      const placesSearchCB = (data, status) => {
        if (status === kakao.maps.services.Status.OK) {
          removeMarkers();
          const bounds = new kakao.maps.LatLngBounds();

          data.forEach(place => {
            const marker = new kakao.maps.Marker({
              map: map,
              position: new kakao.maps.LatLng(place.y, place.x)
            });

            kakao.maps.event.addListener(marker, 'click', () => {
              displayInfoWindow(marker, place);
              map.panTo(new kakao.maps.LatLng(place.y, place.x));
            });

            markersRef.current.push(marker);
            bounds.extend(new kakao.maps.LatLng(place.y, place.x));
          });

          if (keyword) {
            map.setBounds(bounds);
          }
        } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
          removeMarkers();
        }
      };

      // 2. 실행 로직
      if (keyword) {
        ps.keywordSearch(keyword, placesSearchCB);
      } else if (category && codes[category]) {
        ps.categorySearch(codes[category], placesSearchCB, {
          useMapBounds: true 
        });
      }
      
      setTimeout(() => {
        if (mapInstance.current) mapInstance.current.relayout();
      }, 100);
    });
  }, [category, keyword, codes]); // 🚩 의존성 배열에 codes 추가하여 경고 해결

  return (
    <div 
      ref={mapContainer} 
      style={{ width: '100%', height: '100%', borderRadius: '15px', border: '1px solid #ddd' }} 
    />
  );
}

export default Mapha;