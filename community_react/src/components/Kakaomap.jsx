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
  
  // 🚩 현재 지도의 중심 위치를 추적하기 위한 Ref (튕김 방지)
  const currentCenterRef = useRef(new window.kakao.maps.LatLng(37.5665, 126.9780));

  const codes = useMemo(() => CATEGORY_CODES, []);

  // [기능] DB 데이터 불러오기 함수 (우리 추천 장소)
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
          // DB 마커는 별점 모양 이미지로 구분 (선택 사항)
          image: new window.kakao.maps.MarkerImage(
            'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png',
            new window.kakao.maps.Size(24, 35)
          )
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
    if (!kakao || !kakao.maps) return;

    kakao.maps.load(() => {
      if (!mapContainer.current) return;

      if (!mapInstance.current) {
        const options = {
          center: currentCenterRef.current, 
          level: 4 
        };
        const map = new kakao.maps.Map(mapContainer.current, options);
        mapInstance.current = map;
        infowindowRef.current = new kakao.maps.InfoWindow({ zIndex: 10 });
        
        // 사용자가 지도를 움직일 때마다 현재 중심 좌표를 실시간으로 Ref에 동기화
        kakao.maps.event.addListener(map, 'idle', () => {
          currentCenterRef.current = map.getCenter();
        });

        fetchDbPlaces(map);
      }

      setTimeout(() => {
        if (mapInstance.current) mapInstance.current.relayout();
      }, 100);
    });

    const currentResizeHandler = () => {
      if (mapInstance.current) mapInstance.current.relayout();
    };
    resizeHandlerRef.current = currentResizeHandler;
    window.addEventListener('resize', currentResizeHandler);

    return () => {
      window.removeEventListener('resize', currentResizeHandler);
    };
  }, [fetchDbPlaces]);

  // [기능 2] 키워드 및 카테고리 실시간 검색 로직
  useEffect(() => {
    const { kakao } = window;
    if (!kakao || !kakao.maps || !mapInstance.current) return;

    const map = mapInstance.current;
    const ps = new kakao.maps.services.Places();
    const infowindow = infowindowRef.current;

    // 기존 검색 마커 제거 함수
    const removeSearchMarkers = () => {
      if (searchMarkersRef.current && searchMarkersRef.current.length > 0) {
        searchMarkersRef.current.forEach(m => m.setMap(null));
        searchMarkersRef.current = [];
      }
      if (infowindow) infowindow.close();
    };

    const displaySearchMarkers = (data, isCategorySearch) => {
      const bounds = new kakao.maps.LatLngBounds();

      data.forEach((place, index) => {
        const marker = new window.kakao.maps.Marker({
          map: map,
          position: new window.kakao.maps.LatLng(place.y, place.x)
        });

        const displayInfoWindow = () => {
          const detailUrl = `https://place.map.kakao.com/${place.id}`;
          const content = `
            <div style="padding:15px; font-size:13px; border-radius:10px; min-width:200px; line-height:1.6;">
              <strong style="display:block; margin-bottom:6px; color:#333;">${place.place_name}</strong>
              <span style="display:block; font-size:11px; color:#666;">📍 ${place.address_name}</span>
              ${place.phone ? `<span style="display:block; font-size:11px; color:#1890ff; margin-top:2px;">📞 ${place.phone}</span>` : ''}
              <a href="${detailUrl}" target="_blank" style="display:inline-block; margin-top:10px; background:#333; color:#fff; padding:4px 10px; border-radius:4px; text-decoration:none; font-size:11px;">상세보기</a>
            </div>`;
          infowindow.setContent(content);
          infowindow.open(map, marker);
        };

        kakao.maps.event.addListener(marker, 'click', () => {
          displayInfoWindow();
        });

        searchMarkersRef.current.push(marker);
        bounds.extend(new kakao.maps.LatLng(place.y, place.x));
      });

      // 🚩 키워드 검색 시에만 화면 이동 / 카테고리 검색 시에는 현재 위치 유지
      if (!isCategorySearch && keyword && data.length > 0) {
        map.setBounds(bounds);
        currentCenterRef.current = map.getCenter(); 
      }
    };

    const placesSearchCB = (data, status, pagination) => {
      if (status === kakao.maps.services.Status.OK) {
        // 현재 실행 중인 검색이 카테고리 기반인지 확인
        const isCategorySearch = !!(category && codes[category] && !keyword);
        displaySearchMarkers(data, isCategorySearch);

        // 카테고리 검색 결과가 많을 경우 다음 페이지 연쇄 검색 (최대 45개)
        if (isCategorySearch && pagination.hasNextPage && searchMarkersRef.current.length < 45) {
          pagination.nextPage();
        }
      }
    };

    // 검색 시작 전 기존 마커 정리
    removeSearchMarkers();

    // 🚩 검색 로직 우선순위 조정: 키워드가 있을 때는 키워드 검색, 없을 때만 카테고리 검색
    if (keyword) {
      ps.keywordSearch(keyword, placesSearchCB);
    } else if (category && codes[category]) {
      ps.categorySearch(codes[category], placesSearchCB, {
        location: map.getCenter(), // 실시간 현재 지도 중심 기준
        radius: 2000, 
        size: 15,
        useMapBounds: false // 현재 화면 영역에 구애받지 않고 중심점 기준 2km 검색
      });
    }

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