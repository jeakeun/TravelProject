package kr.hi.travel_community.controller;

import kr.hi.travel_community.entity.Post;
import kr.hi.travel_community.entity.Likes;
import kr.hi.travel_community.entity.Photo;
import kr.hi.travel_community.entity.ReportBox;
import kr.hi.travel_community.repository.PostRepository;
import kr.hi.travel_community.repository.PhotoRepository;
import kr.hi.travel_community.repository.LikesRepository;
import kr.hi.travel_community.repository.ReportRepository;
import kr.hi.travel_community.repository.CommentRepository; 
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/recommend")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class RecommendController {
    @Autowired
    private PostRepository postRepository;
    
    @Autowired
    private PhotoRepository photoRepository;

    @Autowired
    private LikesRepository likesRepository;

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private CommentRepository commentRepository; 

    private final String uploadDir = System.getProperty("user.dir") + File.separator + "uploads" + File.separator + "pic" + File.separator;

    // 1. 리스트 조회 (하단 목록용)
    @GetMapping("/posts")
    public List<Map<String, Object>> getList() {
        return postRepository.findAll().stream()
                .filter(p -> p.getPoCgNum() == 1 && "N".equals(p.getPoDel()))
                .map(this::convertToMap)
                .sorted((a, b) -> ((Integer) b.get("postId")).compareTo((Integer) a.get("postId")))
                .collect(Collectors.toList());
    }

    // 2. 상세 조회
    @GetMapping("/posts/{id}")
    public ResponseEntity<?> getDetail(@PathVariable("id") Integer id) {
        return postRepository.findById(id)
                .map(post -> {
                    postRepository.updateViewCount(post.getPoNum());
                    Map<String, Object> map = convertToMap(post);
                    
                    // 상세 페이지에서는 현재 로그인한 유저(1번 유저)의 추천 여부를 추가로 체크
                    boolean isLiked = likesRepository.findByLiIdAndLiNameAndLiMbNum(id, "post", 1).isPresent();
                    map.put("isLikedByMe", isLiked);
                    
                    return ResponseEntity.ok(map);
                })
                .orElse(ResponseEntity.status(404).build());
    }

    // 3. 추천 토글 (❤️)
    @PostMapping("/posts/{id}/like")
    @Transactional
    public ResponseEntity<?> toggleLike(@PathVariable("id") Integer id, @RequestBody Map<String, Integer> body) {
        Integer mbNum = body.get("mbNum");
        Optional<Likes> existingLike = likesRepository.findByLiIdAndLiNameAndLiMbNum(id, "post", mbNum);
        Post post = postRepository.findById(id).orElseThrow();
        boolean isLiked;
        if (existingLike.isPresent()) {
            likesRepository.delete(existingLike.get());
            post.setPoUp(Math.max(0, post.getPoUp() - 1));
            isLiked = false;
        } else {
            Likes newLike = new Likes();
            newLike.setLiId(id);
            newLike.setLiName("post");
            newLike.setLiMbNum(mbNum);
            newLike.setLiState(1);
            likesRepository.save(newLike);
            post.setPoUp(post.getPoUp() + 1);
            isLiked = true;
        }
        postRepository.save(post);
        return ResponseEntity.ok(Map.of("currentLikes", post.getPoUp(), "isLiked", isLiked));
    }

    // 4. 신고 처리 (🚨)
    @PostMapping("/posts/{id}/report")
    @Transactional
    public ResponseEntity<?> reportPost(@PathVariable("id") Integer id, @RequestBody Map<String, Object> body) {
        try {
            ReportBox report = new ReportBox();
            report.setRbContent((String) body.get("reason"));
            report.setRbId(id);
            report.setRbName("post");
            report.setRbMbNum((Integer) body.get("mbNum"));
            report.setRbManage("N");
            reportRepository.save(report);
            
            long currentReports = reportRepository.countByRbIdAndRbName(id, "post");
            return ResponseEntity.ok(Map.of("message", "신고 완료", "currentReports", currentReports));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("신고 처리 오류");
        }
    }

    // 5. 게시글 등록
    @PostMapping("/posts")
    @Transactional
    public ResponseEntity<?> create(@RequestParam("title") String title,
                                   @RequestParam("content") String content,
                                   @RequestParam(value = "image", required = false) MultipartFile[] images) {
        try {
            Post post = new Post();
            post.setPoTitle(title);
            post.setPoContent(content);
            post.setPoCgNum(1);
            post.setPoMbNum(1);
            post.setPoView(0);
            post.setPoUp(0); // 🚩 초기 추천수 0 설정
            post.setPoDel("N");
            post.setPoDate(LocalDateTime.now());
            Post savedPost = postRepository.save(post);
            
            if (images != null && images.length > 0) {
                for (MultipartFile image : images) {
                    if (!image.isEmpty()) handleImage(savedPost.getPoNum(), image);
                }
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

    // 🚩 핵심 로직: 엔티티를 프론트엔드용 Map으로 변환
    private Map<String, Object> convertToMap(Post post) {
        Map<String, Object> map = new HashMap<>();
        map.put("postId", post.getPoNum());
        map.put("poNum", post.getPoNum());
        map.put("poTitle", post.getPoTitle());
        map.put("poContent", post.getPoContent());
        map.put("poView", post.getPoView());
        map.put("poUp", post.getPoUp() != null ? post.getPoUp() : 0); // 🚩 null 방지 처리
        map.put("poDate", post.getPoDate());
        map.put("poMbNum", post.getPoMbNum()); 
        
        // 신고수 COUNT
        long reportCount = reportRepository.countByRbIdAndRbName(post.getPoNum(), "post");
        map.put("poReport", (int) reportCount);
        
        // 댓글수 COUNT
        long count = commentRepository.countByPostId(post.getPoNum());
        map.put("commentCount", (int) count);
        
        // 사진 처리
        List<Photo> photos = photoRepository.findByPhPoNumOrderByPhNumDesc(post.getPoNum());
        if (!photos.isEmpty()) {
            List<String> fileUrls = photos.stream()
                    .map(p -> "http://localhost:8080/pic/" + p.getPhName())
                    .collect(Collectors.toList());
            map.put("fileUrls", fileUrls);
            map.put("fileUrl", fileUrls.get(0));
        } else {
            map.put("fileUrls", Collections.singletonList("https://placehold.co"));
            map.put("fileUrl", "https://placehold.co");
        }
        return map;
    }
}