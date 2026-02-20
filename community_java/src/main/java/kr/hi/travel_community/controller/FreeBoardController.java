package kr.hi.travel_community.controller;

import kr.hi.travel_community.entity.Photo;
import kr.hi.travel_community.entity.Post;
import kr.hi.travel_community.repository.PostRepository;
import kr.hi.travel_community.repository.PhotoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/freeboard")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class FreeBoardController {
    @Autowired
    private PostRepository postRepository;
    
    @Autowired
    private PhotoRepository photoRepository;

    private final String uploadDir = System.getProperty("user.dir") + File.separator + "uploads" + File.separator + "pic" + File.separator;

    // 1. 목록 조회
    @GetMapping("/posts")
    public List<Map<String, Object>> getList() {
        return postRepository.findAll().stream()
                .filter(p -> p.getPoCgNum() == 3 && "N".equals(p.getPoDel())) // 🚩 카테고리 3번
                .map(this::convertToMap)
                .sorted((a, b) -> ((Integer) b.get("postId")).compareTo((Integer) a.get("postId")))
                .collect(Collectors.toList());
    }

    // 🚩 2. 게시글 상세 조회 (이 부분이 추가되어야 게시글이 보입니다)
    @GetMapping("/posts/{id}")
    public ResponseEntity<?> getDetail(@PathVariable("id") Integer id) {
        return postRepository.findById(id)
                .map(post -> {
                    // 조회수 증가 (Repository에 메서드가 없다면 이 줄은 주석 처리하세요)
                    postRepository.updateViewCount(post.getPoNum());
                    return ResponseEntity.ok(convertToMap(post)); 
                })
                .orElse(ResponseEntity.status(404).build());
    }

    // 3. 게시글 작성
    @PostMapping("/posts")
    public ResponseEntity<?> create(@RequestParam("title") String title,
                                   @RequestParam("content") String content,
                                   @RequestParam(value = "image", required = false) MultipartFile image) {
        try {
            Post post = new Post();
            post.setPoTitle(title);
            post.setPoContent(content);
            post.setPoCgNum(3); // 🚩 카테고리 3번
            post.setPoMbNum(1);
            post.setPoView(0);
            post.setPoDel("N");
            post.setPoDate(LocalDateTime.now());
            
            Post savedPost = postRepository.save(post);
            
            if (image != null && !image.isEmpty()) {
                handleImage(savedPost.getPoNum(), image);
            }
            
            return ResponseEntity.ok(convertToMap(savedPost));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("등록 오류");
        }
    }

    private void handleImage(Integer poNum, MultipartFile image) throws Exception {
        File dir = new File(uploadDir);
        if (!dir.exists()) dir.mkdirs();

        String name = UUID.randomUUID().toString() + "_" + image.getOriginalFilename();
        image.transferTo(new File(uploadDir + name));
        
        Photo photo = new Photo(image.getOriginalFilename(), name, poNum);
        photoRepository.save(photo);
    }

    private Map<String, Object> convertToMap(Post post) {
        Map<String, Object> map = new HashMap<>();
        map.put("postId", post.getPoNum());
        map.put("poNum", post.getPoNum());
        map.put("poTitle", post.getPoTitle());
        map.put("poContent", post.getPoContent());
        map.put("poView", post.getPoView());
        map.put("poDate", post.getPoDate());
        
        // 🚩 8080 포트 고정 및 Photo 테이블 조회
        Optional<Photo> photoOpt = photoRepository.findFirstByPhPoNumOrderByPhNumDesc(post.getPoNum());
        if (photoOpt.isPresent()) {
            map.put("fileUrl", "http://localhost:8080/pic/" + photoOpt.get().getPhName());
        } else {
            map.put("fileUrl", "https://placehold.co");
        }
        return map;
    }
}