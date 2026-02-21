package kr.hi.travel_community.repository;

import kr.hi.travel_community.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import jakarta.transaction.Transactional;

@Repository
public interface PostRepository extends JpaRepository<Post, Integer> {
    @Modifying
    @Transactional
    @Query("UPDATE Post p SET p.poView = p.poView + 1 WHERE p.poNum = :poNum")
    void updateViewCount(Integer poNum);
}