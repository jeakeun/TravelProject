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
@RequestMapping("/api/freeboard")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RequiredArgsConstructor
public class FreeBoardController {

    private final PostRepository postRepository;
    private final PhotoRepository photoRepository;
    // LikeService 관련 줄 삭제됨

    private final String uploadDir = System.getProperty("user.dir") + File.separator + "uploads" + File.separator + "pic" + File.separator;

    @GetMapping("/posts")
    public List<Map<String, Object>> getList() {
        return postRepository.findAll().stream()
                .filter(p -> p.getPoCgNum() == 3 && "N".equals(p.getPoDel()))
                .map(this::convertToMap)
                .sorted((a,b) -> ((Integer)b.get("postId")).compareTo((Integer)a.get("postId")))
                .collect(Collectors.toList());
    }

    @GetMapping("/posts/{id}")
    public ResponseEntity<Map<String,Object>> getDetail(@PathVariable Integer id) {
        return postRepository.findById(id)
                .map(post -> {
                    postRepository.updateViewCount(post.getPoNum());
                    return ResponseEntity.ok(convertToMap(post));
                })
                .orElseGet(() -> ResponseEntity.status(404).body(Map.of("error","게시글 없음")));
    }

    @PostMapping("/posts")
    public ResponseEntity<Map<String,Object>> create(@RequestParam String title,
                                                     @RequestParam String content,
                                                     @RequestParam(required = false) MultipartFile image) {
        try {
            Post post = new Post();
            post.setPoTitle(title);
            post.setPoContent(content);
            post.setPoCgNum(3);
            post.setPoMbNum(1);
            post.setPoView(0);
            post.setPoUp(0);
            post.setPoDel("N");
            post.setPoDate(LocalDateTime.now());
            Post savedPost = postRepository.save(post);

            if(image != null && !image.isEmpty()){
                File dir = new File(uploadDir);
                if(!dir.exists()) dir.mkdirs();
                String name = UUID.randomUUID()+"_"+image.getOriginalFilename();
                image.transferTo(new File(uploadDir+name));
                photoRepository.save(new Photo(image.getOriginalFilename(), name, savedPost.getPoNum()));
            }
            return ResponseEntity.ok(convertToMap(savedPost));
        }catch(Exception e){
            return ResponseEntity.internalServerError().body(Map.of("error","등록 실패"));
        }
    }

    // 🚩 추천 기능은 나중에 Service 만들면 추가 (일단 주석 처리하여 에러 방지)
    /*
    @PostMapping("/posts/{id}/like")
    public ResponseEntity<?> toggleLike(@PathVariable Integer id, @RequestBody Map<String, Object> data) {
        return ResponseEntity.ok("잠시 후 구현");
    }
    */

    private Map<String,Object> convertToMap(Post post){
        Optional<Photo> photoOpt = photoRepository.findFirstByPhPoNumOrderByPhNumDesc(post.getPoNum());
        String fileUrl = photoOpt.map(p -> "http://localhost:8080/pic/"+p.getPhName()).orElse("");
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