package kr.hi.travel_community.repository;

import kr.hi.travel_community.entity.Likes;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface LikesRepository extends JpaRepository<Likes, Integer> {

    /**
     * 🚩 특정 사용자가 특정 게시물의 특정 타입(FREE 등)에 좋아요를 눌렀는지 확인
     */
    Optional<Likes> findByLiIdAndLiMbNumAndLiName(Integer liId, Integer liMbNum, String liName);

    /**
     * 🚩 좋아요 여부 확인 (존재 여부만 true/false로 반환)
     */
    boolean existsByLiIdAndLiMbNumAndLiName(Integer liId, Integer liMbNum, String liName);

    /**
     * 🚩 좋아요 취소 (삭제)
     */
    void deleteByLiIdAndLiMbNumAndLiName(Integer liId, Integer liMbNum, String liName);
}