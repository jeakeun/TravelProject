package kr.hi.travel_community.service;

import kr.hi.travel_community.entity.ReviewPost;
import kr.hi.travel_community.mapper.LikeMapper;
import kr.hi.travel_community.repository.ReviewRepository;
import kr.hi.travel_community.repository.CommentRepository;
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
public class ReviewPostService {

    private final ReviewRepository postRepository;
    private final LikeMapper likeMapper;
    private final CommentRepository commentRepository;
    private final String SERVER_URL = "http://localhost:8080/pic/";

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getRealAllPosts() {
        return postRepository.findByPoDelOrderByPoNumDesc("N").stream()
                .map(this::convertToMap).collect(Collectors.toList());
    }

    /**
     * 🚩 리뷰 게시판 검색 기능 추가
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> searchPosts(String type, String keyword) {
        List<ReviewPost> result;

        switch (type) {
            case "title":
                result = postRepository.findByPoTitleContainingAndPoDelOrderByPoNumDesc(keyword, "N");
                break;
            case "content":
                result = postRepository.findByPoContentContainingAndPoDelOrderByPoNumDesc(keyword, "N");
                break;
            case "title_content":
                // Repository에 정의한 @Query 메서드 호출
                result = postRepository.findByTitleOrContent(keyword, "N");
                break;
            case "author":
                try {
                    Integer mbNum = Integer.parseInt(keyword);
                    result = postRepository.findByPoDelOrderByPoNumDesc("N").stream()
                            .filter(p -> p.getPoMbNum().equals(mbNum))
                            .collect(Collectors.toList());
                } catch (NumberFormatException e) {
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
        String cookieName = "viewed_review_" + id;

        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (cookie.getName().equals(cookieName)) return;
            }
        }

        if (postRepository.updateViewCount(id) > 0) {
            Cookie newCookie = new Cookie(cookieName, "true");
            newCookie.setPath("/");
            newCookie.setMaxAge(60 * 60 * 24);
            newCookie.setHttpOnly(true);
            response.addCookie(newCookie);
        }
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getPostDetailWithImage(Integer id, Integer mbNum) {
        return postRepository.findByPoNumAndPoDel(id, "N").map(p -> {
            Map<String, Object> map = convertToMap(p);
            map.put("comments", commentRepository.findByCoPoNumAndCoPoTypeAndCoDelOrderByCoDateAsc(id, "REVIEW", "N"));
            map.put("isLikedByMe", mbNum != null && likeMapper.checkLikeStatus(id, mbNum) > 0);
            return map;
        }).orElse(null);
    }

    @Transactional
    public void savePost(ReviewPost post, List<MultipartFile> images) throws Exception {
        post.setPoDate(LocalDateTime.now());
        post.setPoView(0);
        post.setPoUp(0);
        post.setPoDel("N");
        handleImages(post, images);
        postRepository.save(post);
    }

    @Transactional
    public void updatePost(Integer id, String title, String content, List<MultipartFile> images) throws Exception {
        ReviewPost post = postRepository.findByPoNumAndPoDel(id, "N")
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
        postRepository.findByPoNumAndPoDel(id, "N").ifPresent(p -> p.setPoDel("Y"));
    }

    @Transactional
    public String toggleLikeStatus(Integer poNum, Integer mbNum) {
        int count = likeMapper.checkLikeStatus(poNum, mbNum);
        ReviewPost post = postRepository.findByPoNumAndPoDel(poNum, "N")
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

    private void handleImages(ReviewPost post, List<MultipartFile> images) throws Exception {
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

    private Map<String, Object> convertToMap(ReviewPost p) {
        Map<String, Object> map = new HashMap<>();
        map.put("poNum", p.getPoNum());
        map.put("poTitle", p.getPoTitle());
        map.put("poContent", p.getPoContent());
        map.put("poDate", p.getPoDate() != null ? p.getPoDate().toString() : "");
        map.put("poView", p.getPoView() != null ? p.getPoView() : 0);
        map.put("poUp", p.getPoUp() != null ? p.getPoUp() : 0);
        map.put("poMbNum", p.getPoMbNum());
        map.put("commentCount", commentRepository.countByCoPoNumAndCoPoTypeAndCoDel(p.getPoNum(), "REVIEW", "N"));
        
        if (p.getFileUrl() != null && !p.getFileUrl().isEmpty()) {
            map.put("fileUrl", SERVER_URL + p.getFileUrl().split(",")[0].trim());
        }
        return map;
    }
}