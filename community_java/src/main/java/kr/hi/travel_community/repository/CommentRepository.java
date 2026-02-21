package kr.hi.travel_community.repository;

import kr.hi.travel_community.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Integer> {
    List<Comment> findByPostPoNumAndCoDelOrderByCoDateAsc(Integer poNum, String coDel);
}