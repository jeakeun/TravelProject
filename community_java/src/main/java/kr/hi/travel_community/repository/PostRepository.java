package kr.hi.travel_community.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import kr.hi.travel_community.entity.Post;

@Repository
public interface PostRepository extends JpaRepository<Post, Integer> {

    // 🚩 조회수 증가 기능 추가
    @Transactional // 데이터 변경을 위해 필수
    @Modifying    // SELECT가 아닌 UPDATE 문임을 명시
    @Query("UPDATE Post p SET p.viewCount = p.viewCount + 1 WHERE p.id = :id")
    void updateViewCount(@Param("id") Integer id);
}