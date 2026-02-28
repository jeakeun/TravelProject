package kr.hi.travel_community.repository;

import kr.hi.travel_community.entity.FreePost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface FreeRepository extends JpaRepository<FreePost, Integer> {

    /**
     * 🚩 상세 조회: 삭제되지 않은 특정 게시글 조회
     */
    Optional<FreePost> findByPoNumAndPoDel(Integer poNum, String poDel);

    /**
     * 🚩 목록 조회: 삭제되지 않은 글을 최신순으로 조회
     */
    List<FreePost> findByPoDelOrderByPoNumDesc(String poDel);

    /**
     * 🚩 조회수 증가: 벌크 연산을 통해 성능과 데이터 정합성 확보
     */
    @Modifying
    @Transactional
    @Query("UPDATE FreePost p SET p.poView = COALESCE(p.poView, 0) + 1 " + 
           "WHERE p.poNum = :id AND p.poDel = 'N'")
    int updateViewCount(@Param("id") Integer id);

    /**
     * 🚩 추천수(좋아요) 증가: 벌크 연산 추가
     * 서비스에서 호출하여 추천 숫자를 안전하게 1 올립니다.
     */
    @Modifying
    @Transactional
    @Query("UPDATE FreePost p SET p.poUp = COALESCE(p.poUp, 0) + 1 " +
           "WHERE p.poNum = :id AND p.poDel = 'N'")
    int increaseLikeCount(@Param("id") Integer id);

    /**
     * 🚩 추천수(좋아요) 감소: 벌크 연산 추가
     * 0 미만으로 떨어지지 않도록 처리합니다.
     */
    @Modifying
    @Transactional
    @Query("UPDATE FreePost p SET p.poUp = CASE WHEN COALESCE(p.poUp, 0) > 0 THEN p.poUp - 1 ELSE 0 END " +
           "WHERE p.poNum = :id AND p.poDel = 'N'")
    int decreaseLikeCount(@Param("id") Integer id);

    /**
     * 🚩 사용자별 작성글 조회: 마이페이지 등에서 활용 가능
     */
    List<FreePost> findByPoMbNumAndPoDelOrderByPoNumDesc(Integer poMbNum, String poDel);
}