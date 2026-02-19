package kr.hi.travel_community.controller;

import java.io.File;
import java.util.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import kr.hi.travel_community.entity.Post;
import kr.hi.travel_community.repository.PostRepository;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class PhotoController {

    @Autowired
    private PostRepository postRepository;

    private final String uploadDir = System.getProperty("user.dir") + "/src/main/resources/static/pic/";

    // 1. 게시글 목록 불러오기 (리액트 필터링을 위해 category 필드 수동 세팅)
    @GetMapping("/posts")
    public List<Post> getPhotoList() {
        List<Post> list = postRepository.findAll();
        
        // 🚩 [수정] CamelCase 메서드 호출 (getCategoryId, setCategory)
        for (Post post : list) {
            Integer cgId = post.getCategoryId();
            if (cgId != null) {
                if (cgId == 1) post.setCategory("여행 추천 게시판");
                else if (cgId == 2) post.setCategory("여행 후기 게시판");
                else if (cgId == 3) post.setCategory("자유 게시판");
                else post.setCategory("커뮤니티");
            }
        }
        return list;
    }

    // 2. 게시글 등록하기
    @PostMapping("/posts")
    public ResponseEntity<?> createPost(
            @RequestParam Map<String, String> allParams, 
            @RequestParam(value = "image", required = false) MultipartFile image) {
        
        try {
            Post post = new Post();
            post.setTitle(allParams.getOrDefault("title", "제목 없음"));
            post.setContent(allParams.getOrDefault("content", "내용 없음"));
            
            // 리액트에서 보낸 메뉴 이름을 DB 번호(categoryId)로 변환
            String categoryName = allParams.get("category");
            Integer categoryId = 1; // 기본값

            if ("여행 후기 게시판".equals(categoryName)) categoryId = 2;
            else if ("자유 게시판".equals(categoryName)) categoryId = 3;
            
            // 🚩 [수정] CamelCase 메서드 호출 및 Integer 타입 적용
            post.setCategoryId(categoryId); 
            post.setUserId(1); 
            post.setViewCount(0);
            post.setStatus("N");

            // 이미지 업로드 로직
            if (image != null && !image.isEmpty()) {
                File dir = new File(uploadDir);
                if (!dir.exists()) dir.mkdirs();
                
                String savedFileName = UUID.randomUUID().toString() + "_" + image.getOriginalFilename();
                File dest = new File(uploadDir + savedFileName);
                image.transferTo(dest);
                
                // 🚩 [수정] setFileUrl (CamelCase)
                post.setFileUrl("http://localhost:8080/pic/" + savedFileName);
            } else {
                // 🚩 [수정] setFileUrl (CamelCase)
                post.setFileUrl("http://localhost:8080/pic/1.jpg");
            }

            postRepository.save(post);
            return ResponseEntity.ok(post);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("서버 오류: " + e.getMessage());
        }
    }
}