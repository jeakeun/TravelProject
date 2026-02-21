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
@RequestMapping("/api/reviewboard")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RequiredArgsConstructor
public class ReviewBoardController {

    private final PostRepository postRepository;
    private final PhotoRepository photoRepository;
    private final String uploadDir = System.getProperty("user.dir") + File.separator + "uploads" + File.separator + "pic" + File.separator;

    @GetMapping("/posts")
    public List<Map<String,Object>> getList() {
        return postRepository.findAll().stream()
                .filter(p -> p.getPoCgNum() == 2 && "N".equals(p.getPoDel()))
                .map(this::convertToMap)
                .sorted((a,b)->((Integer)b.get("postId")).compareTo((Integer)a.get("postId")))
                .collect(Collectors.toList());
    }

    @GetMapping("/posts/{id}")
    public ResponseEntity<Map<String,Object>> getDetail(@PathVariable Integer id) {
        return postRepository.findById(id)
                .map(p -> {
                    postRepository.updateViewCount(p.getPoNum());
                    return ResponseEntity.ok(convertToMap(p));
                })
                .orElseGet(() -> ResponseEntity.status(404).body(Map.of("error","게시글 없음")));
    }

    @PostMapping("/posts")
    public ResponseEntity<Map<String,Object>> create(@RequestParam String title,
                                                     @RequestParam String content,
                                                     @RequestParam(required = false) MultipartFile image) throws Exception {
        Post post = Post.builder()
                .poTitle(title)
                .poContent(content)
                .poCgNum(2)
                .poMbNum(1)
                .poView(0)
                .poDel("N")
                .poDate(LocalDateTime.now())
                .build();
        Post saved = postRepository.save(post);

        if(image != null && !image.isEmpty()){
            File dir = new File(uploadDir);
            if(!dir.exists()) dir.mkdirs();
            String name = UUID.randomUUID()+"_"+image.getOriginalFilename();
            image.transferTo(new File(uploadDir + name));
            photoRepository.save(new Photo(image.getOriginalFilename(), name, saved.getPoNum()));
        }
        return ResponseEntity.ok(convertToMap(saved));
    }

    private Map<String,Object> convertToMap(Post p){
        Map<String,Object> map = new HashMap<>();
        map.put("postId", p.getPoNum());
        map.put("poNum", p.getPoNum());
        map.put("poTitle", p.getPoTitle());
        map.put("poContent", p.getPoContent());
        map.put("poView", p.getPoView());
        map.put("poDate", p.getPoDate());
        Optional<Photo> photoOpt = photoRepository.findFirstByPhPoNumOrderByPhNumDesc(p.getPoNum());
        map.put("fileUrl", photoOpt.map(ph->"http://localhost:8080/pic/"+ph.getPhName()).orElse("https://placehold.co"));
        return map;
    }
}