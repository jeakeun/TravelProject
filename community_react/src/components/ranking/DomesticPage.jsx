import React, { useState } from 'react';
import RankingList from './RankingList'; 
import Kakaomap from './Kakaomap'; // 주석 해제하여 실제 컴포넌트 연결

const DomesticPage = () => {
    // 🚩 랭킹 리스트에서 클릭한 지역명을 저장할 상태
    const [mapKeyword, setMapKeyword] = useState('');

    // 🚩 리스트 아이템 클릭 시 실행될 핸들러 함수
    const handleAreaClick = (areaName) => {
        setMapKeyword(areaName); // 예: "서울특별시", "부산광역시" 등을 설정
    };

    return (
        <div style={{ 
            display: 'flex',          
            justifyContent: 'center', 
            alignItems: 'flex-start', 
            gap: '20px',              
            padding: '40px',
            backgroundColor: '#f8f9fa',
            minHeight: '100vh'
        }}>
            
            {/* 1. 왼쪽: 지도 영역 */}
            <div style={{ 
                flex: '0 0 800px',    
                height: '600px', 
                backgroundColor: '#fff', 
                borderRadius: '15px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                overflow: 'hidden', // 지도가 둥근 모서리를 벗어나지 않게
                border: '1px solid #ddd',
                position: 'relative'
            }}>
                {/* 🚩 keyword 프롭스로 mapKeyword 전달 */}
                <Kakaomap keyword={mapKeyword} />
                
                {/* 검색어가 없을 때 보여줄 안내 가이드 (선택 사항) */}
                {!mapKeyword && (
                    <div style={{
                        position: 'absolute',
                        top: '20px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 2,
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        padding: '8px 15px',
                        borderRadius: '20px',
                        fontSize: '0.9rem',
                        color: '#666',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                    }}>
                        👈 오른쪽 랭킹을 클릭하면 해당 지역으로 이동합니다!
                    </div>
                )}
            </div>

            {/* 2. 오른쪽: 랭킹 리스트 */}
            <div style={{ flex: '0 0 320px' }}>
                {/* 🚩 클릭 핸들러 전달 */}
                <RankingList onAreaClick={handleAreaClick} />
            </div>

        </div>
    );
};

export default DomesticPage;