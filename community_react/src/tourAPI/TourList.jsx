import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TourList.css'; // 스타일 시트 분리

const TourList = () => {
    const [tours, setTours] = useState([]); // 관광지 데이터 상태
    const [loading, setLoading] = useState(true); // 로딩 상태

    useEffect(() => {
        // 백엔드 스프링부트 API 호출
        // 개발 환경에서는 localhost:8080이지만, AWS 배포 시 도메인 주소로 변경됨
        axios.get('/api/tour/list') 
            .then(response => {
                setTours(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error("데이터를 가져오는 중 오류 발생:", error);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="loading">관광 정보를 불러오는 중입니다...</div>;

// 🚩 수정 포인트: tours가 배열인지 확인하는 조건부 렌더링 추가
return (
    <div className="tour-container">
        <h1 className="title">🇰🇷 대한민국 구석구석</h1>
        <div className="tour-grid">
            {/* tours가 존재하고 배열일 때만 map을 실행하도록 보호 */}
            {Array.isArray(tours) && tours.length > 0 ? (
                tours.map(tour => (
                    <div key={tour.contentid} className="tour-card">
                        <div className="image-wrapper">
                            <img 
                                src={tour.firstimage || 'https://via.placeholder.com/300x200?text=No+Image'} 
                                alt={tour.title} 
                                className="tour-image"
                            />
                        </div>
                        <div className="tour-content">
                            <h3 className="tour-title">{tour.title}</h3>
                            <p className="tour-addr">{tour.addr1}</p>
                        </div>
                    </div>
                ))
            ) : (
                <div className="no-data">데이터가 없거나 불러오는 데 실패했습니다.</div>
            )}
        </div>
    </div>
	);
};

export default TourList;