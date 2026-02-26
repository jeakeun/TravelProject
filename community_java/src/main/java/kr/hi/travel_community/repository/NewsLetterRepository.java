package kr.hi.travel_community.repository;

import kr.hi.travel_community.entity.NewsLetter; 
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface NewsLetterRepository extends JpaRepository<NewsLetter, Integer> {

    /**
     * 🚩 1. 삭제되지 않은 뉴스레터 전체 조회 (최신순)
     * 서비스의 getRealAllPosts()와 연동됩니다.
     */
    List<NewsLetter> findByPoDelOrderByPoNumDesc(String poDel);

    /**
     * 🚩 2. 특정 뉴스레터 상세 조회 (삭제 여부 확인)
     * 서비스의 getPostDetailWithImage()와 연동됩니다.
     */
    Optional<NewsLetter> findByPoNumAndPoDel(Integer poNum, String poDel);

    /**
     * 🚩 3. 조회수 증가 (JPQL 방식)
     * Native Query의 테이블명 의존성을 제거하고 엔티티 객체 기준으로 안전하게 업데이트합니다.
     */
    @Modifying
    @Transactional
    @Query("UPDATE NewsLetter n SET n.poView = COALESCE(n.poView, 0) + 1 WHERE n.poNum = :poNum AND n.poDel = 'N'")
    int updateViewCount(@Param("poNum") Integer poNum);

    /**
     * 🚩 4. 검색 기능: 제목에 키워드 포함
     */
    List<NewsLetter> findByPoTitleContainingAndPoDelOrderByPoNumDesc(String keyword, String poDel);

    /**
     * 🚩 5. 검색 기능: 내용에 키워드 포함
     */
    List<NewsLetter> findByPoContentContainingAndPoDelOrderByPoNumDesc(String keyword, String poDel);

    /**
     * 🚩 6. 검색 기능: 제목 또는 내용에 키워드 포함 (JPQL)
     */
    @Query("SELECT n FROM NewsLetter n WHERE (n.poTitle LIKE %:keyword% OR n.poContent LIKE %:keyword%) AND n.poDel = :poDel ORDER BY n.poNum DESC")
    List<NewsLetter> findByTitleOrContent(@Param("keyword") String keyword, @Param("poDel") String poDel);
}