package kr.hi.travel_community.repository;

import kr.hi.travel_community.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Integer> {
    List<Comment> findByPostPoNumAndCoDelOrderByCoDateAsc(Integer poNum, String coDel);

    // 🚩 추가: 게시글 번호와 삭제 여부를 기준으로 댓글 개수를 카운트하는 메서드
    long countByPostPoNumAndCoDel(Integer poNum, String coDel);
}