import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import axios from 'axios';

// 1. 카테고리 코드 정의
const CATEGORY_CODES = {
  '식당': 'FD6',
  '카페': 'CE7',
  '숙박': 'AD5',
  '관광지': 'AT4'
};

function Kakaomap({ category, keyword }) {
  const mapContainer = useRef(null);
  const mapInstance = useRef(null);
  const searchMarkersRef = useRef([]); // 검색 결과 마커 관리
  const dbMarkersRef = useRef([]);     // DB 데이터 마커 관리
  const infowindowRef = useRef(null);
  const resizeHandlerRef = useRef(null);

  const codes = useMemo(() => CATEGORY_CODES, []);

  // [기능] DB 데이터 불러오기 함수 (의존성 경고 방지를 위해 useCallback 사용)
  const fetchDbPlaces = useCallback(async (map) => {
    try {
      const baseUrl = process.env.REACT_APP_API_URL || "";
      const response = await axios.get(`${baseUrl}/api/map/places`).catch(err => {
        console.warn("데이터 로드 실패: 지도는 빈 상태로 유지됩니다.", err.message);
        return { data: [] };
      });

      const dbPlaces = response.data;
      if (!dbPlaces || !Array.isArray(dbPlaces)) return;

      // 기존 DB 마커 제거
      dbMarkersRef.current.forEach(m => m.setMap(null));
      dbMarkersRef.current = [];

      dbPlaces.forEach(place => {
        const lat = place.kmLat ?? place.lat;
        const lng = place.kmLng ?? place.lng;
        if (lat == null || lng == null) return;

        const marker = new window.kakao.maps.Marker({
          map: map,
          position: new window.kakao.maps.LatLng(lat, lng),
        });

        window.kakao.maps.event.addListener(marker, 'click', () => {
          const content = `
            <div style="padding:15px; font-size:13px; min-width:200px; line-height:1.6; border:none;">
              <strong style="
                display: -webkit-box;
                -webkit-line-clamp: 1;
                -webkit-box-orient: vertical;
                overflow: hidden;
                text-overflow: ellipsis;
                color:#007bff;
              ">[우리 추천] ${place.kmName || place.placeName || '장소'}</strong>
              <small style="
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
                text-overflow: ellipsis;
                margin-top: 4px;
              ">📍 ${place.kmAddress || place.address || '주소 정보 없음'}</small>
              <span style="font-size:11px; color:#666; display: block; margin-top: 4px;">🏷️ ${place.kmCategory || place.category || ''}</span>
            </div>`;
          if (infowindowRef.current) {
            infowindowRef.current.setContent(content);
            infowindowRef.current.open(map, marker);
          }
        });

        dbMarkersRef.current.push(marker);
      });
    } catch (err) {
      console.error("DB 데이터 처리 중 에러 발생:", err);
    }
  }, []);

  // [기능 1] 지도 초기화 및 DB 데이터 불러오기
  useEffect(() => {
    const { kakao } = window;

    if (!kakao || !kakao.maps) {
      console.warn("카카오 지도 SDK 로딩 대기 중...");
      return;
    }

    kakao.maps.load(() => {
      if (!mapContainer.current) return;

      try {
        if (!mapInstance.current) {
          const options = {
            center: new kakao.maps.LatLng(37.5665, 126.9780),
            level: 8
          };
          const map = new kakao.maps.Map(mapContainer.current, options);
          mapInstance.current = map;
          infowindowRef.current = new kakao.maps.InfoWindow({ zIndex: 5 });
          
          fetchDbPlaces(map);
        }

        setTimeout(() => {
          if (mapInstance.current) {
            mapInstance.current.relayout();
            if (!keyword && !category) {
              mapInstance.current.setCenter(new kakao.maps.LatLng(37.5665, 126.9780));
            }
          }
        }, 100);

      } catch (fatalError) {
        console.error("지도 초기화 치명적 오류:", fatalError);
      }
    });

    const currentResizeHandler = () => {
      if (mapInstance.current) mapInstance.current.relayout();
    };
    resizeHandlerRef.current = currentResizeHandler;
    window.addEventListener('resize', currentResizeHandler);

    return () => {
      window.removeEventListener('resize', currentResizeHandler);
    };
  }, [fetchDbPlaces, category, keyword]);

  // [기능 2] 키워드 및 카테고리 실시간 검색 로직
  useEffect(() => {
    const { kakao } = window;
    if (!kakao || !kakao.maps || !mapInstance.current) return;

    // 🚩 마커 제거 함수 정의
    const removeSearchMarkers = () => {
      if (searchMarkersRef.current.length > 0) {
        searchMarkersRef.current.forEach(m => m.setMap(null));
        searchMarkersRef.current = [];
      }
      if (infowindowRef.current) infowindowRef.current.close();
    };

    kakao.maps.load(() => {
      const map = mapInstance.current;
      const ps = new kakao.maps.services.Places();
      const infowindow = infowindowRef.current;

      const displayInfoWindow = (marker, place) => {
        const detailUrl = `https://place.map.kakao.com/${place.id}`;
        const content = `
          <div style="padding:15px; font-size:13px; border-radius:10px; min-width:200px; line-height:1.6;">
            <strong style="
              display: -webkit-box;
              -webkit-line-clamp: 1;
              -webkit-box-orient: vertical;
              overflow: hidden;
              text-overflow: ellipsis;
              margin-bottom:6px; 
              color:#333;
            ">${place.place_name}</strong>
            <span style="
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              overflow: hidden;
              text-overflow: ellipsis;
              font-size:11px; 
              color:#666;
            ">📍 ${place.address_name}</span>
            <a href="${detailUrl}" target="_blank" style="display:inline-block; margin-top:10px; background:#333; color:#fff; padding:4px 10px; border-radius:4px; text-decoration:none; font-size:11px;">상세보기</a>
          </div>`;
        infowindow.setContent(content);
        infowindow.open(map, marker);
      };

      const placesSearchCB = (data, status) => {
        if (status === kakao.maps.services.Status.OK) {
          // 검색 결과 직전에 한 번 더 초기화 (중복 방지)
          removeSearchMarkers();
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

            searchMarkersRef.current.push(marker);
            bounds.extend(new kakao.maps.LatLng(place.y, place.x));
          });

          if (keyword) map.setBounds(bounds);
        }
      };

      // 새로운 검색 시작 시 즉시 제거
      removeSearchMarkers();

      if (keyword) {
        ps.keywordSearch(keyword, placesSearchCB);
      } else if (category && codes[category]) {
        ps.categorySearch(codes[category], placesSearchCB, { useMapBounds: true });
      }
    });

    // 🚩 [핵심 수정] Cleanup 함수: 탭이나 키워드가 바뀌어 이 useEffect가 다시 실행되기 직전에 
    // 이전 마커들을 지도에서 명시적으로 지웁니다.
    return () => {
      removeSearchMarkers();
    };
  }, [category, keyword, codes]);

  return (
    <div 
      ref={mapContainer} 
      style={{ 
        width: '100%', 
        height: '500px', 
        minHeight: '500px', 
        borderRadius: '15px', 
        border: '1px solid #ddd', 
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#f9f9f9',
        zIndex: 1
      }} 
    />
  );
}

export default Kakaomap;