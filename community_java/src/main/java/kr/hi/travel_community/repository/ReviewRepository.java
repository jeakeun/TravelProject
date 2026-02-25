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

    @Modifying
    @Transactional
    @Query("UPDATE ReviewPost p SET p.poView = COALESCE(p.poView, 0) + 1 WHERE p.poNum = :id AND p.poDel = 'N'")
    int updateViewCount(@Param("id") Integer id);
}
