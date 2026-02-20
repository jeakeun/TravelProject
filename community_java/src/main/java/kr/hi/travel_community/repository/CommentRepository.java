package kr.hi.travel_community.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import kr.hi.travel_community.entity.Comment;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Integer> {
    
    // 🚩 1. 기존 기능: 해당 게시글의 모든 댓글을 작성 순으로 조회
    List<Comment> findByPostIdOrderByCreatedAtAsc(Integer postId);

    // 🚩 2. 추가 기능: 특정 게시글의 댓글 총 개수를 구하는 메서드
    // RecommendController에서 'commentCount'를 표시하기 위해 사용됩니다.
    long countByPostId(Integer postId);
}