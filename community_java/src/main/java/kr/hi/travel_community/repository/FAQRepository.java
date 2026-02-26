package kr.hi.travel_community.repository;

import kr.hi.travel_community.entity.FAQ;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface FAQRepository extends JpaRepository<FAQ, Integer> {

    /**
     * 🚩 1. 삭제되지 않은 FAQ 전체 조회 (최신순)
     * 서비스의 getRealAllPosts()에서 사용됩니다.
     */
    List<FAQ> findByPoDelOrderByPoNumDesc(String poDel);

    /**
     * 🚩 2. 특정 FAQ 상세 조회 (삭제 여부 확인 포함)
     * 서비스의 getPostDetail() 및 수정/삭제 로직에서 사용됩니다.
     */
    Optional<FAQ> findByPoNumAndPoDel(Integer poNum, String poDel);

    /**
     * 🚩 3. 조회수 증가 (JPQL 방식)
     * 직접 업데이트 쿼리를 실행하여 성능을 최적화하고 동시성 문제를 방지합니다.
     */
    @Modifying
    @Transactional
    @Query("UPDATE FAQ f SET f.poView = COALESCE(f.poView, 0) + 1 WHERE f.poNum = :poNum AND f.poDel = 'N'")
    int updateViewCount(@Param("poNum") Integer poNum);

    /**
     * 🚩 4. 검색 기능 (필요 시 활용)
     * 제목 또는 내용에 키워드가 포함된 FAQ를 검색합니다.
     */
    @Query("SELECT f FROM FAQ f WHERE (f.poTitle LIKE %:keyword% OR f.poContent LIKE %:keyword%) AND f.poDel = 'N' ORDER BY f.poNum DESC")
    List<FAQ> searchFaq(@Param("keyword") String keyword);
}