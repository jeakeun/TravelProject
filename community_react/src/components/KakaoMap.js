import React, { useState, useEffect, useRef } from 'react';

function KakaoMap({ searchKeyword, isCategorySearch }) {
  const mapContainer = useRef(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const infowindowRef = useRef(null);

  useEffect(() => {
    const { kakao } = window;
    if (kakao && kakao.maps) {
      kakao.maps.load(() => {
        const options = { center: new kakao.maps.LatLng(35.115, 129.042), level: 4 };
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
        markers.forEach(marker => marker.setMap(null));
        infowindowRef.current.close();
        const newMarkers = [];
        const bounds = new kakao.maps.LatLngBounds();
        for (let i = 0; i < data.length; i++) {
          const marker = new kakao.maps.Marker({ map: map, position: new kakao.maps.LatLng(data[i].y, data[i].x) });
          kakao.maps.event.addListener(marker, 'click', () => {
            const content = `<div style="padding:10px; font-size:12px;"><strong>${data[i].place_name}</strong><br/>${data[i].address_name}</div>`;
            infowindowRef.current.setContent(content);
            infowindowRef.current.open(map, marker);
          });
          newMarkers.push(marker);
          bounds.extend(new kakao.maps.LatLng(data[i].y, data[i].x));
        }
        setMarkers(newMarkers);
        if (!isCategorySearch) map.setBounds(bounds);
      }
    }, searchOptions);
  }, [map, searchKeyword, isCategorySearch]);

  return <div ref={mapContainer} style={{ width: '50%', height: '450px', borderRadius: '15px', backgroundColor: '#f9f9f9', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', border: '1px solid #ddd' }} />;
}

export default KakaoMap;