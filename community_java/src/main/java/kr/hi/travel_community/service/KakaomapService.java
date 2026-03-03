package kr.hi.travel_community.service;

import kr.hi.travel_community.entity.Kakaomap;
import kr.hi.travel_community.repository.KakaomapRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional // 모든 메서드에 트랜잭션 적용
public class KakaomapService {

    private final KakaomapRepository kakaomapRepository;

    // 1. 모든 장소 목록 조회 (지도에 전체 마커 표시용)
    @Transactional(readOnly = true)
    public List<Kakaomap> getAllPlaces() {
        return kakaomapRepository.findAll();
    }

    // 2. 카테고리별 장소 조회 (맛집, 카페 등 필터링용)
    @Transactional(readOnly = true)
    public List<Kakaomap> getPlacesByCategory(String category) {
        return kakaomapRepository.findByKmCategory(category);
    }

    // 3. 특정 장소 상세 정보 조회
    @Transactional(readOnly = true)
    public Optional<Kakaomap> getPlaceById(Integer kmNum) {
        return kakaomapRepository.findById(kmNum);
    }

    // 4. 새로운 장소 저장 (카카오 API에서 받은 데이터 저장용)
    public Kakaomap savePlace(Kakaomap kakaomap) {
        // 중복 저장 방지 로직 (API ID 기준)
        if (kakaomap.getKmApiId() != null && kakaomapRepository.existsByKmApiId(kakaomap.getKmApiId())) {
            return null; 
        }
        return kakaomapRepository.save(kakaomap);
    }
}