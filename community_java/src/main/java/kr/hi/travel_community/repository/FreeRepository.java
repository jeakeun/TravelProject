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
     * 서비스의 getPostDetailWithImage에서 findByPoNumAndPoDel(id, "N") 호출 시 사용됩니다.
     */
    Optional<FreePost> findByPoNumAndPoDel(Integer poNum, String poDel);

    /**
     * 🚩 목록 조회: 삭제되지 않은 글을 최신순으로 조회
     * 서비스의 getRealAllPosts에서 findByPoDelOrderByPoNumDesc("N") 호출 시 사용됩니다.
     */
    List<FreePost> findByPoDelOrderByPoNumDesc(String poDel);

    /**
     * 🚩 조회수 증가: 벌크 연산을 통해 성능과 데이터 정합성 확보
     * COALESCE를 사용하여 poView가 null인 경우에도 안전하게 0으로 처리 후 1을 더합니다.
     */
    @Modifying
    @Transactional
    @Query("UPDATE FreePost p SET p.poView = COALESCE(p.poView, 0) + 1 " +
           "WHERE p.poNum = :id AND p.poDel = 'N'")
    int updateViewCount(@Param("id") Integer id);

    /**
     * 🚩 사용자별 작성글 조회: 마이페이지 등에서 활용 가능
     * 특정 회원이 작성한 글 중 삭제되지 않은 글만 최신순으로 가져옵니다.
     */
    List<FreePost> findByPoMbNumAndPoDelOrderByPoNumDesc(Integer poMbNum, String poDel);
}