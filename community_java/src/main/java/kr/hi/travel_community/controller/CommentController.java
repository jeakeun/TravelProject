package kr.hi.travel_community.controller;

import kr.hi.travel_community.entity.Comment;
import kr.hi.travel_community.entity.Post;
import kr.hi.travel_community.repository.CommentRepository;
import kr.hi.travel_community.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/comment")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RequiredArgsConstructor
public class CommentController {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;

    // 1. 댓글 목록 조회
    @GetMapping("/list/{postId}")
    public ResponseEntity<List<Comment>> getComments(@PathVariable Integer postId) {
        List<Comment> comments = commentRepository.findByPostPoNumAndCoDelOrderByCoDateAsc(postId, "N");
        return ResponseEntity.ok(comments);
    }

    // 2. 댓글 등록
    @PostMapping("/add/{postId}")
    public ResponseEntity<?> addComment(@PathVariable Integer postId, @RequestParam String content) {
        Optional<Post> postOpt = postRepository.findById(postId);
        if (postOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "게시글 없음"));
        }

        Comment comment = Comment.builder()
                .coContent(content)
                .coDate(LocalDateTime.now())
                .coLike(0)
                .coDel("N")
                .post(postOpt.get())
                .build();
        commentRepository.save(comment);
        return ResponseEntity.ok(comment);
    }

    // 3. 댓글 삭제 (논리 삭제)
    @DeleteMapping("/delete/{commentId}")
    public ResponseEntity<?> deleteComment(@PathVariable Integer commentId) {
        Optional<Comment> commentOpt = commentRepository.findById(commentId);
        if (commentOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "댓글 없음"));
        }

        Comment comment = commentOpt.get();
        comment.setCoDel("Y");
        commentRepository.save(comment);

        return ResponseEntity.ok(Map.of("message", "삭제 완료"));
    }
}