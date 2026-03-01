import React, { useEffect, useState } from 'react';
import { getTopRankings } from './ApiService';

// 🚩 [수정] 부모(App.js)에서 전달하는 이름인 'onAreaSelect'로 프롭스명을 맞춥니다.
const RankingList = ({ onAreaSelect }) => {
    const [rankings, setRankings] = useState([]);
    const [loading, setLoading] = useState(true);

    // 숫자를 '만 명' 단위로 변환해주는 함수
    const formatVisitorCount = (num) => {
        if (!num) return "0";
        if (num >= 10000) {
            return `${(num / 10000).toFixed(1)}만`;
        }
        return num.toLocaleString();
    };

    useEffect(() => {
        getTopRankings()
            .then(response => {
                // 백엔드에서 준 데이터를 방문자 수(vCount) 기준으로 내림차순 정렬 및 TOP 5 추출
                const data = response.data.sort((a, b) => 
                    (b.vCount || b.vcount || 0) - (a.vCount || a.vcount || 0)
                ).slice(0, 5); 
                setRankings(data);
                setLoading(false);
            })
            .catch(error => {
                console.error("데이터 가져오기 실패:", error);
                setLoading(false);
            });
    }, []);

    if (loading) return <div style={{ padding: '20px', color: '#888' }}>📊 랭킹 데이터를 불러오는 중...</div>;

    return (
        <div style={{ 
            width: '320px', 
            padding: '24px 20px', 
            backgroundColor: '#fff', 
            borderRadius: '16px', 
            boxShadow: '0 10px 25px rgba(0,0,0,0.05)', 
            border: '1px solid #f0f0f0',
            margin: '10px' 
        }}>
            <h3 style={{ 
                margin: '0 0 20px 0', 
                fontSize: '1.25rem', 
                fontWeight: '700',
                color: '#1a1a1a',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
            }}>
                🔥 실시간 인기 지역 TOP 5
            </h3>
            
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {rankings.map((item, index) => (
                    <li 
                        key={item.id || index} 
                        // 🚩 [핵심 수정] onAreaSelect 호출
                        onClick={() => onAreaSelect && onAreaSelect(item.areaNm)}
                        style={{ 
                            padding: '14px 12px', 
                            borderBottom: index === rankings.length - 1 ? 'none' : '1px solid #f8f8f8',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: 'pointer',
                            borderRadius: '10px',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f7ff'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span style={{ 
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                backgroundColor: index < 3 ? '#fff1f0' : '#f5f5f5',
                                color: index < 3 ? '#ff4d4f' : '#8c8c8c',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                fontSize: '0.9rem',
                                fontWeight: 'bold',
                                marginRight: '12px'
                            }}>
                                {index + 1}
                            </span>
                            <span style={{ 
                                fontWeight: '600', 
                                color: '#434343',
                                fontSize: '1rem' 
                            }}>
                                {item.areaNm}
                            </span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <span style={{ 
                                color: '#1890ff', 
                                fontSize: '0.95rem', 
                                fontWeight: '700' 
                            }}>
                                {formatVisitorCount(item.vCount || item.vcount || 0)}
                            </span>
                            <span style={{ color: '#bfbfbf', fontSize: '0.8rem', marginLeft: '2px' }}> 명</span>
                        </div>
                    </li>
                ))}
            </ul>

            <div style={{ 
                marginTop: '18px', 
                paddingTop: '12px',
                borderTop: '1px dashed #eee',
                fontSize: '0.75rem', 
                color: '#bfbfbf', 
                textAlign: 'center' 
            }}>
                * 최근 일주일 외지인/외국인 방문 합계
            </div>
        </div>
    );
};

export default RankingList;