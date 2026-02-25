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
     */
    @Query("SELECT p FROM RecommendPost p " + 
           "WHERE (p.poTitle LIKE %:keyword% OR p.poContent LIKE %:keyword%) " +
           "AND p.poDel = :poDel " +
           "ORDER BY p.poNum DESC")
    List<RecommendPost> findByTitleOrContent(@Param("keyword") String keyword, @Param("poDel") String poDel);

    /**
     * 🚩 [추가] 작성자(mbNum)로 게시글 찾기
     * 서비스의 searchPosts 메서드 내 "author" 케이스에서 빨간 줄이 뜨지 않도록 추가합니다.
     */
    List<RecommendPost> findByPoMbNumAndPoDelOrderByPoNumDesc(Integer poMbNum, String poDel);

    /**
     * 🚩 조회수 증가
     */
    @Modifying
    @Query("UPDATE RecommendPost p SET p.poView = COALESCE(p.poView, 0) + 1 " +
           "WHERE p.poNum = :id AND p.poDel = 'N'")
    int updateViewCount(@Param("id") Integer id);

    /**
     * 🚩 좋아요(추천) 수 동기화
     */
    @Modifying
    @Query("UPDATE RecommendPost p SET p.poUp = COALESCE(p.poUp, 0) + :amount " +
           "WHERE p.poNum = :id AND p.poDel = 'N'")
    void updateLikeCount(@Param("id") Integer id, @Param("amount") int amount);
}