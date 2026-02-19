package kr.hi.travel_community.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import kr.hi.travel_community.entity.Post;
import kr.hi.travel_community.repository.PostRepository;

import java.io.File;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/reviewboard") // 🚩 주소 분리
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class ReviewBoardController {

    @Autowired
    private PostRepository postRepository;

    private final String uploadDir = System.getProperty("user.dir") + "/src/main/resources/static/pic/";

    @PostMapping("/posts")
    public ResponseEntity<?> createReviewPost(
            @RequestParam Map<String, String> allParams, 
            @RequestParam(value = "image", required = false) MultipartFile image) {
        
        try {
            Post post = new Post();
            post.setTitle(allParams.getOrDefault("title", "제목 없음"));
            post.setContent(allParams.getOrDefault("content", "내용 없음"));
            
            // 🚩 수정 포인트: Integer 타입에 맞춰 L 제거 및 CamelCase 메서드 호출
            // 여행 후기 게시판 카테고리 번호: 2
            post.setCategoryId(2); 
            post.setUserId(1);
            post.setViewCount(0);
            post.setStatus("N");

            handleImageUpload(post, image);

            postRepository.save(post);
            return ResponseEntity.ok(post);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("후기게시판 저장 실패: " + e.getMessage());
        }
    }

    private void handleImageUpload(Post post, MultipartFile image) throws Exception {
        if (image != null && !image.isEmpty()) {
            File dir = new File(uploadDir);
            if (!dir.exists()) dir.mkdirs();
            String savedFileName = UUID.randomUUID().toString() + "_" + image.getOriginalFilename();
            image.transferTo(new File(uploadDir + savedFileName));
            
            // 🚩 수정 포인트: setFileUrl (CamelCase)
            post.setFileUrl("http://localhost:8080/pic/" + savedFileName);
        } else {
            // 🚩 수정 포인트: setFileUrl (CamelCase)
            post.setFileUrl("http://localhost:8080/pic/1.jpg");
        }
    }
}