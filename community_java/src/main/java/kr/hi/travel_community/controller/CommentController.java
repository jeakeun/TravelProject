package kr.hi.travel_community.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import kr.hi.travel_community.entity.Comment;
import kr.hi.travel_community.entity.CommentLike;
import kr.hi.travel_community.entity.Member;
import kr.hi.travel_community.entity.Post;
import kr.hi.travel_community.repository.CommentRepository;
import kr.hi.travel_community.repository.MemberRepository;
import kr.hi.travel_community.repository.PostRepository;
import kr.hi.travel_community.repository.CommentLikeRepository;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/comment")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RequiredArgsConstructor
public class CommentController {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final MemberRepository memberRepository;
    private final CommentLikeRepository commentLikeRepository;

    @GetMapping("/list/{postId}")
    public ResponseEntity<List<Comment>> getComments(@PathVariable("postId") Integer postId){
        // coDel이 "N"인 댓글만 가져오는 기존 로직 유지
        return ResponseEntity.ok(commentRepository.findByPostPoNumAndCoDelOrderByCoDateAsc(postId,"N"));
    }

    @PostMapping("/add/{postId}")
    public ResponseEntity<?> addComment(@PathVariable("postId") Integer postId,
                                        @RequestBody Map<String, Object> payload){
        // 실제 운영 시 시큐리티 세션 등을 사용해야 하지만 기존 로직(id=1) 유지
        Member member = memberRepository.findById(1).orElse(null); 
        if(member == null) return ResponseEntity.status(401).body(Map.of("error","로그인 필요"));

        String content = (String) payload.get("content");
        
        // 🚩 안정적인 parentId 추출 로직
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
        
        Post post = postRepository.findById(postId).orElse(null);
        if(post == null) return ResponseEntity.status(404).body(Map.of("error","게시글 없음"));

        Comment comment = Comment.builder()
                .coContent(content)
                .coDate(LocalDateTime.now())
                .coLike(0)
                .coDel("N")
                .coOriNum(parentId)
                .post(post)
                .member(member) 
                .build();
                
        commentRepository.save(comment);
        
        // 🚩 순환 참조 에러 방지를 위해 필요한 정보만 담은 Map 반환
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

        if (existingLike.isPresent()) {
            commentLikeRepository.delete(existingLike.get());
            // 🚩 Null 방지를 위해 getCoLike() null 체크 후 연산
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
        // 신고 로직은 기존처럼 성공 메시지 유지
        return ResponseEntity.ok(Map.of("msg", "신고 접수 완료"));
    }
}