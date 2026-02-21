package kr.hi.travel_community.repository;

import kr.hi.travel_community.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RecommendRepository extends JpaRepository<Post, Integer> {
    Optional<Post> findByPoNumAndPoDel(Integer poNum, String poDel);
}