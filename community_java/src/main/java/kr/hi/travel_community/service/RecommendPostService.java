package kr.hi.travel_community.service;

import kr.hi.travel_community.entity.RecommendPost;
import kr.hi.travel_community.entity.ReportBox;
import kr.hi.travel_community.mapper.LikeMapper;
import kr.hi.travel_community.repository.RecommendRepository;
import kr.hi.travel_community.repository.CommentRepository;
import kr.hi.travel_community.repository.ReportRepository;
import kr.hi.travel_community.entity.Comment;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
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
    private final ReportRepository reportRepository; 
    
    // 🚩 [수정] application.properties에서 지정한 물리 경로를 읽어옵니다. (기본값 설정)
    @Value("${file.upload-dir:C:/travel_contents/uploads/pic/}")
    private String uploadRoot;

    // 🚩 [수정] WebConfig에서 설정한 Resource Handler 경로와 일치시킵니다.
    private final String SERVER_URL = "/pic/";

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
        if (post.getPoMbNum() == null) {
            post.setPoMbNum(1);
        }
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
    public void reportPost(Integer id, String reason, Integer mbNum) {
        if (mbNum != null && mbNum > 0
                && reportRepository.existsByRbIdAndRbNameAndRbMbNum(id, "RECOMMEND", mbNum)) {
            throw new IllegalStateException("이미 신고하신 게시글입니다.");
        }
        postRepository.findByPoNumAndPoDel(id, "N").ifPresent(post -> {
            post.setPoReport((post.getPoReport() == null ? 0 : post.getPoReport()) + 1);
            postRepository.save(post);
            if (mbNum != null && mbNum > 0) {
                ReportBox rb = new ReportBox();
                rb.setRbId(id);
                rb.setRbName("RECOMMEND");
                rb.setRbContent(reason != null ? reason : "");
                rb.setRbMbNum(mbNum);
                rb.setRbManage("N");
                reportRepository.save(rb);
            }
        });
    }

    /**
     * 🚩 이미지 저장 로직
     * 외부 경로에 파일을 저장하여 서버 재시작 시에도 데이터를 유지합니다.
     */
    private void handleImages(RecommendPost post, List<MultipartFile> images) throws Exception {
        if (images == null || images.isEmpty()) return;
        
        File dir = new File(uploadRoot);
        if (!dir.exists()) dir.mkdirs();
        
        List<String> savedNames = new ArrayList<>();
        for (MultipartFile file : images) {
            if (!file.isEmpty()) {
                String originalFileName = file.getOriginalFilename();
                String extension = "";
                if (originalFileName != null && originalFileName.contains(".")) {
                    extension = originalFileName.substring(originalFileName.lastIndexOf("."));
                }
                String fileName = UUID.randomUUID().toString() + extension;
                
                // 🚩 Paths.get을 사용하여 경로 구분자 문제 방지
                Path targetPath = Paths.get(uploadRoot).resolve(fileName);
                Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
                savedNames.add(fileName);
            }
        }
        if (!savedNames.isEmpty()) {
            post.setPoImg(String.join(",", savedNames));
        }
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

        int views = p.getPoView() != null ? p.getPoView() : 0;
        int likes = p.getPoUp() != null ? p.getPoUp() : 0;
        int score = views + (likes * 2) + ((int) commentCount * 3);
        map.put("score", score);

        // 🚩 [수정] 프론트엔드에서 도메인에 상관없이 접근할 수 있도록 SERVER_URL(/pic/) 사용
        if (p.getPoImg() != null && !p.getPoImg().trim().isEmpty()) {
            String firstImg = p.getPoImg().split(",")[0].trim();
            map.put("fileUrl", SERVER_URL + firstImg);
            map.put("poImg", SERVER_URL + firstImg); 
        } else {
            map.put("fileUrl", null);
            map.put("poImg", null);
        }
        return map;
    }
}