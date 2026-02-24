package kr.hi.travel_community.repository;

import kr.hi.travel_community.entity.RecommendPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RecommendRepository extends JpaRepository<RecommendPost, Integer> {

    /**
     * 🚩 상세 조회: 삭제되지 않은 특정 게시글만 조회
     */
    Optional<RecommendPost> findByPoNumAndPoDel(Integer poNum, String poDel);

    /**
     * 🚩 전체 목록: 삭제되지 않은 글을 최신순(poNum 역순)으로 조회
     */
    List<RecommendPost> findByPoDelOrderByPoNumDesc(String poDel);

    /**
     * 🚩 검색 기능: 제목에 키워드 포함 + 삭제 안 된 글
     */
    List<RecommendPost> findByPoTitleContainingAndPoDelOrderByPoNumDesc(String title, String poDel);

    /**
     * 🚩 검색 기능: 내용에 키워드 포함 + 삭제 안 된 글
     */
    List<RecommendPost> findByPoContentContainingAndPoDelOrderByPoNumDesc(String content, String poDel);

    /**
     * 🚩 통합 검색: 제목 또는 내용에 키워드가 포함된 경우
     * JPQL을 사용하여 가독성과 정확성을 높였습니다.
     */
    @Query("SELECT p FROM RecommendPost p " +
           "WHERE (p.poTitle LIKE %:keyword% OR p.poContent LIKE %:keyword%) " +
           "AND p.poDel = :poDel " +
           "ORDER BY p.poNum DESC")
    List<RecommendPost> findByTitleOrContent(@Param("keyword") String keyword, @Param("poDel") String poDel);

    /**
     * 🚩 조회수 증가: 데이터 정합성을 위한 벌크 업데이트 (Atomic Update)
     * @Modifying: DB 데이터를 수정할 때 필수
     * COALESCE: poView가 null일 경우 0으로 처리하여 계산 오류 방지
     */
    @Modifying
    @Query("UPDATE RecommendPost p SET p.poView = COALESCE(p.poView, 0) + 1 " +
           "WHERE p.poNum = :id AND p.poDel = 'N'")
    int updateViewCount(@Param("id") Integer id);

    /**
     * 🚩 좋아요(추천) 수 동기화: DB에서 직접 추천수 업데이트 시 사용
     */
    @Modifying
    @Query("UPDATE RecommendPost p SET p.poUp = COALESCE(p.poUp, 0) + :amount " +
           "WHERE p.poNum = :id AND p.poDel = 'N'")
    void updateLikeCount(@Param("id") Integer id, @Param("amount") int amount);
}