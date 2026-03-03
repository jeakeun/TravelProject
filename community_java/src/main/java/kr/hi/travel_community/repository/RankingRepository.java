package kr.hi.travel_community.repository;

import kr.hi.travel_community.entity.RankingEntity;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RankingRepository extends JpaRepository<RankingEntity, Long> {
    
    // 메서드 이름 기반 쿼리 대신 명시적 JPQL 사용 (에러 방지 핵심)
    @Query("SELECT r FROM RankingEntity r ORDER BY r.vCount DESC")
    List<RankingEntity> findTopRankings(Pageable pageable);
}