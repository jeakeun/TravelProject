package kr.hi.travel_community.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import kr.hi.travel_community.entity.NewsLetter;
import kr.hi.travel_community.model.util.CustomUser;
import kr.hi.travel_community.model.vo.MemberVO;
import kr.hi.travel_community.service.NewsLetterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@RestController
@RequestMapping("/api/newsletter")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RequiredArgsConstructor
public class NewsLetterController {

    private final NewsLetterService newsLetterService;

    @GetMapping("/posts")
    public List<Map<String, Object>> getList(
            @RequestParam(value = "type", required = false) String type,
            @RequestParam(value = "keyword", required = false) String keyword) {
        if (type != null && keyword != null && !keyword.trim().isEmpty()) {
            return newsLetterService.searchPosts(type, keyword);
        }
        return newsLetterService.getRealAllPosts();
    }

    @GetMapping("/posts/{id}")
    public ResponseEntity<?> getDetail(@PathVariable("id") Integer id,
                                       @RequestParam(value = "mbNum", required = false) Integer mbNum,
                                       HttpServletRequest request,
                                       HttpServletResponse response) {
        newsLetterService.increaseViewCount(id, request, response);
        Map<String, Object> postData = newsLetterService.getPostDetailWithImage(id, mbNum);
        return postData != null ? ResponseEntity.ok(postData) : ResponseEntity.notFound().build();
    }

    @PostMapping("/posts")
    public ResponseEntity<?> create(Authentication authentication,
                                    @RequestParam("poTitle") String title,
                                    @RequestParam("poContent") String content,
                                    @RequestParam(value = "image", required = false) MultipartFile image) {
        if (!isAdmin(authentication)) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        try {
            NewsLetter post = NewsLetter.builder()
                    .poTitle(title)
                    .poContent(content)
                    .poMbNum(resolveMbNum(authentication))
                    .build();
            newsLetterService.savePost(post, image != null ? List.of(image) : Collections.emptyList());
            return ResponseEntity.ok(Map.of("message", "Success"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @PutMapping("/posts/{id}")
    public ResponseEntity<?> update(Authentication authentication,
                                    @PathVariable("id") Integer id,
                                    @RequestParam("poTitle") String title,
                                    @RequestParam("poContent") String content,
                                    @RequestParam(value = "image", required = false) MultipartFile image) {
        if (!isAdmin(authentication)) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        try {
            newsLetterService.updatePost(id, title, content, image != null ? List.of(image) : null);
            return ResponseEntity.ok(Map.of("message", "Updated"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/posts/{id}")
    public ResponseEntity<?> delete(Authentication authentication, @PathVariable("id") Integer id) {
        if (!isAdmin(authentication)) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        newsLetterService.deletePost(id);
        return ResponseEntity.ok(Map.of("message", "Deleted"));
    }

    @PostMapping("/posts/{id}/like")
    public ResponseEntity<?> toggleLike(@PathVariable("id") Integer id, @RequestBody Map<String, Integer> data) {
        return ResponseEntity.ok(Map.of("status", newsLetterService.toggleLikeStatus(id, data.get("mbNum"))));
    }

    private boolean isAdmin(Authentication auth) {
        if (auth != null && auth.getPrincipal() instanceof CustomUser user) {
            return "ADMIN".equals(user.getMember().getMb_rol());
        }
        return false;
    }

    private int resolveMbNum(Authentication auth) {
        if (auth != null && auth.getPrincipal() instanceof CustomUser user) {
            return user.getMember().getMb_num();
        }
        return 1;
    }
}