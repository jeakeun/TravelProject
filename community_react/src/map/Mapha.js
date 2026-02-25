import React, { useEffect, useRef, useMemo } from 'react';

// 🚩 카테고리 코드를 컴포넌트 외부로 이동하여 불필요한 재생성을 방지합니다.
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

  // 🚩 useMemo를 사용하여 CATEGORY_CODES 참조를 고정합니다.
  const codes = useMemo(() => CATEGORY_CODES, []);

  // 🚩 자동 배포 환경(HTTPS/도메인) 대응을 위한 서버 URL (필요 시 확장용)
  // const SERVER_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

  useEffect(() => {
    const { kakao } = window;
    // 카카오 객체가 로드되지 않았을 경우를 대비한 방어 코드
    if (!kakao || !kakao.maps) {
      console.error("카카오 지도 API가 로드되지 않았습니다. index.html의 스크립트를 확인하세요.");
      return;
    }

    kakao.maps.load(() => {
      // 1. 지도 초기화 (최초 1회 실행)
      if (!mapInstance.current) {
        const options = {
          // 🚩 지도의 초기 중심을 서울 시청 좌표로 설정
          center: new kakao.maps.LatLng(37.5665, 126.9780), 
          // 🚩 서울 전역이 한눈에 보이도록 확대 레벨을 9로 설정
          level: 9 
        };
        mapInstance.current = new kakao.maps.Map(mapContainer.current, options);
        infowindowRef.current = new kakao.maps.InfoWindow({ zIndex: 1 });
      }

      const map = mapInstance.current;
      const ps = new kakao.maps.services.Places();
      const infowindow = infowindowRef.current;

      // 기존 마커 및 인포윈도우 제거 함수
      const removeMarkers = () => {
        if (markersRef.current) {
          markersRef.current.forEach(m => m.setMap(null));
        }
        markersRef.current = [];
        if (infowindow) infowindow.close();
      };

      // 인포윈도우 표시 함수 (세련된 스타일 유지)
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

      // 장소 검색 결과 콜백 함수
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

          // 키워드 검색 시에만 지도 범위를 결과에 맞게 조정
          if (keyword) {
            map.setBounds(bounds);
          }
        } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
          removeMarkers();
        }
      };

      // 2. 검색 실행 로직
      if (keyword) {
        ps.keywordSearch(keyword, placesSearchCB);
      } else if (category && codes[category]) {
        ps.categorySearch(codes[category], placesSearchCB, {
          useMapBounds: true 
        });
      }
      
      // 🚩 배포 환경에서 컨테이너 크기 불일치로 지도가 깨지는 것을 방지하기 위해 재정렬 실행
      setTimeout(() => {
        map.relayout();
      }, 100);
    });
  }, [category, keyword, codes]); 

  return (
    <div 
      ref={mapContainer} 
      style={{ 
        width: '500px',        // 가로 사이즈 고정 유지
        height: '450px',       // 세로 사이즈 고정 유지
        borderRadius: '15px',  // 둥근 모서리 유지
        border: '1px solid #ddd', // 부드러운 테두리 유지
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)', // 그림자 효과 유지
        margin: '0',           // 왼쪽 정렬 유지
        overflow: 'hidden'     // 지도가 테두리 밖으로 나가지 않게 설정 유지
      }} 
    />
  );
}

export default Mapha;