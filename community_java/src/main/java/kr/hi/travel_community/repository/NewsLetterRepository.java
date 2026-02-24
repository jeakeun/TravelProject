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

    List<NewsLetter> findByPoDelOrderByPoNumDesc(String poDel);

    Optional<NewsLetter> findByPoNumAndPoDel(Integer poNum, String poDel);

    @Modifying
    @Query(value = "UPDATE newsletter_post SET po_view = po_view + 1 WHERE po_num = :poNum", nativeQuery = true)
    int updateViewCount(@Param("poNum") Integer poNum);

    List<NewsLetter> findByPoTitleContainingAndPoDelOrderByPoNumDesc(String keyword, String poDel);

    List<NewsLetter> findByPoContentContainingAndPoDelOrderByPoNumDesc(String keyword, String poDel);

    @Query("SELECT n FROM NewsLetter n WHERE (n.poTitle LIKE %:keyword% OR n.poContent LIKE %:keyword%) AND n.poDel = :poDel ORDER BY n.poNum DESC")
    List<NewsLetter> findByTitleOrContent(@Param("keyword") String keyword, @Param("poDel") String poDel);
}