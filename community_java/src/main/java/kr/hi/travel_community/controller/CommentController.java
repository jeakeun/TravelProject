package kr.hi.travel_community.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import kr.hi.travel_community.entity.Comment;
import kr.hi.travel_community.repository.CommentRepository;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class CommentController {

    @Autowired
    private CommentRepository commentRepository;

    // 1. 댓글 등록 (대댓글 로직 및 DB 제약 조건 해결)
    @PostMapping
    @Transactional // 🚩 1차 저장 후 업데이트를 수행하므로 트랜잭션이 필수입니다.
    public ResponseEntity<?> addComment(@RequestBody Comment comment) {
        try {
            // [로직 설명]
            // 일반 댓글(부모 없음)은 리액트에서 0을 보내도록 약속했습니다.
            // DB의 co_ori_num이 자기 참조 FK이므로, 존재하지 않는 번호(0 등)를 넣으면 에러가 납니다.
            // 따라서 일반 댓글은 일단 null로 저장하여 제약을 피합니다.
            
            boolean isGeneralComment = (comment.getParentId() == null || comment.getParentId() == 0);

            if (isGeneralComment) {
                comment.setParentId(null); 
            }

            // 1단계: 댓글 저장 (co_num 생성 시점)
            // 일반 댓글이라면 co_ori_num에 null이 들어가며 DB 제약 조건을 통과합니다.
            Comment saved = commentRepository.save(comment);

            // 2단계: 일반 댓글인 경우, 생성된 본인의 id(co_num)를 부모 번호(co_ori_num)로 설정
            if (isGeneralComment) {
                saved.setParentId(saved.getId());
                // JPA의 더티 체킹(Dirty Checking) 또는 재저장을 통해 업데이트 수행
                commentRepository.save(saved); 
            }

            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            // 콘솔에 찍힌 상세 에러를 응답 바디에 담아 보냅니다.
            return ResponseEntity.internalServerError().body("댓글 저장 실패: " + e.getMessage());
        }
    }

    // 2. 댓글 목록 조회
    @GetMapping("/post/{postId}")
    public List<Comment> getComments(@PathVariable("postId") Integer postId) {
        // 해당 게시글의 모든 댓글을 작성 순으로 가져옵니다.
        return commentRepository.findByPostIdOrderByCreatedAtAsc(postId);
    }

    // 3. 신고하기
    @PostMapping("/report/{id}")
    public ResponseEntity<?> reportComment(@PathVariable("id") Integer id) {
        // 신고 로직 (필요 시 구현)
        return ResponseEntity.ok("신고 접수 완료: " + id);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteComment(@PathVariable("id") Integer id) {
        try {
            // 실제로는 삭제 처리(isDel = 'Y')를 하는 것이 좋습니다.
            commentRepository.deleteById(id);
            return ResponseEntity.ok("삭제 완료");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("삭제 실패");
        }
    }
}