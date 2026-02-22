package kr.hi.travel_community.repository;

import kr.hi.travel_community.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Integer> {
    // [수정] 정렬 기능이 포함된 메서드명으로 정의
    List<Comment> findByCoPoNumAndCoPoTypeAndCoDelOrderByCoDateAsc(Integer coPoNum, String coPoType, String coDel);

    // 게시글 목록용 개수 확인
    long countByCoPoNumAndCoPoTypeAndCoDel(Integer coPoNum, String coPoType, String coDel);
}