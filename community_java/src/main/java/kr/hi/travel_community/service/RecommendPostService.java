package kr.hi.travel_community.service;

import kr.hi.travel_community.entity.RecommendPost;
import kr.hi.travel_community.mapper.LikeMapper;
import kr.hi.travel_community.repository.RecommendRepository;
import kr.hi.travel_community.repository.CommentRepository;
import kr.hi.travel_community.entity.Comment;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.File;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.*; 
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecommendPostService {

    private final RecommendRepository postRepository; 
    private final LikeMapper likeMapper; 
    private final CommentRepository commentRepository; 
    private final String SERVER_URL = "http://localhost:8080/pic/";

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAllPosts() {
        return postRepository.findByPoDelOrderByPoNumDesc("N").stream()
                .map(this::convertToMap)
                .sorted((a, b) -> Integer.compare((int) b.get("score"), (int) a.get("score")))
                .limit(10)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getRealAllPosts() {
        return postRepository.findByPoDelOrderByPoNumDesc("N").stream()
                .map(this::convertToMap)
                .collect(Collectors.toList());
    }

    /**
     * 🚩 검색 기능 (빨간 줄 수정 완료)
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> searchPosts(String type, String keyword) {
        List<RecommendPost> result;

        switch (type) {
            case "title":
                result = postRepository.findByPoTitleContainingAndPoDelOrderByPoNumDesc(keyword, "N");
                break;
            case "content":
                result = postRepository.findByPoContentContainingAndPoDelOrderByPoNumDesc(keyword, "N");
                break;
            case "title_content":
                // 🚩 Repository에서 새로 만든 @Query 메서드 호출 (이 부분이 빨간줄 원인)
                result = postRepository.findByTitleOrContent(keyword, "N");
                break;
            case "author":
                // 작성자(mbNum) 검색 - 숫자로 변환 가능한 경우에만 처리하거나 전체에서 필터링
                try {
                    Integer mbNum = Integer.parseInt(keyword);
                    // 특정 사용자의 글만 필터링 (간단 구현)
                    result = postRepository.findByPoDelOrderByPoNumDesc("N").stream()
                            .filter(p -> p.getPoMbNum().equals(mbNum))
                            .collect(Collectors.toList());
                } catch (NumberFormatException e) {
                    // 숫자가 아니면 결과 없음
                    result = new ArrayList<>();
                }
                break;
            default:
                result = postRepository.findByPoDelOrderByPoNumDesc("N");
        }

        return result.stream()
                .map(this::convertToMap)
                .collect(Collectors.toList());
    }

    @Transactional
    public void increaseViewCount(Integer id, HttpServletRequest request, HttpServletResponse response) {
        Cookie[] cookies = request.getCookies();
        String cookieName = "viewed_rec_" + id;

        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (cookie.getName().equals(cookieName)) {
                    return; 
                }
            }
        }

        int updatedRows = postRepository.updateViewCount(id);
        
        if (updatedRows > 0) {
            Cookie newCookie = new Cookie(cookieName, "true");
            newCookie.setPath("/");
            newCookie.setMaxAge(60 * 60 * 24 * 365); 
            newCookie.setHttpOnly(true);
            response.addCookie(newCookie);
        }
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getPostDetailWithImage(Integer id, Integer mbNum) {
        return postRepository.findByPoNumAndPoDel(id, "N").map(p -> {
            Map<String, Object> map = convertToMap(p);
            
            List<Map<String, Object>> comments = commentRepository.findByCoPoNumAndCoPoTypeAndCoDelOrderByCoDateAsc(id, "RECOMMEND", "N").stream()
                .map(c -> {
                    Map<String, Object> cMap = new HashMap<>();
                    cMap.put("coNum", c.getCoNum());
                    cMap.put("coContent", c.getCoContent());
                    cMap.put("coMbNum", c.getCoMbNum());
                    cMap.put("coDate", c.getCoDate());
                    cMap.put("canEdit", mbNum != null && (c.getCoMbNum().equals(mbNum) || mbNum == 1)); 
                    return cMap;
                }).collect(Collectors.toList());
            
            map.put("comments", comments);

            int likeCheck = (mbNum != null) ? likeMapper.checkLikeStatus(id, mbNum) : 0;
            map.put("isLikedByMe", likeCheck > 0); 
            return map;
        }).orElse(null);
    }

    @Transactional
    public void savePost(RecommendPost post, List<MultipartFile> images) throws Exception {
        post.setPoDate(LocalDateTime.now());
        post.setPoView(0); 
        post.setPoUp(0);
        post.setPoDel("N");
        post.setPoMbNum(1); 
        handleImages(post, images);
        postRepository.save(post);
    }

    @Transactional
    public void updatePost(Integer id, String title, String content, List<MultipartFile> images) throws Exception {
        RecommendPost post = postRepository.findByPoNumAndPoDel(id, "N")
                .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다."));
        post.setPoTitle(title);
        post.setPoContent(content);
        if (images != null && !images.isEmpty()) {
            handleImages(post, images);
        }
        postRepository.save(post);
    }

    @Transactional
    public void deletePost(Integer id) {
        postRepository.findByPoNumAndPoDel(id, "N").ifPresent(post -> {
            post.setPoDel("Y");
            postRepository.save(post);
        });
    }

    @Transactional
    public String toggleLikeStatus(Integer poNum, Integer mbNum) {
        int count = likeMapper.checkLikeStatus(poNum, mbNum);
        RecommendPost post = postRepository.findByPoNumAndPoDel(poNum, "N")
                .orElseThrow(() -> new RuntimeException("게시글 없음"));

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
        postRepository.findByPoNumAndPoDel(id, "N").ifPresent(post -> {
            post.setPoReport((post.getPoReport() == null ? 0 : post.getPoReport()) + 1);
            postRepository.save(post);
        });
    }

    private void handleImages(RecommendPost post, List<MultipartFile> images) throws Exception {
        if (images == null || images.isEmpty()) return;
        String uploadDir = System.getProperty("user.dir") + File.separator + "uploads" + File.separator + "pic" + File.separator;
        File dir = new File(uploadDir);
        if (!dir.exists()) dir.mkdirs();
        List<String> savedNames = new ArrayList<>();
        for (MultipartFile file : images) {
            if (!file.isEmpty()) {
                String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
                Files.copy(file.getInputStream(), Paths.get(uploadDir + fileName), StandardCopyOption.REPLACE_EXISTING);
                savedNames.add(fileName);
            }
        }
        if (!savedNames.isEmpty()) post.setFileUrl(String.join(",", savedNames));
    }

    private Map<String, Object> convertToMap(RecommendPost p) {
        Map<String, Object> map = new HashMap<>();
        map.put("postId", p.getPoNum());
        map.put("poNum", p.getPoNum());
        map.put("poTitle", p.getPoTitle());
        map.put("poContent", p.getPoContent());
        map.put("poDate", p.getPoDate() != null ? p.getPoDate().toString() : "");
        map.put("poView", p.getPoView() != null ? p.getPoView() : 0);
        map.put("poUp", p.getPoUp() != null ? p.getPoUp() : 0);
        map.put("poMbNum", p.getPoMbNum());

        long commentCount = commentRepository.countByCoPoNumAndCoPoTypeAndCoDel(p.getPoNum(), "RECOMMEND", "N");
        map.put("commentCount", commentCount);

        int score = (int)map.get("poView") + ((int)map.get("poUp") * 2) + ((int)commentCount * 3);
        map.put("score", score);

        if (p.getFileUrl() != null && !p.getFileUrl().isEmpty()) {
            map.put("fileUrl", SERVER_URL + p.getFileUrl().split(",")[0].trim());
        }
        return map;
    }
}