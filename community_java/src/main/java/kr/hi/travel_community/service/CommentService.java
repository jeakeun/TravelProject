package kr.hi.travel_community.service;

import kr.hi.travel_community.entity.Comment;
import kr.hi.travel_community.entity.Member;
import kr.hi.travel_community.repository.CommentRepository;
import kr.hi.travel_community.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final MemberRepository memberRepository;

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getCommentList(Integer postId, String type) {
        List<Comment> comments = commentRepository.findByCoPoNumAndCoPoTypeAndCoDelOrderByCoDateAsc(postId, type, "N");

        return comments.stream().map(c -> {
            Map<String, Object> map = new HashMap<>();
            map.put("coNum", c.getCoNum());
            map.put("coContent", c.getCoContent());
            map.put("coDate", c.getCoDate());
            // 🚩 Null 방어 로직 추가
            map.put("coLike", c.getCoLike() == null ? 0 : c.getCoLike());
            map.put("coOriNum", c.getCoOriNum());
            map.put("coPoNum", c.getCoPoNum());
            map.put("coMbNum", c.getCoMbNum());

            // 🚩 작성자 닉네임 조회 로직 보강 (coNickname 필드 보장)
            String nickname = "알 수 없는 사용자";
            if (c.getCoMbNum() != null) {
                nickname = memberRepository.findById(c.getCoMbNum())
                        .map(Member::getMbNickname)
                        .orElse("탈퇴한 사용자");
            }
            map.put("coNickname", nickname);

            return map;
        }).collect(Collectors.toList());
    }

    @Transactional
    public Map<String, Object> addComment(Integer postId, String content, String type, Integer parentId, Integer mbNum) {
        Member member = memberRepository.findById(mbNum)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        // 🚩 답글(parentId)이 0으로 넘어올 경우 Null 처리
        Integer finalParentId = (parentId != null && parentId == 0) ? null : parentId;

        Comment comment = Comment.builder()
                .coContent(content)
                .coDate(LocalDateTime.now())
                .coLike(0)
                .coDel("N")
                .coOriNum(finalParentId)
                .coPoNum(postId)
                .coPoType(type)
                .coMbNum(mbNum)
                .build();

        commentRepository.save(comment);

        Map<String, Object> result = new HashMap<>();
        result.put("coNum", comment.getCoNum());
        result.put("coNickname", member.getMbNickname()); // 저장 후 즉시 닉네임 반환
        return result;
    }

    @Transactional
    public void updateComment(Integer commentId, String content) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("댓글이 존재하지 않습니다."));
        comment.setCoContent(content);
        commentRepository.save(comment);
    }

    @Transactional
    public void deleteComment(Integer commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("댓글이 존재하지 않습니다."));
        comment.setCoDel("Y");
        commentRepository.save(comment);
    }
}