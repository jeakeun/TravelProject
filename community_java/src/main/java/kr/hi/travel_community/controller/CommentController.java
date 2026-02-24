package kr.hi.travel_community.controller;

import java.time.LocalDateTime;
import java.util.*;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import kr.hi.travel_community.entity.Comment;
import kr.hi.travel_community.entity.CommentLike;
import kr.hi.travel_community.entity.Member;
import kr.hi.travel_community.entity.ReportBox;
import kr.hi.travel_community.repository.CommentRepository;
import kr.hi.travel_community.repository.MemberRepository;
import kr.hi.travel_community.repository.CommentLikeRepository;
import kr.hi.travel_community.repository.ReportRepository;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/comment")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RequiredArgsConstructor
public class CommentController {

    private final CommentRepository commentRepository;
    private final MemberRepository memberRepository;
    private final CommentLikeRepository commentLikeRepository;
    private final ReportRepository reportRepository;

    // 🚩 [수정] Repository 메서드명 일치 (OrderByCoDateAsc 추가)
    @GetMapping("/list/{postId}")
    public ResponseEntity<List<Comment>> getComments(
            @PathVariable("postId") Integer postId,
            @RequestParam(value = "type", defaultValue = "RECOMMEND") String type){
        
        return ResponseEntity.ok(commentRepository.findByCoPoNumAndCoPoTypeAndCoDelOrderByCoDateAsc(postId, type, "N"));
    }

    @PostMapping("/add/{postId}")
    public ResponseEntity<?> addComment(@PathVariable("postId") Integer postId,
                                        @RequestBody Map<String, Object> payload){
        
        // 실제 운영시는 세션에서 가져와야 함 (현재는 테스트용 1번 멤버)
        Integer mbNum = 1; 
        Member member = memberRepository.findById(mbNum).orElse(null); 
        if(member == null) return ResponseEntity.status(401).body(Map.of("error","로그인 필요"));

        String content = (String) payload.get("content");
        String type = (String) payload.getOrDefault("type", "RECOMMEND");
        
        Integer parentId = null;
        Object parentIdObj = payload.get("parentId");
        if (parentIdObj != null) {
            try {
                parentId = Integer.parseInt(parentIdObj.toString());
                if (parentId == 0) parentId = null;
            } catch (NumberFormatException e) {
                parentId = null;
            }
        }
        
        // 🚩 [수정] Comment 엔티티의 필드명(coPoNum, coPoType, coMbNum)에 맞춰 빌더 구성
        Comment comment = Comment.builder()
                .coContent(content)
                .coDate(LocalDateTime.now())
                .coLike(0)
                .coDel("N")
                .coOriNum(parentId)
                .coPoNum(postId)
                .coPoType(type)
                .coMbNum(member.getMbNum()) 
                .build();
                
        commentRepository.save(comment);
        
        Map<String, Object> response = new HashMap<>();
        response.put("coNum", comment.getCoNum());
        response.put("msg", "댓글 작성 완료");
        return ResponseEntity.ok(response);
    }

    @PutMapping("/update/{commentId}")
    public ResponseEntity<?> updateComment(@PathVariable("commentId") Integer commentId,
                                           @RequestBody Map<String, String> payload){
        Comment comment = commentRepository.findById(commentId).orElse(null);
        if(comment == null) return ResponseEntity.status(404).body(Map.of("error","댓글 없음"));

        comment.setCoContent(payload.get("content"));
        commentRepository.save(comment);
        return ResponseEntity.ok(Map.of("msg","수정 완료"));
    }

    @DeleteMapping("/delete/{commentId}")
    public ResponseEntity<?> deleteComment(@PathVariable("commentId") Integer commentId){
        Comment comment = commentRepository.findById(commentId).orElse(null);
        if(comment == null) return ResponseEntity.status(404).body(Map.of("error","댓글 없음"));

        comment.setCoDel("Y");
        commentRepository.save(comment);
        return ResponseEntity.ok(Map.of("msg","삭제 완료"));
    }

    // 🚩 [수정] CommentLike 처리 로직
    @PostMapping("/like/{commentId}")
    public ResponseEntity<?> likeComment(@PathVariable("commentId") Integer commentId, 
                                         @RequestBody Map<String, Integer> payload) {
        Integer mbNum = payload.get("mbNum");
        if (mbNum == null || mbNum == 0) {
            return ResponseEntity.status(401).body(Map.of("error", "로그인이 필요한 서비스 입니다"));
        }

        Comment comment = commentRepository.findById(commentId).orElse(null);
        Member member = memberRepository.findById(mbNum).orElse(null);
        
        if(comment == null || member == null) return ResponseEntity.status(404).build();

        // [주의] CommentLikeRepository에 findByMemberAndComment가 정의되어 있어야 함
        Optional<CommentLike> existingLike = commentLikeRepository.findByMemberAndComment(member, comment);
        Map<String, Object> response = new HashMap<>();

        if (existingLike.isPresent()) {
            commentLikeRepository.delete(existingLike.get());
            int currentLikes = (comment.getCoLike() == null) ? 0 : comment.getCoLike();
            comment.setCoLike(Math.max(0, currentLikes - 1));
            response.put("status", "unliked");
        } else {
            CommentLike newLike = CommentLike.builder()
                    .member(member)
                    .comment(comment)
                    .build();
            commentLikeRepository.save(newLike);
            int currentLikes = (comment.getCoLike() == null) ? 0 : comment.getCoLike();
            comment.setCoLike(currentLikes + 1);
            response.put("status", "liked");
        }
        
        commentRepository.save(comment);
        response.put("count", comment.getCoLike());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/report/{commentId}")
    public ResponseEntity<?> reportComment(@PathVariable("commentId") Integer commentId, 
                                           @RequestBody Map<String, Object> payload) {
        String category = payload != null && payload.get("category") != null ? payload.get("category").toString().trim() : "";
        String reason = payload != null && payload.get("reason") != null ? payload.get("reason").toString().trim() : "";
        String combined = (category.isEmpty() ? "" : "[" + category + "] ") + reason;
        if (combined.trim().isEmpty()) combined = "신고 사유 없음";
        Integer mbNum = payload != null && payload.get("mbNum") != null ? Integer.parseInt(payload.get("mbNum").toString()) : null;
        Comment comment = commentRepository.findById(commentId).orElse(null);
        if (comment == null) return ResponseEntity.status(404).body(Map.of("error", "댓글을 찾을 수 없습니다."));
        if (mbNum != null && mbNum > 0) {
            ReportBox rb = new ReportBox();
            rb.setRbId(commentId);
            rb.setRbName("RECOMMEND_COMMENT");
            rb.setRbContent(combined);
            rb.setRbMbNum(mbNum);
            rb.setRbManage("N");
            reportRepository.save(rb);
        }
        return ResponseEntity.ok(Map.of("msg", "신고 접수 완료"));
    }
}