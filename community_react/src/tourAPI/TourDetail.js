import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const TourDetail = () => {
    const { contentid } = useParams(); // 주소창에 있는 id값을 가져옵니다.
    const navigate = useNavigate();
    const [tour, setTour] = useState(null);

    useEffect(() => {
    // 서버에서 다시 데이터를 가져와서 해당 ID의 상세 정보를 찾습니다.
    axios.get('/api/tour/list')
        .then(res => {
            // 🚩 수정 포인트 1: 양쪽 모두 String()으로 감싸서 문자열/숫자 타입 불일치 방지
            // 🚩 수정 포인트 2: res.data가 배열인지 확인 후 find 실행
            if (Array.isArray(res.data)) {
                const found = res.data.find(item => String(item.contentid) === String(contentid));
                
                if (found) {
                    setTour(found);
                } else {
                    console.warn(`ID ${contentid}에 해당하는 관광지를 찾을 수 없습니다.`);
                }
            }
        })
        .catch(err => console.error("상세 정보 로딩 실패:", err));
  		}	, [contentid]);

		 useEffect(() => {
			// 🚩 데이터가 있고, 카카오 객체 및 지도 라이브러리가 로드되었을 때만 실행
			if (tour && tour.mapx && tour.mapy && window.kakao && window.kakao.maps) {
					const container = document.getElementById('map'); 
					
					// 🚩 수정 포인트: tour.mapy(위도), tour.mapx(경도)를 parseFloat으로 감싸서 숫자로 변환
					const lat = parseFloat(tour.mapy);
					const lng = parseFloat(tour.mapx);

					const options = {
							center: new window.kakao.maps.LatLng(lat, lng), // 변환된 좌표 사용
							level: 3 
					};
					
					// 지도 생성
					const map = new window.kakao.maps.Map(container, options);

					// 마커 표시
					const markerPosition = new window.kakao.maps.LatLng(lat, lng);
					const marker = new window.kakao.maps.Marker({ 
							position: markerPosition 
					});
					marker.setMap(map);
			}
		}, [tour]); // tour 데이터가 변경될 때마다(데이터를 불러온 직후) 실행됨

    if (!tour) return <div style={{ padding: '50px', textAlign: 'center' }}>로딩 중...</div>;

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <button onClick={() => navigate(-1)} style={{ marginBottom: '20px' }}>뒤로가기</button>
            
            <h1>{tour.title}</h1>
            <p style={{ color: '#666' }}>{tour.addr1}</p>
            
            <div style={{ width: '100%', height: '400px', overflow: 'hidden', borderRadius: '15px', marginBottom: '20px' }}>
                <img 
                    src={tour.firstimage || 'https://via.placeholder.com/800x400'} 
                    alt={tour.title} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
            </div>

            <h3>위치 보기</h3>
            {/* 🚩 지도가 그려질 영역 */}
            <div id="map" style={{ width: '100%', height: '400px', backgroundColor: '#eee', borderRadius: '15px' }}></div>
        </div>
    );
};

export default TourDetail;