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
@RequestMapping("/api/freeboard")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class FreeBoardController {

    @Autowired
    private PostRepository postRepository;

    private final String uploadDir = System.getProperty("user.dir") + "/src/main/resources/static/pic/";

    // 1. 자유 게시판 글 등록 (POST)
    @PostMapping("/posts")
    public ResponseEntity<?> createFreePost(
            @RequestParam Map<String, String> allParams, 
            @RequestParam(value = "image", required = false) MultipartFile image) {
        
        try {
            Post post = new Post();
            post.setTitle(allParams.getOrDefault("title", "제목 없음"));
            post.setContent(allParams.getOrDefault("content", "내용 없음"));
            
            // Integer 타입 및 CamelCase 메서드 사용
            post.setCategoryId(3); 
            post.setUserId(1);
            post.setViewCount(0);
            post.setStatus("N");

            handleImageUpload(post, image);

            postRepository.save(post);
            return ResponseEntity.ok(post);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("자유게시판 저장 실패: " + e.getMessage());
        }
    }

    // 🚩 2. [추가] 자유 게시판 상세 조회 및 조회수 증가 (GET)
    // 리액트 호출 주소 예: http://localhost:8080/api/freeboard/posts/15
    @GetMapping("/posts/{id}")
    public ResponseEntity<?> getFreePostDetail(@PathVariable("id") Integer id) {
        try {
            // 1) Repository에 작성한 메서드로 조회수 1 증가
            postRepository.updateViewCount(id);

            // 2) 상세 데이터 조회 (데이터가 없으면 404 에러 반환)
            return postRepository.findById(id)
                    .map(post -> {
                        // DB에 이미지가 없을 경우 기본 이미지 처리
                        if (post.getFileUrl() == null || post.getFileUrl().isEmpty()) {
                            post.setFileUrl("http://localhost:8080/pic/1.jpg");
                        }
                        return ResponseEntity.ok(post);
                    })
                    .orElse(ResponseEntity.notFound().build());
                    
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("게시글 로딩 실패: " + e.getMessage());
        }
    }

    private void handleImageUpload(Post post, MultipartFile image) throws Exception {
        if (image != null && !image.isEmpty()) {
            File dir = new File(uploadDir);
            if (!dir.exists()) dir.mkdirs();
            String savedFileName = UUID.randomUUID().toString() + "_" + image.getOriginalFilename();
            image.transferTo(new File(uploadDir + savedFileName));
            post.setFileUrl("http://localhost:8080/pic/" + savedFileName);
        } else {
            post.setFileUrl("http://localhost:8080/pic/1.jpg");
        }
    }
}