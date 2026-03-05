import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TourDataList = () => {
    const [tours, setTours] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // AWS 서버의 백엔드 API 호출
        // 배포 환경이므로 상대 경로 '/api/tour/list' 사용
        axios.get('/api/tour/list')
            .then(res => {
                setTours(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("데이터 로딩 실패:", err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div style={{textAlign: 'center', padding: '50px'}}>로딩 중...</div>;

    return (
        <div style={{ padding: '20px' }}>
            <h2 style={{ marginBottom: '20px', borderBottom: '2px solid #007bff', paddingBottom: '10px' }}>
                🗺️ 공공데이터 관광지 현황
            </h2>
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
                gap: '20px' 
            }}>
                {tours.map(tour => (
                    <div key={tour.contentid} style={{ 
                        border: '1px solid #eee', 
                        borderRadius: '12px', 
                        overflow: 'hidden',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                        background: '#fff'
                    }}>
                        <img 
                            src={tour.firstimage || 'https://via.placeholder.com/300x200?text=No+Image'} 
                            alt={tour.title} 
                            style={{ width: '100%', height: '200px', objectFit: 'cover' }} 
                        />
                        <div style={{ padding: '15px' }}>
                            <h4 style={{ margin: '0 0 10px', color: '#333' }}>{tour.title}</h4>
                            <p style={{ fontSize: '13px', color: '#666', margin: '0' }}>{tour.addr1}</p>
                            <p style={{ fontSize: '12px', color: '#007bff', marginTop: '10px' }}>#관광지 #{tour.zipcode}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TourDataList;