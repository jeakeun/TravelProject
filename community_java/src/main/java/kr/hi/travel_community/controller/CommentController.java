package kr.hi.travel_community.controller;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

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

    /**
     * 댓글 목록 조회
     */
    @GetMapping("/list/{postId}")
    public ResponseEntity<List<Map<String, Object>>> getComments(
            @PathVariable("postId") Integer postId,
            @RequestParam(value = "type", defaultValue = "RECOMMEND") String type){
        
        List<Comment> comments = commentRepository.findByCoPoNumAndCoPoTypeAndCoDelOrderByCoDateAsc(postId, type, "N");
        
        List<Map<String, Object>> result = comments.stream().map(c -> {
            Map<String, Object> map = new HashMap<>();
            map.put("coNum", c.getCoNum());
            map.put("coContent", c.getCoContent());
            map.put("coDate", c.getCoDate());
            map.put("coLike", (c.getCoLike() == null) ? 0 : c.getCoLike());
            map.put("coOriNum", c.getCoOriNum());
            map.put("coPoNum", c.getCoPoNum());
            map.put("coMbNum", c.getCoMbNum());

            // 🚩 작성자 닉네임 조회 로직 보강
            String nickname = "알 수 없는 사용자";
            if (c.getCoMbNum() != null) {
                nickname = memberRepository.findById(c.getCoMbNum())
                        .map(Member::getMbNickname)
                        .orElse("탈퇴한 사용자");
            }
            map.put("coNickname", nickname);
            
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    /**
     * 댓글 등록
     */
    @PostMapping("/add/{postId}")
    public ResponseEntity<?> addComment(@PathVariable("postId") Integer postId,
                                        @RequestBody Map<String, Object> payload){
        
        Object mbNumObj = payload.get("mbNum");
        if (mbNumObj == null) return ResponseEntity.status(401).body(Map.of("error","로그인 정보가 없습니다."));
        
        Integer mbNum = Integer.parseInt(mbNumObj.toString());
        Member member = memberRepository.findById(mbNum).orElse(null); 
        if(member == null) return ResponseEntity.status(401).body(Map.of("error","사용자를 찾을 e수 없습니다."));

        String content = (String) payload.get("content");
        String type = (String) payload.getOrDefault("type", "RECOMMEND");
        
        // 🚩 부모 댓글 번호(답글) 처리 로직 안정화
        Integer parentId = null;
        Object parentIdObj = payload.get("parentId");
        if (parentIdObj != null && !parentIdObj.toString().isEmpty()) {
            try {
                parentId = Integer.parseInt(parentIdObj.toString());
                if (parentId == 0) parentId = null;
            } catch (NumberFormatException e) {
                parentId = null;
            }
        }
        
        Comment comment = Comment.builder()
                .coContent(content)
                .coDate(LocalDateTime.now())
                .coLike(0)
                .coDel("N")
                .coOriNum(parentId) // 답글인 경우 부모 ID 저장
                .coPoNum(postId)
                .coPoType(type)
                .coMbNum(member.getMbNum()) 
                .build();
                
        commentRepository.save(comment);
        
        Map<String, Object> response = new HashMap<>();
        response.put("coNum", comment.getCoNum());
        response.put("coNickname", member.getMbNickname()); // 즉시 반영용
        response.put("msg", "댓글 작성 완료");
        return ResponseEntity.ok(response);
    }

    @PutMapping("/update/{commentId}")
    public ResponseEntity<?> updateComment(@PathVariable("commentId") Integer commentId,
                                           @RequestBody Map<String, String> payload){
        Comment comment = commentRepository.findById(commentId).orElse(null);
        if(comment == null) return ResponseEntity.status(404).body(Map.of("error","댓글을 찾을 수 없습니다."));

        comment.setCoContent(payload.get("content"));
        commentRepository.save(comment);
        return ResponseEntity.ok(Map.of("msg","수정 완료"));
    }

    @DeleteMapping("/delete/{commentId}")
    public ResponseEntity<?> deleteComment(@PathVariable("commentId") Integer commentId){
        Comment comment = commentRepository.findById(commentId).orElse(null);
        if(comment == null) return ResponseEntity.status(404).body(Map.of("error","댓글을 찾을 수 없습니다."));

        comment.setCoDel("Y"); // 소프트 삭제
        commentRepository.save(comment);
        return ResponseEntity.ok(Map.of("msg","삭제 완료"));
    }

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

        Optional<CommentLike> existingLike = commentLikeRepository.findByMemberAndComment(member, comment);
        Map<String, Object> response = new HashMap<>();

        int currentLikes = (comment.getCoLike() == null) ? 0 : comment.getCoLike();

        if (existingLike.isPresent()) {
            commentLikeRepository.delete(existingLike.get());
            comment.setCoLike(Math.max(0, currentLikes - 1));
            response.put("status", "unliked");
        } else {
            CommentLike newLike = CommentLike.builder()
                    .member(member)
                    .comment(comment)
                    .build();
            commentLikeRepository.save(newLike);
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
        if (payload == null) return ResponseEntity.badRequest().body("잘못된 요청입니다.");

        String category = payload.get("category") != null ? payload.get("category").toString().trim() : "";
        String reason = payload.get("reason") != null ? payload.get("reason").toString().trim() : "";
        String combined = (category.isEmpty() ? "" : "[" + category + "] ") + reason;
        
        if (combined.trim().isEmpty()) combined = "신고 사유 없음";
        
        Integer mbNum = payload.get("mbNum") != null ? Integer.parseInt(payload.get("mbNum").toString()) : null;
        
        Comment comment = commentRepository.findById(commentId).orElse(null);
        if (comment == null) return ResponseEntity.status(404).body(Map.of("error", "댓글을 찾을 수 없습니다."));
        
        if (mbNum != null && mbNum > 0) {
            if (reportRepository.existsByRbIdAndRbNameAndRbMbNum(commentId, "RECOMMEND_COMMENT", mbNum)) {
                return ResponseEntity.badRequest().body("이미 신고하신 댓글입니다.");
            }
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