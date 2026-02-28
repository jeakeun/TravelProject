package kr.hi.travel_community.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import kr.hi.travel_community.entity.FreePost;
import kr.hi.travel_community.model.util.CustomUser;
import kr.hi.travel_community.model.vo.MemberVO;
import kr.hi.travel_community.service.FreePostService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@RestController
@RequestMapping("/api/freeboard")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"}, allowCredentials = "true")
@RequiredArgsConstructor
public class FreeBoardController {

    private final FreePostService freePostService;

    @GetMapping("/posts")
    public List<Map<String, Object>> getList() {
        return freePostService.getRealAllPosts();
    }

    @GetMapping("/posts/{id}")
    public ResponseEntity<?> getDetail(@PathVariable("id") Integer id,
                                       @RequestParam(value = "mbNum", required = false) Integer mbNum,
                                       HttpServletRequest request,
                                       HttpServletResponse response) {
        
        // 조회수 증가 처리 (쿠키 기반)
        freePostService.increaseViewCount(id, request, response);
        
        Integer currentUserNum = (mbNum != null) ? mbNum : 1;
        Map<String, Object> postData = freePostService.getPostDetailWithImage(id, currentUserNum);
        
        return postData != null 
                ? ResponseEntity.ok(postData) 
                : ResponseEntity.status(404).body(Map.of("error", "게시글 없음"));
    }

    /**
     * 🚩 게시글 등록
     */
    @PostMapping("/posts")
    public ResponseEntity<?> create(Authentication authentication,
                                    @RequestParam(value = "title", required = false) String title,
                                    @RequestParam(value = "poTitle", required = false) String poTitle,
                                    @RequestParam(value = "content", required = false) String content,
                                    @RequestParam(value = "poContent", required = false) String poContent,
                                    @RequestParam(value = "mbNum", required = false) Integer requestMbNum,
                                    @RequestParam(value = "poMbNum", required = false) Integer requestPoMbNum,
                                    @RequestParam(value = "images", required = false) List<MultipartFile> images) {
        
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "로그인이 필요한 서비스입니다."));
        }

        try {
            String finalTitle = (title != null && !title.isEmpty()) ? title : poTitle;
            String finalContent = (content != null && !content.isEmpty()) ? content : poContent;
            
            if (finalTitle == null || finalContent == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "제목과 내용을 입력하세요."));
            }
            
            int mbNum = resolveMbNum(authentication, requestMbNum != null ? requestMbNum : requestPoMbNum);
            
            FreePost post = new FreePost();
            post.setPoTitle(finalTitle);
            post.setPoContent(finalContent);
            post.setPoMbNum(mbNum);
            
            List<MultipartFile> finalImages = (images != null) ? images : Collections.emptyList();
            freePostService.savePost(post, finalImages);
            
            return ResponseEntity.ok("Success");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "등록 실패: " + e.getMessage()));
        }
    }

    /**
     * 작성자 번호 확인 유틸리티
     */
    private int resolveMbNum(Authentication authentication, Integer requestMbNum) {
        if (authentication != null && authentication.getPrincipal() instanceof CustomUser) {
            MemberVO member = ((CustomUser) authentication.getPrincipal()).getMember();
            if (member != null) return member.getMb_num();
        }
        return requestMbNum != null ? requestMbNum : 1;
    }

    /**
     * 🚩 게시글 수정
     */
    @PutMapping("/posts/{id}")
    public ResponseEntity<?> update(@PathVariable("id") Integer id,
                                    @RequestParam("title") String title,
                                    @RequestParam("content") String content,
                                    @RequestParam(value = "images", required = false) List<MultipartFile> images) {
        try {
            freePostService.updatePost(id, title, content, images);
            return ResponseEntity.ok("Updated Success");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "수정 실패"));
        }
    }

    /**
     * 🚩 게시글 삭제
     */
    @DeleteMapping("/posts/{id}")
    public ResponseEntity<?> delete(@PathVariable("id") Integer id) {
        try {
            freePostService.deletePost(id);
            return ResponseEntity.ok("Deleted Success");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "삭제 실패"));
        }
    }

    /**
     * 🚩 추천(좋아요) 기능 (보정 완료)
     */
    @PostMapping("/posts/{id}/like")
    public ResponseEntity<?> toggleLike(@PathVariable("id") Integer id, 
                                        @RequestBody(required = false) Map<String, Object> data,
                                        Authentication authentication) {
        // 인증 정보가 있다면 인증 정보 우선, 없다면 data에서 mbNum 추출
        Integer mbNum = null;
        if (authentication != null && authentication.isAuthenticated()) {
            mbNum = resolveMbNum(authentication, null);
        } else if (data != null && data.get("mbNum") != null) {
            mbNum = Integer.parseInt(data.get("mbNum").toString());
        }

        if (mbNum == null) return ResponseEntity.status(401).body("Login Required");

        String status = freePostService.toggleLikeStatus(id, mbNum);
        return ResponseEntity.ok(Map.of("status", status));
    }

    /**
     * 🚩 북마크 기능 (FreePostService 통합 버전으로 수정)
     */
    @PostMapping("/posts/{id}/bookmark")
    public ResponseEntity<?> toggleBookmark(@PathVariable("id") Integer id, 
                                            @RequestBody(required = false) Map<String, Object> data,
                                            Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "로그인이 필요한 서비스입니다."));
        }

        Integer mbNum = resolveMbNum(authentication, (data != null && data.get("mbNum") != null) 
                        ? Integer.parseInt(data.get("mbNum").toString()) : null);
        
        // FreePostService에 만들어둔 토글 로직 사용
        String result = freePostService.toggleBookmarkStatus(id, mbNum);
        
        boolean isBookmarked = result.equals("bookmarked");
        
        return ResponseEntity.ok(Map.of(
            "status", isBookmarked ? "ADDED" : "REMOVED",
            "isBookmarked", isBookmarked
        ));
    }

    /**
     * 🚩 게시글 신고 기능
     */
    @PostMapping("/posts/{id}/report")
    public ResponseEntity<?> reportPost(@PathVariable("id") Integer id, 
                                        @RequestBody Map<String, Object> data,
                                        Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "로그인이 필요한 서비스입니다."));
        }

        try {
            Object mbNumObj = data.get("mbNum");
            int mbNum = resolveMbNum(authentication, (mbNumObj != null) ? Integer.parseInt(mbNumObj.toString()) : null);
            String category = (String) data.get("category");
            String reason = (String) data.get("reason");

            freePostService.reportPost(id, mbNum, category, reason);
            
            return ResponseEntity.ok(Map.of("msg", "신고가 정상적으로 접수되었습니다."));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "신고 실패: " + e.getMessage()));
        }
    }
}