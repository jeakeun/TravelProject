package kr.hi.travel_community.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import kr.hi.travel_community.entity.FreePost;
import kr.hi.travel_community.model.util.CustomUser;
import kr.hi.travel_community.model.vo.MemberVO;
import kr.hi.travel_community.service.FreePostService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@RestController
@RequestMapping("/api/news")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RequiredArgsConstructor
public class NoticeBoardController {

    private final FreePostService freePostService;

    // 🚩 게시글 리스트 조회
    @GetMapping("/notice")
    public List<Map<String, Object>> getList() {
        return freePostService.getRealAllPosts();
    }

    // 🚩 게시글 상세 조회
    @GetMapping("/notice/{id}")
    public ResponseEntity<?> getDetail(@PathVariable("id") Integer id,
                                       @RequestParam(value = "mbNum", required = false) Integer mbNum,
                                       HttpServletRequest request,
                                       HttpServletResponse response) {
        
        // ✅ 조회수 증가 (쿠키 방어 로직을 위해 request와 response를 반드시 전달)
        freePostService.increaseViewCount(id, request, response);
        
        // 상세 데이터 조회 (좋아요 상태 확인을 위해 mbNum 전달)
        Integer currentUserNum = (mbNum != null) ? mbNum : 1;
        Map<String, Object> postData = freePostService.getPostDetailWithImage(id, currentUserNum);
        
        return postData != null 
                ? ResponseEntity.ok(postData) 
                : ResponseEntity.status(404).body(Map.of("error", "게시글 없음"));
    }

    // 🚩 게시글 등록 - po_mb_num을 로그인 회원 mb_num과 동일하게 설정
    @PostMapping("/notice")
    public ResponseEntity<?> create(Authentication authentication,
                                    @RequestParam(value = "title", required = false) String title,
                                    @RequestParam(value = "nnTitle", required = false) String nnTitle,
                                    @RequestParam(value = "content", required = false) String content,
                                    @RequestParam(value = "nnContent", required = false) String nnContent,
                                    @RequestParam(value = "mbNum", required = false) Integer requestMbNum,
                                    @RequestParam(value = "nnMbNum", required = false) Integer requestPoMbNum,
                                    @RequestParam(value = "image", required = false) MultipartFile image) {
        try {
            String finalTitle = (title != null && !title.isEmpty()) ? title : nnTitle;
            String finalContent = (content != null && !content.isEmpty()) ? content : nnContent;
            if (finalTitle == null || finalContent == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "제목과 내용을 입력하세요."));
            }
            int mbNum = resolveMbNum(authentication, requestMbNum != null ? requestMbNum : requestPoMbNum);
            FreePost post = new FreePost();
            post.setPoTitle(finalTitle);
            post.setPoContent(finalContent);
            post.setPoMbNum(mbNum);
            List<MultipartFile> images = (image != null) ? List.of(image) : Collections.emptyList();
            freePostService.savePost(post, images);
            return ResponseEntity.ok("Success");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "등록 실패: " + e.getMessage()));
        }
    }

    private int resolveMbNum(Authentication authentication, Integer requestMbNum) {
        if (authentication != null && authentication.getPrincipal() instanceof CustomUser) {
            MemberVO member = ((CustomUser) authentication.getPrincipal()).getMember();
            if (member != null) return member.getMb_num();
        }
        return requestMbNum != null ? requestMbNum : 1;
    }

    // 🚩 게시글 수정
    @PutMapping("/notice/{id}")
    public ResponseEntity<?> update(@PathVariable("id") Integer id,
                                    @RequestParam("title") String title,
                                    @RequestParam("content") String content,
                                    @RequestParam(value = "image", required = false) MultipartFile image) {
        try {
            List<MultipartFile> images = (image != null) ? List.of(image) : null;
            freePostService.updatePost(id, title, content, images);
            return ResponseEntity.ok("Updated Success");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "수정 실패"));
        }
    }

    // 🚩 게시글 삭제
    @DeleteMapping("/notice/{id}")
    public ResponseEntity<?> delete(@PathVariable("id") Integer id) {
        try {
            freePostService.deletePost(id);
            return ResponseEntity.ok("Deleted Success");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "삭제 실패"));
        }
    }

    // 🚩 추천(좋아요) 기능
    @PostMapping("/notice/{id}/like")
    public ResponseEntity<?> toggleLike(@PathVariable("id") Integer id, @RequestBody Map<String, Object> data) {
        Object mbNumObj = data.get("mbNum");
        int mbNum = (mbNumObj != null) ? Integer.parseInt(mbNumObj.toString()) : 1;
        String status = freePostService.toggleLikeStatus(id, mbNum);
        return ResponseEntity.ok(Map.of("status", status));
    }
}