package kr.hi.travel_community.repository;

import kr.hi.travel_community.entity.NewsLetter; 
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NewsLetterRepository extends JpaRepository<NewsLetter, Integer> {

    /**
     * 🚩 1. 삭제되지 않은 뉴스레터 전체 조회 (최신순)
     */
    List<NewsLetter> findByPoDelOrderByPoNumDesc(String poDel);

    /**
     * 🚩 2. 특정 뉴스레터 상세 조회 (삭제 여부 확인)
     */
    Optional<NewsLetter> findByPoNumAndPoDel(Integer poNum, String poDel);

    /**
     * 🚩 3. 조회수 증가 (Native Query)
     * 💡 엔티티의 @Table(name = "newsletter_post")와 일치하도록 수정 완료
     */
    @Modifying
    @Query(value = "UPDATE newsletter_post SET po_view = po_view + 1 WHERE po_num = :poNum", nativeQuery = true)
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