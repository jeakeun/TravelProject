import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './TourDetail.css'; // CSS 파일 임포트

const TourDetail = () => {
    const { contentid } = useParams();
    const navigate = useNavigate();
    const [tour, setTour] = useState(null);

    useEffect(() => {
        axios.get('/api/tour/list')
            .then(res => {
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
    }, [contentid]);

    useEffect(() => {
        if (tour && tour.mapx && tour.mapy && window.kakao && window.kakao.maps) {
            const container = document.getElementById('map'); 
            const lat = parseFloat(tour.mapy);
            const lng = parseFloat(tour.mapx);

            const options = {
                center: new window.kakao.maps.LatLng(lat, lng),
                level: 3 
            };
            
            const map = new window.kakao.maps.Map(container, options);
            const markerPosition = new window.kakao.maps.LatLng(lat, lng);
            const marker = new window.kakao.maps.Marker({ position: markerPosition });
            marker.setMap(map);
        }
    }, [tour]);

    if (!tour) return <div className="loading-state">로딩 중...</div>;

    return (
        <div className="tour-detail-container">
            <h1 className="tour-title">{tour.title}</h1>
            <p className="tour-address">{tour.addr1}</p>
            
            <div className="tour-image-container">
                <img 
                    src={tour.firstimage || 'https://via.placeholder.com/800x400'} 
                    alt={tour.title} 
                />
            </div>

            <h3 className="section-title">위치 보기</h3>
            <div id="map" className="kakao-map"></div>

            {/* 하단 우측 버튼 영역 */}
            <div className="button-group">
                <button className="back-button" onClick={() => navigate(-1)}>
                    목록으로 돌아가기
                </button>
            </div>
        </div>
    );
};

export default TourDetail;