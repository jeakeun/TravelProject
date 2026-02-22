package kr.hi.travel_community.repository;

import kr.hi.travel_community.entity.ReviewPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<ReviewPost, Integer> {

    Optional<ReviewPost> findByPoNumAndPoDel(Integer poNum, String poDel);

    List<ReviewPost> findByPoDelOrderByPoNumDesc(String poDel);

    // 🚩 1. 제목 검색
    List<ReviewPost> findByPoTitleContainingAndPoDelOrderByPoNumDesc(String title, String poDel);

    // 🚩 2. 내용 검색
    List<ReviewPost> findByPoContentContainingAndPoDelOrderByPoNumDesc(String content, String poDel);

    // 🚩 3. 제목 + 내용 검색
    @Query("SELECT p FROM ReviewPost p WHERE (p.poTitle LIKE %:keyword% OR p.poContent LIKE %:keyword%) AND p.poDel = :poDel ORDER BY p.poNum DESC")
    List<ReviewPost> findByTitleOrContent(@Param("keyword") String keyword, @Param("poDel") String poDel);

    @Modifying
    @Transactional
    @Query("UPDATE ReviewPost p SET p.poView = COALESCE(p.poView, 0) + 1 WHERE p.poNum = :id AND p.poDel = 'N'")
    int updateViewCount(@Param("id") Integer id);
}