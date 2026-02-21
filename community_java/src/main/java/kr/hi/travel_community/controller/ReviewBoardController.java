package kr.hi.travel_community.controller;

import kr.hi.travel_community.entity.Photo;
import kr.hi.travel_community.entity.Post;
import kr.hi.travel_community.repository.PhotoRepository;
import kr.hi.travel_community.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reviewboard") // 후기게시판 전용 경로
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RequiredArgsConstructor
public class ReviewBoardController {

    private final PostRepository postRepository;
    private final PhotoRepository photoRepository;

    private final String uploadDir = System.getProperty("user.dir") + File.separator + "uploads" + File.separator + "pic" + File.separator;

    // 후기 목록 조회
    @GetMapping("/posts")
    public List<Map<String,Object>> getList() {
        return postRepository.findAll().stream()
                .filter(p -> p.getPoCgNum() == 2 && "N".equals(p.getPoDel())) // 카테고리 2번 필터링
                .map(this::convertToMap)
                .sorted((a,b) -> ((Integer)b.get("postId")).compareTo((Integer)a.get("postId")))
                .collect(Collectors.toList());
    }

    // 후기 상세 조회
    @GetMapping("/posts/{id}")
    public ResponseEntity<Map<String,Object>> getDetail(@PathVariable Integer id){
        return postRepository.findById(id)
                .map(post -> {
                    postRepository.updateViewCount(post.getPoNum());
                    return ResponseEntity.ok(convertToMap(post));
                })
                .orElseGet(() -> ResponseEntity.status(404).body(Map.of("error","게시글 없음")));
    }

    // 후기 글 작성
    @PostMapping("/posts")
    public ResponseEntity<Map<String,Object>> create(@RequestParam String title,
                                                     @RequestParam String content,
                                                     @RequestParam(required = false) MultipartFile image){
        try {
            // 🚩 Builder 에러 해결: new Post()와 Setter 사용
            Post post = new Post();
            post.setPoTitle(title);
            post.setPoContent(content);
            post.setPoCgNum(2); // 여행후기 카테고리 고정
            post.setPoMbNum(1); // 임시 작성자 번호
            post.setPoView(0);
            post.setPoUp(0);
            post.setPoDel("N");
            post.setPoDate(LocalDateTime.now());
            
            Post savedPost = postRepository.save(post);

            if(image != null && !image.isEmpty()){
                File dir = new File(uploadDir);
                if(!dir.exists()) dir.mkdirs();
                String name = UUID.randomUUID() + "_" + image.getOriginalFilename();
                image.transferTo(new File(uploadDir + name));
                photoRepository.save(new Photo(image.getOriginalFilename(), name, savedPost.getPoNum()));
            }

            return ResponseEntity.ok(convertToMap(savedPost));
        } catch(Exception e){
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error","등록 실패"));
        }
    }

    // 🚩 추천 기능은 추후 전용 Service 구현 시 추가 가능하도록 비워둠
    /*
    @PostMapping("/posts/{id}/like")
    public ResponseEntity<?> toggleLike(@PathVariable Integer id, @RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(Map.of("status", "ReviewBoard 추천 로직 필요"));
    }
    */

    private Map<String,Object> convertToMap(Post post){
        Optional<Photo> photoOpt = photoRepository.findFirstByPhPoNumOrderByPhNumDesc(post.getPoNum());
        String fileUrl = photoOpt.map(p -> "http://localhost:8080/pic/" + p.getPhName()).orElse("https://placehold.co");
        
        Map<String, Object> map = new HashMap<>();
        map.put("postId", post.getPoNum());
        map.put("poNum", post.getPoNum());
        map.put("poTitle", post.getPoTitle());
        map.put("poContent", post.getPoContent());
        map.put("poView", post.getPoView());
        map.put("poUp", post.getPoUp() != null ? post.getPoUp() : 0);
        map.put("poDate", post.getPoDate());
        map.put("fileUrl", fileUrl);
        return map;
    }
}