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

    // 게시글 상세 조회 (삭제되지 않은 글만)
    Optional<RecommendPost> findByPoNumAndPoDel(Integer poNum, String poDel);

    // 게시글 전체 리스트 조회 (최신순)
    List<RecommendPost> findByPoDelOrderByPoNumDesc(String poDel);

    // 🚩 1. 제목 검색
    List<RecommendPost> findByPoTitleContainingAndPoDelOrderByPoNumDesc(String title, String poDel);

    // 🚩 2. 내용 검색
    List<RecommendPost> findByPoContentContainingAndPoDelOrderByPoNumDesc(String content, String poDel);

    // 🚩 3. 제목 + 내용 검색
    // 엔티티 필드명을 기준으로 작동하므로 poTitle, poContent 등이 엔티티와 일치해야 합니다.
    @Query("SELECT p FROM RecommendPost p WHERE (p.poTitle LIKE %:keyword% OR p.poContent LIKE %:keyword%) AND p.poDel = :poDel ORDER BY p.poNum DESC")
    List<RecommendPost> findByTitleOrContent(@Param("keyword") String keyword, @Param("poDel") String poDel);

    // 조회수 증가 (Atomic Update)
    @Modifying
    @Transactional
    @Query("UPDATE RecommendPost p SET p.poView = COALESCE(p.poView, 0) + 1 WHERE p.poNum = :id AND p.poDel = 'N'")
    int updateViewCount(@Param("id") Integer id);
}