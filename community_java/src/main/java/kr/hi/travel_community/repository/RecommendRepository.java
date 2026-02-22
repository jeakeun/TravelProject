package kr.hi.travel_community.repository;

import kr.hi.travel_community.entity.RecommendPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface RecommendRepository extends JpaRepository<RecommendPost, Integer> {

    Optional<RecommendPost> findByPoNumAndPoDel(Integer poNum, String poDel);

    List<RecommendPost> findByPoDelOrderByPoNumDesc(String poDel);

    // 🚩 1. 제목 검색
    List<RecommendPost> findByPoTitleContainingAndPoDelOrderByPoNumDesc(String title, String poDel);

    // 🚩 2. 내용 검색
    List<RecommendPost> findByPoContentContainingAndPoDelOrderByPoNumDesc(String content, String poDel);

    // 🚩 3. 제목 + 내용 검색 (복잡한 조건이므로 @Query 사용)
    @Query("SELECT p FROM RecommendPost p WHERE (p.poTitle LIKE %:keyword% OR p.poContent LIKE %:keyword%) AND p.poDel = :poDel ORDER BY p.poNum DESC")
    List<RecommendPost> findByTitleOrContent(@Param("keyword") String keyword, @Param("poDel") String poDel);

    // 🚩 핵심 수정: DB 레벨에서 원자적(Atomic) 업데이트 수행
    @Modifying
    @Transactional
    @Query("UPDATE RecommendPost p SET p.poView = p.poView + 1 WHERE p.poNum = :id AND p.poDel = 'N'")
    int updateViewCount(@Param("id") Integer id);
}