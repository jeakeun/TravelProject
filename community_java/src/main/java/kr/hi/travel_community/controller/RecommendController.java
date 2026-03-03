package kr.hi.travel_community.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import kr.hi.travel_community.entity.RecommendPost;
import kr.hi.travel_community.model.util.CustomUser;
import kr.hi.travel_community.model.vo.MemberVO;
import kr.hi.travel_community.service.RecommendPostService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.*;

@RestController
@RequestMapping("/api/recommend")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000", "http://3.37.160.108"}, allowCredentials = "true")
@RequiredArgsConstructor
public class RecommendController {

    private final RecommendPostService recommendPostService;

    /**
     * 🚩 메인용 상위 10개 게시글 조회
     */
    @GetMapping("/posts")
    public ResponseEntity<List<Map<String, Object>>> getAllPosts(Authentication authentication) {
        Integer mbNum = resolveMbNum(authentication, null);
        return ResponseEntity.ok(recommendPostService.getAllPosts(mbNum));
    }

    /**
     * 🚩 전체 게시글 조회 (검색 기능 포함)
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
            Object poMbNumObj = postData.get("poMbNum");
            boolean isOwner = poMbNumObj != null && currentUserNum != null && poMbNumObj.toString().equals(currentUserNum.toString());
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
     * 🚩 게시글 생성 (비로그인 차단 및 일반 유저 허용)
     */
    @PostMapping("/posts")
    public ResponseEntity<?> createPost(
            Authentication authentication,
            @RequestParam(value = "poTitle", required = false) String poTitle,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "poContent", required = false) String poContent,
            @RequestParam(value = "content", required = false) String content,
            @RequestParam(value = "poMbNum", required = false) Integer requestPoMbNum,
            @RequestParam(value = "mbNum", required = false) Integer requestMbNum,
            @RequestParam(value = "images", required = false) List<MultipartFile> images) {
        
        // 🚩 [수정] 비로그인 상태일 경우 즉시 차단 (401 에러)
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "로그인이 필요한 서비스입니다."));
        }

        try {
            String finalTitle = (poTitle != null) ? poTitle : title;
            String finalContent = (poContent != null) ? poContent : content;

            // 인증 정보에서 유저 번호 추출
            Integer finalMbNum = resolveMbNum(authentication, (requestPoMbNum != null) ? requestPoMbNum : requestMbNum);
            
            if (finalMbNum == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "로그인이 필요한 서비스입니다."));
            }

            RecommendPost post = new RecommendPost();
            post.setPoTitle(finalTitle);
            post.setPoContent(finalContent);
            post.setPoMbNum(finalMbNum);
            
            recommendPostService.savePost(post, images);
            return ResponseEntity.ok("Success");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    /**
     * 🚩 게시글 수정
     */
    @PutMapping("/posts/{id}")
    public ResponseEntity<?> updatePost(
            @PathVariable(value = "id") Integer id,
            @RequestParam(value = "poTitle", required = false) String poTitle,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "poContent", required = false) String poContent,
            @RequestParam(value = "content", required = false) String content,
            @RequestParam(value = "images", required = false) List<MultipartFile> images) {
        try {
            String finalTitle = (poTitle != null) ? poTitle : title;
            String finalContent = (poContent != null) ? poContent : content;

            recommendPostService.updatePost(id, finalTitle, finalContent, images);
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

    /**
     * 🚩 좋아요 기능
     */
    @PostMapping("/posts/{id}/like")
    public ResponseEntity<?> toggleLike(@PathVariable(value = "id") Integer id, 
                                        @RequestBody(required = false) Map<String, Object> data,
                                        Authentication authentication) {
        
        Integer mbNum = resolveMbNum(authentication, (data != null && data.get("mbNum") != null) 
                        ? Integer.parseInt(data.get("mbNum").toString()) : null);

        if (mbNum == null) return ResponseEntity.status(401).body("Login Required");

        String status = recommendPostService.toggleLikeStatus(id, mbNum);
        return ResponseEntity.ok(Map.of("status", status));
    }

    /**
     * 🚩 게시글 신고 기능
     */
    @PostMapping("/posts/{id}/report")
    public ResponseEntity<?> reportPost(@PathVariable(value = "id") Integer id, 
                                        @RequestBody(required = false) Map<String, Object> body,
                                        Authentication authentication) {
        
        Integer mbNum = resolveMbNum(authentication, (body != null && body.get("mbNum") != null) 
                        ? Integer.parseInt(body.get("mbNum").toString()) : null);

        if (mbNum == null) return ResponseEntity.status(401).body("Login Required");

        String category = body != null && body.get("category") != null ? body.get("category").toString().trim() : "";
        String reason = body != null && body.get("reason") != null ? body.get("reason").toString().trim() : "";
        String combined = (category.isEmpty() ? "" : "[" + category + "] ") + reason;
        if (combined.trim().isEmpty()) combined = "신고 사유 없음";
        
        try {
            recommendPostService.reportPost(id, combined, mbNum);
            return ResponseEntity.ok("Reported");
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * 🚩 [수정] 인증 객체 검증 유틸리티 (비로그인 시 null 반환)
     */
    private Integer resolveMbNum(Authentication authentication, Integer requestMbNum) {
        if (authentication != null && authentication.isAuthenticated() && authentication.getPrincipal() instanceof CustomUser) {
            MemberVO member = ((CustomUser) authentication.getPrincipal()).getMember();
            if (member != null) return member.getMb_num();
        }
        // 🚩 로그인 정보가 없으면 파라미터가 있어도 null 반환하여 글쓰기 원천 차단
        return null;
    }
}