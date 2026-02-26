package kr.hi.travel_community.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import kr.hi.travel_community.entity.FreePost;
import kr.hi.travel_community.entity.BookMark;
import kr.hi.travel_community.model.util.CustomUser;
import kr.hi.travel_community.model.vo.MemberVO;
import kr.hi.travel_community.service.FreePostService;
import kr.hi.travel_community.service.BookMarkService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@RestController
@RequestMapping("/api/freeboard")
// 🚩 [유지] 다른 PC 및 리액트 접속 허용
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"}, allowCredentials = "true")
@RequiredArgsConstructor
public class FreeBoardController {

    private final FreePostService freePostService;
    private final BookMarkService bookMarkService; // 🚩 즐겨찾기 서비스 주입

    // 🚩 게시글 리스트 조회 (작성자 닉네임 포함 데이터)
    @GetMapping("/posts")
    public List<Map<String, Object>> getList() {
        return freePostService.getRealAllPosts();
    }

    // 🚩 게시글 상세 조회 (작성자 닉네임 포함 데이터)
    @GetMapping("/posts/{id}")
    public ResponseEntity<?> getDetail(@PathVariable("id") Integer id,
                                       @RequestParam(value = "mbNum", required = false) Integer mbNum,
                                       HttpServletRequest request,
                                       HttpServletResponse response) {
        
        // ✅ 조회수 증가 (서비스에 선언된 쿠키 방어 로직 호출)
        freePostService.increaseViewCount(id, request, response);
        
        // 상세 데이터 조회 (좋아요 상태 확인을 위해 mbNum 전달)
        // 로그인 정보가 없으면 기본값으로 1을 사용하거나 null 처리를 서비스 로직에 따름
        Integer currentUserNum = (mbNum != null) ? mbNum : 1;
        Map<String, Object> postData = freePostService.getPostDetailWithImage(id, currentUserNum);
        
        return postData != null 
                ? ResponseEntity.ok(postData) 
                : ResponseEntity.status(404).body(Map.of("error", "게시글 없음"));
    }

    /**
     * 🚩 게시글 등록
     * 🚩 로그인 여부 체크 및 Multipart 이미지 처리
     */
    @PostMapping("/posts")
    public ResponseEntity<?> create(Authentication authentication,
                                    @RequestParam(value = "title", required = false) String title,
                                    @RequestParam(value = "poTitle", required = false) String poTitle,
                                    @RequestParam(value = "content", required = false) String content,
                                    @RequestParam(value = "poContent", required = false) String poContent,
                                    @RequestParam(value = "mbNum", required = false) Integer requestMbNum,
                                    @RequestParam(value = "poMbNum", required = false) Integer requestPoMbNum,
                                    @RequestParam(value = "image", required = false) MultipartFile image) {
        
        // 1. 로그인 여부 확인
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "로그인이 필요한 서비스입니다."));
        }

        try {
            // 요청 파라미터 유연한 처리 (title vs poTitle / content vs poContent)
            String finalTitle = (title != null && !title.isEmpty()) ? title : poTitle;
            String finalContent = (content != null && !content.isEmpty()) ? content : poContent;
            
            if (finalTitle == null || finalContent == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "제목과 내용을 입력하세요."));
            }
            
            // 2. 인증 객체에서 mbNum 추출
            int mbNum = resolveMbNum(authentication, requestMbNum != null ? requestMbNum : requestPoMbNum);
            
            // 3. 엔티티 생성 및 서비스 호출
            FreePost post = new FreePost();
            post.setPoTitle(finalTitle);
            post.setPoContent(finalContent);
            post.setPoMbNum(mbNum);
            
            // 이미지가 존재할 경우 리스트로 변환하여 서비스에 전달
            List<MultipartFile> images = (image != null) ? List.of(image) : Collections.emptyList();
            freePostService.savePost(post, images);
            
            return ResponseEntity.ok("Success");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "등록 실패: " + e.getMessage()));
        }
    }

    /**
     * 🚩 사용자 번호(mbNum) 추출 로직
     */
    private int resolveMbNum(Authentication authentication, Integer requestMbNum) {
        if (authentication != null && authentication.getPrincipal() instanceof CustomUser) {
            // CustomUser에서 MemberVO를 꺼내어 mb_num을 안전하게 참조
            MemberVO member = ((CustomUser) authentication.getPrincipal()).getMember();
            if (member != null) return member.getMb_num();
        }
        // 인증 정보가 없으면 요청 파라미터의 번호를 사용하고, 그마저 없으면 기본값 1 반환
        return requestMbNum != null ? requestMbNum : 1;
    }

    // 🚩 게시글 수정
    @PutMapping("/posts/{id}")
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
    @DeleteMapping("/posts/{id}")
    public ResponseEntity<?> delete(@PathVariable("id") Integer id) {
        try {
            freePostService.deletePost(id);
            return ResponseEntity.ok("Deleted Success");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "삭제 실패"));
        }
    }

    // 🚩 추천(좋아요) 기능
    @PostMapping("/posts/{id}/like")
    public ResponseEntity<?> toggleLike(@PathVariable("id") Integer id, @RequestBody Map<String, Object> data) {
        Object mbNumObj = data.get("mbNum");
        int mbNum = (mbNumObj != null) ? Integer.parseInt(mbNumObj.toString()) : 1;
        String status = freePostService.toggleLikeStatus(id, mbNum);
        return ResponseEntity.ok(Map.of("status", status));
    }

    // 🚩 즐겨찾기(북마크) 토글 기능 추가
    @PostMapping("/posts/{id}/bookmark")
    public ResponseEntity<?> toggleBookmark(@PathVariable("id") Integer id, 
                                            @RequestBody Map<String, Object> data,
                                            Authentication authentication) {
        // 북마크도 로그인이 필요함
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "로그인이 필요한 서비스입니다."));
        }

        Object mbNumObj = data.get("mbNum");
        int mbNum = resolveMbNum(authentication, (mbNumObj != null) ? Integer.parseInt(mbNumObj.toString()) : null);
        
        BookMark bookMark = BookMark.builder()
                .bmPoNum(id)
                .bmPoType("FREE") // 자유게시판 타입 지정
                .bmMbNum(mbNum)
                .build();
        
        boolean isAdded = bookMarkService.toggleBookMark(bookMark);
        
        return ResponseEntity.ok(Map.of(
            "status", isAdded ? "ADDED" : "REMOVED",
            "isBookmarked", isAdded
        ));
    }
}