package kr.hi.travel_community.repository;

import kr.hi.travel_community.entity.Comment;
import kr.hi.travel_community.entity.CommentLike;
import kr.hi.travel_community.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CommentLikeRepository extends JpaRepository<CommentLike, Integer> {
    // 특정 회원이 특정 댓글에 좋아요를 눌렀는지 확인
    Optional<CommentLike> findByMemberAndComment(Member member, Comment comment);
}