package kr.hi.travel_community.repository;

import kr.hi.travel_community.entity.Kakaomap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KakaomapRepository extends JpaRepository<Kakaomap, Integer> {

    // 1. 장소 이름으로 검색 (필요할 경우)
    List<Kakaomap> findByKmNameContaining(String keyword);

    // 2. 카테고리별 장소 목록 조회 (필요할 경우)
    List<Kakaomap> findByKmCategory(String category);

    // 3. 카카오 API ID로 특정 장소 존재 여부 확인 (중복 저장 방지용)
    boolean existsByKmApiId(String apiId);
}