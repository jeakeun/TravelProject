package kr.hi.travel_community.service;

import kr.hi.travel_community.entity.Post;
import kr.hi.travel_community.mapper.LikeMapper;
import kr.hi.travel_community.repository.RecommendRepository; // 🚩 이름 변경된 리포지토리 임포트
import kr.hi.travel_community.repository.CommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.*; 
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecommendPostService {

    // 🚩 RecommendRepository로 주입받되, 아래 로직 수정을 안 하도록 변수명은 유지
    private final RecommendRepository postRepository; 
    private final LikeMapper likeMapper; 
    private final CommentRepository commentRepository; 
    private final String SERVER_URL = "http://localhost:8080/pic/";

    // 🚩 랭킹용 (TOP 10): 리포지토리의 findBy 메서드 활용
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAllPosts() {
        return postRepository.findByPoCgNumAndPoDelOrderByPoNumDesc(1, "N").stream()
                .map(this::convertToMap)
                .sorted((a, b) -> Integer.compare((int) b.get("score"), (int) a.get("score")))
                .limit(10)
                .collect(Collectors.toList());
    }

    // 🚩 전체 리스트용: 필터링 없이 리포지토리에서 바로 가져옴
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getRealAllPosts() {
        return postRepository.findByPoCgNumAndPoDelOrderByPoNumDesc(1, "N").stream()
                .map(this::convertToMap)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getPostDetailWithImage(Integer id, Integer mbNum) {
        // 🚩 삭제되지 않은 글만 조회하도록 변경
        return postRepository.findByPoNumAndPoDel(id, "N").map(p -> {
            Map<String, Object> map = convertToMap(p);
            int likeCheck = likeMapper.checkLikeStatus(id, mbNum);
            map.put("isLikedByMe", likeCheck > 0); 
            return map;
        }).orElse(null);
    }

    @Transactional
    public void increaseViewCount(Integer id) {
        postRepository.updateViewCount(id); // 🚩 리포지토리의 default 메서드 활용
    }

    @Transactional
    public String toggleLikeStatus(Integer poNum, Integer mbNum) {
        int count = likeMapper.checkLikeStatus(poNum, mbNum);
        Post post = postRepository.findByPoNumAndPoDel(poNum, "N")
                .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다."));

        if (count == 0) {
            likeMapper.insertLikeLog(poNum, mbNum);
            post.setPoUp((post.getPoUp() == null ? 0 : post.getPoUp()) + 1);
            postRepository.save(post);
            return "liked";
        } else {
            likeMapper.deleteLikeLog(poNum, mbNum);
            post.setPoUp(Math.max(0, (post.getPoUp() == null ? 0 : post.getPoUp()) - 1));
            postRepository.save(post);
            return "unliked";
        }
    }

    @Transactional
    public void reportPost(Integer id) {
        Post post = postRepository.findByPoNumAndPoDel(id, "N")
                .orElseThrow(() -> new RuntimeException("Post not found"));
        post.setPoReport((post.getPoReport() == null ? 0 : post.getPoReport()) + 1);
        postRepository.save(post);
    }

    @Transactional
    public void updatePost(Integer id, String title, String content, List<MultipartFile> images) throws Exception {
        Post post = postRepository.findByPoNumAndPoDel(id, "N")
                .orElseThrow(() -> new RuntimeException("수정할 게시글을 찾을 수 없습니다."));

        post.setPoTitle(title);
        post.setPoContent(content);

        if (images != null && !images.isEmpty() && !images.get(0).isEmpty()) {
            List<String> savedFileNames = new ArrayList<>();
            String uploadDir = System.getProperty("user.dir") + File.separator + "uploads" + File.separator + "pic" + File.separator;
            
            for (MultipartFile file : images) {
                if (!file.isEmpty()) {
                    String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
                    Path copyLocation = Paths.get(uploadDir + fileName);
                    Files.copy(file.getInputStream(), copyLocation, StandardCopyOption.REPLACE_EXISTING);
                    savedFileNames.add(fileName);
                }
            }
            if (!savedFileNames.isEmpty()) {
                post.setFileUrl(String.join(",", savedFileNames));
            }
        }
        postRepository.save(post);
    }

    @Transactional
    public void deletePost(Integer id) {
        Post post = postRepository.findByPoNumAndPoDel(id, "N")
                .orElseThrow(() -> new RuntimeException("삭제할 게시글을 찾을 수 없습니다."));
        post.setPoDel("Y"); 
        postRepository.save(post);
    }

    private Map<String, Object> convertToMap(Post p) {
        Map<String, Object> map = new HashMap<>();
        map.put("postId", p.getPoNum());
        map.put("poNum", p.getPoNum());
        map.put("poTitle", p.getPoTitle());
        map.put("poContent", p.getPoContent());
        map.put("poDate", p.getPoDate() != null ? p.getPoDate().toString() : "");
        
        int views = p.getPoView() != null ? p.getPoView() : 0;
        int likes = p.getPoUp() != null ? p.getPoUp() : 0;
        int reports = p.getPoReport() != null ? p.getPoReport() : 0;
        
        map.put("poView", views);
        map.put("poUp", likes);
        map.put("poReport", reports);
        map.put("poMbNum", p.getPoMbNum());

        long commentCount = commentRepository.countByPostPoNumAndCoDel(p.getPoNum(), "N");
        map.put("commentCount", commentCount);

        int score = views + likes + (int)commentCount - reports;
        map.put("score", score);
        
        if (p.getFileUrl() != null && !p.getFileUrl().isEmpty()) {
            List<String> fileUrls = Arrays.stream(p.getFileUrl().split(","))
                    .map(name -> SERVER_URL + name.trim())
                    .collect(Collectors.toList());
            map.put("fileUrls", fileUrls);
            map.put("fileUrl", fileUrls.get(0));
        } else {
            map.put("fileUrls", Collections.emptyList());
            map.put("fileUrl", null);
        }
        return map;
    }

    @Transactional
    public void savePost(Post post, List<MultipartFile> images) throws Exception {
        post.setPoDate(LocalDateTime.now());
        post.setPoView(0);
        post.setPoUp(0);
        post.setPoDown(0);
        post.setPoReport(0);
        post.setPoDel("N");
        post.setPoCgNum(1); 
        post.setPoMbNum(1);

        if (images != null && !images.isEmpty()) {
            List<String> savedFileNames = new ArrayList<>();
            String uploadDir = System.getProperty("user.dir") + File.separator + "uploads" + File.separator + "pic" + File.separator;
            File dir = new File(uploadDir);
            if (!dir.exists()) dir.mkdirs();

            for (MultipartFile file : images) {
                if (!file.isEmpty()) {
                    String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
                    Path copyLocation = Paths.get(uploadDir + fileName);
                    Files.copy(file.getInputStream(), copyLocation, StandardCopyOption.REPLACE_EXISTING);
                    savedFileNames.add(fileName);
                }
            }
            if (!savedFileNames.isEmpty()) {
                post.setFileUrl(String.join(",", savedFileNames));
            }
        }
        postRepository.save(post);
    }
}