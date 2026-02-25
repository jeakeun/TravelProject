package kr.hi.travel_community.repository;

import kr.hi.travel_community.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Integer> {

    /**
     * 특정 게시글의 삭제되지 않은 댓글 목록을 작성일 순으로 조회
     */
    List<Comment> findByCoPoNumAndCoPoTypeAndCoDelOrderByCoDateAsc(Integer coPoNum, String coPoType, String coDel);

    /**
     * 특정 게시글의 삭제되지 않은 댓글 총 개수 조회
     */
    long countByCoPoNumAndCoPoTypeAndCoDel(Integer coPoNum, String coPoType, String coDel);

    /**
     * 🚩 [추가] 특정 부모 댓글에 속한 답글들만 조회 (필요 시 사용)
     */
    List<Comment> findByCoOriNumAndCoDelOrderByCoDateAsc(Integer coOriNum, String coDel);
}