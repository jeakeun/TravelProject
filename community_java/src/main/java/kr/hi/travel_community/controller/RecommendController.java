package kr.hi.travel_community.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import kr.hi.travel_community.entity.RecommendPost;
import kr.hi.travel_community.model.util.CustomUser;
import kr.hi.travel_community.model.vo.MemberVO;
import kr.hi.travel_community.service.RecommendPostService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.*;

@RestController
@RequestMapping("/api/recommend")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"}, allowCredentials = "true")
@RequiredArgsConstructor
public class RecommendController {

    private final RecommendPostService recommendPostService;

    /**
     * 🚩 메인용 상위 10개 게시글 조회
     * [수정] 로그인 정보를 넘겨서 좋아요/즐겨찾기 여부 확인
     */
    @GetMapping("/posts")
    public ResponseEntity<List<Map<String, Object>>> getAllPosts(Authentication authentication) {
        Integer mbNum = resolveMbNum(authentication, null);
        return ResponseEntity.ok(recommendPostService.getAllPosts(mbNum));
    }

    /**
     * 🚩 전체 게시글 조회 (검색 기능 포함)
     * [수정] 로그인 정보를 넘겨서 좋아요/즐겨찾기 여부 확인
     */
    @GetMapping("/posts/all")
    public ResponseEntity<List<Map<String, Object>>> getRealAllPosts(
            Authentication authentication,
            @RequestParam(value = "type", required = false) String type,
            @RequestParam(value = "keyword", required = false) String keyword) {
        
        Integer mbNum = resolveMbNum(authentication, null);

        if (type != null && keyword != null && !keyword.trim().isEmpty()) {
            System.out.println("🚩 검색 요청 실행 -> 타입: " + type + ", 키워드: " + keyword);
            return ResponseEntity.ok(recommendPostService.searchPosts(type, keyword, mbNum));
        }
        
        return ResponseEntity.ok(recommendPostService.getRealAllPosts(mbNum)); 
    }

    /**
     * 🚩 상세 페이지 조회 및 조회수 처리
     */
    @GetMapping("/posts/{id}")
    public ResponseEntity<?> getPostDetail(
            Authentication authentication,
            @PathVariable(value = "id") Integer id, 
            @RequestParam(value = "mbNum", required = false) Integer mbNum,
            HttpServletRequest request, 
            HttpServletResponse response) {
        
        recommendPostService.increaseViewCount(id, request, response);
        
        Integer currentUserNum = resolveMbNum(authentication, mbNum);
        String currentUserRole = "USER";
        
        if (authentication != null && authentication.getPrincipal() instanceof CustomUser) {
            MemberVO member = ((CustomUser) authentication.getPrincipal()).getMember();
            if (member != null) {
                currentUserRole = member.getMb_rol();
            }
        }

        Map<String, Object> postData = recommendPostService.getPostDetailWithImage(id, currentUserNum);
        
        if (postData != null) {
            boolean isOwner = postData.get("poMbNum") != null && postData.get("poMbNum").equals(currentUserNum);
            boolean isAdmin = "ADMIN".equals(currentUserRole);
            
            postData.put("isOwner", isOwner);
            postData.put("isAdmin", isAdmin);
        }
        
        return postData != null ? ResponseEntity.ok(postData) : ResponseEntity.notFound().build();
    }

    @PostMapping("/posts/{id}/view")
    public ResponseEntity<?> increaseView(@PathVariable(value = "id") Integer id) {
        return ResponseEntity.ok().build();
    }

    /**
     * 🚩 게시글 생성
     */
    @PostMapping("/posts")
    public ResponseEntity<?> createPost(
            Authentication authentication,
            @RequestParam(value = "poTitle") String poTitle,
            @RequestParam(value = "poContent") String poContent,
            @RequestParam(value = "poMbNum", required = false) Integer requestMbNum,
            @RequestParam(value = "images", required = false) List<MultipartFile> images) {
        try {
            int mbNum = resolveMbNum(authentication, requestMbNum);
            RecommendPost post = new RecommendPost();
            post.setPoTitle(poTitle);
            post.setPoContent(poContent);
            post.setPoMbNum(mbNum);
            
            recommendPostService.savePost(post, images);
            return ResponseEntity.ok("Success");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    /**
     * [수정] 공통 로직: Authentication 정보가 있으면 해당 유저 정보를, 없으면 전달된 ID(또는 null)를 반환
     */
    private Integer resolveMbNum(Authentication authentication, Integer requestMbNum) {
        if (authentication != null && authentication.getPrincipal() instanceof CustomUser) {
            MemberVO member = ((CustomUser) authentication.getPrincipal()).getMember();
            if (member != null) return member.getMb_num();
        }
        return requestMbNum; // requestMbNum이 없으면 null 반환 (비로그인 상태 대응)
    }

    @PutMapping("/posts/{id}")
    public ResponseEntity<?> updatePost(
            @PathVariable(value = "id") Integer id,
            @RequestParam(value = "poTitle") String poTitle,
            @RequestParam(value = "poContent") String poContent,
            @RequestParam(value = "images", required = false) List<MultipartFile> images) {
        try {
            recommendPostService.updatePost(id, poTitle, poContent, images);
            return ResponseEntity.ok("Updated Success");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @DeleteMapping("/posts/{id}")
    public ResponseEntity<?> deletePost(@PathVariable(value = "id") Integer id) {
        try {
            recommendPostService.deletePost(id);
            return ResponseEntity.ok("Deleted Success");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @PostMapping("/posts/{id}/like")
    public ResponseEntity<?> toggleLike(@PathVariable(value = "id") Integer id, @RequestBody Map<String, Object> data) {
        Object mbNumObj = data.get("mbNum");
        int mbNum = (mbNumObj != null) ? Integer.parseInt(mbNumObj.toString()) : 1;
        String status = recommendPostService.toggleLikeStatus(id, mbNum);
        return ResponseEntity.ok(Map.of("status", status));
    }

    @PostMapping("/posts/{id}/report")
    public ResponseEntity<?> reportPost(@PathVariable(value = "id") Integer id, @RequestBody(required = false) Map<String, Object> body) {
        String category = body != null && body.get("category") != null ? body.get("category").toString().trim() : "";
        String reason = body != null && body.get("reason") != null ? body.get("reason").toString().trim() : "";
        String combined = (category.isEmpty() ? "" : "[" + category + "] ") + reason;
        if (combined.trim().isEmpty()) combined = "신고 사유 없음";
        Integer mbNum = body != null && body.get("mbNum") != null ? Integer.parseInt(body.get("mbNum").toString()) : null;
        try {
            recommendPostService.reportPost(id, combined, mbNum);
            return ResponseEntity.ok("Reported");
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}