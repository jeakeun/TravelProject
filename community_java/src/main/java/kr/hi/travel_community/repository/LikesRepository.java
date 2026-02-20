package kr.hi.travel_community.repository;

import kr.hi.travel_community.entity.Likes;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface LikesRepository extends JpaRepository<Likes, Integer> {
    // 특정 게시글(liId)에 대해 특정 유저(liMbNum)가 추천했는지 확인하는 메서드
    Optional<Likes> findByLiIdAndLiNameAndLiMbNum(Integer liId, String liName, Integer liMbNum);
}