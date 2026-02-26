package kr.hi.travel_community.service;

import kr.hi.travel_community.entity.RecommendPost;
import kr.hi.travel_community.entity.ReportBox;
import kr.hi.travel_community.mapper.LikeMapper;
import kr.hi.travel_community.repository.*; 
import kr.hi.travel_community.entity.Comment;
import kr.hi.travel_community.entity.Member; 
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest; // 🚩 추가됨
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
    private final MemberRepository memberRepository; 
    private final BookMarkRepository bookMarkRepository;

    @Value("${file.upload-dir:C:/travel_contents/uploads/pic/}")
    private String uploadRoot;

    private final String SERVER_URL = "/pic/";

    // 🚩 마이페이지 등 기존 호출부를 위한 오버로딩
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAllPosts() {
        return getAllPosts(null);
    }

    /**
     * [수정] 메인용 상위 10개 게시글 조회
     * Repository의 Pageable 파라미터에 맞춰 PageRequest.of(0, 10)을 사용합니다.
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAllPosts(Integer mbNum) {
        // 🚩 PageRequest.of(0, 10)으로 첫 페이지의 10개 항목을 가져옵니다.
        return postRepository.findTopPostsByScore(PageRequest.of(0, 10)).stream()
                .map(p -> convertToMapWithAuth(p, mbNum))
                .collect(Collectors.toList());
    }

    // 🚩 마이페이지 등 기존 호출부를 위한 오버로딩
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getRealAllPosts() {
        return getRealAllPosts(null);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getRealAllPosts(Integer mbNum) {
        return postRepository.findByPoDelOrderByPoNumDesc("N").stream()
                .map(p -> convertToMapWithAuth(p, mbNum))
                .collect(Collectors.toList());
    }

    // 🚩 마이페이지(MypageController) 빨간줄 해결을 위한 오버로딩
    @Transactional(readOnly = true)
    public List<Map<String, Object>> searchPosts(String type, String keyword) {
        return searchPosts(type, keyword, null);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> searchPosts(String type, String keyword, Integer mbNum) {
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
                    Integer mbNumSearch = Integer.parseInt(keyword);
                    result = postRepository.findByPoMbNumAndPoDelOrderByPoNumDesc(mbNumSearch, "N");
                } catch (NumberFormatException e) {
                    result = new ArrayList<>();
                }
                break;
            default:
                result = postRepository.findByPoDelOrderByPoNumDesc("N");
        }
        return result.stream().map(p -> convertToMapWithAuth(p, mbNum)).collect(Collectors.toList());
    }

    @Transactional
    public void increaseViewCount(Integer id, HttpServletRequest request, HttpServletResponse response) {
        Cookie[] cookies = request.getCookies();
        String cookieName = "viewed_rec_" + id;
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (cookie.getName().equals(cookieName)) return; 
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
            Map<String, Object> map = convertToMapWithAuth(p, mbNum);
            List<Map<String, Object>> comments = commentRepository.findByCoPoNumAndCoPoTypeAndCoDelOrderByCoDateAsc(id, "RECOMMEND", "N").stream()
                .map(c -> {
                    Map<String, Object> cMap = new HashMap<>();
                    cMap.put("coNum", c.getCoNum());
                    cMap.put("coContent", c.getCoContent());
                    cMap.put("coMbNum", c.getCoMbNum());
                    String nickname = "알 수 없는 사용자";
                    Optional<Member> mOpt = memberRepository.findById(c.getCoMbNum());
                    if(mOpt.isPresent()) nickname = mOpt.get().getMbNickname(); 
                    cMap.put("coNickname", nickname);
                    cMap.put("coDate", c.getCoDate());
                    cMap.put("canEdit", mbNum != null && (c.getCoMbNum().equals(mbNum) || mbNum == 1)); 
                    return cMap;
                }).collect(Collectors.toList());
            map.put("comments", comments);
            return map;
        }).orElse(null);
    }

    @Transactional
    public void savePost(RecommendPost post, List<MultipartFile> images) throws Exception {
        post.setPoDate(LocalDateTime.now());
        post.setPoView(0); 
        post.setPoUp(0);
        post.setPoDel("N");
        if (post.getPoMbNum() == null) post.setPoMbNum(1);
        handleImages(post, images);
        postRepository.save(post);
    }

    @Transactional
    public void updatePost(Integer id, String title, String content, List<MultipartFile> images) throws Exception {
        RecommendPost post = postRepository.findByPoNumAndPoDel(id, "N")
                .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다."));
        post.setPoTitle(title);
        post.setPoContent(content);
        if (images != null && !images.isEmpty()) handleImages(post, images);
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
        if (mbNum != null && mbNum > 0 && reportRepository.existsByRbIdAndRbNameAndRbMbNum(id, "RECOMMEND", mbNum)) {
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

    private void handleImages(RecommendPost post, List<MultipartFile> images) throws Exception {
        if (images == null || images.isEmpty()) return;
        String cleanPath = uploadRoot.replace("\\", "/");
        if (!cleanPath.endsWith("/")) cleanPath += "/";
        File dir = new File(cleanPath);
        if (!dir.exists()) dir.mkdirs();
        List<String> savedNames = new ArrayList<>();
        for (MultipartFile file : images) {
            if (!file.isEmpty()) {
                String originalFileName = file.getOriginalFilename();
                String extension = (originalFileName != null && originalFileName.contains(".")) ? 
                                    originalFileName.substring(originalFileName.lastIndexOf(".")) : "";
                String fileName = UUID.randomUUID().toString() + extension;
                Path targetPath = Paths.get(cleanPath).resolve(fileName);
                Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
                savedNames.add(fileName);
            }
        }
        if (!savedNames.isEmpty()) post.setPoImg(String.join(",", savedNames));
    }

    private Map<String, Object> convertToMapWithAuth(RecommendPost p, Integer mbNum) {
        Map<String, Object> map = convertToMap(p);
        boolean isLiked = (mbNum != null) && (likeMapper.checkLikeStatus(p.getPoNum(), mbNum) > 0);
        map.put("isLikedByMe", isLiked);
        boolean isBookmarked = (mbNum != null) && (bookMarkRepository.existsByBmPoNumAndBmPoTypeAndBmMbNum(p.getPoNum(), "RECOMMEND", mbNum));
        map.put("isBookmarkedByMe", isBookmarked);
        return map;
    }

    private Map<String, Object> convertToMap(RecommendPost p) {
        Map<String, Object> map = new HashMap<>();
        map.put("postId", p.getPoNum());
        map.put("poNum", p.getPoNum());
        map.put("poTitle", p.getPoTitle());
        map.put("poContent", p.getPoContent());
        map.put("poDate", p.getPoDate() != null ? p.getPoDate().toString() : "");
        map.put("poMbNum", p.getPoMbNum());

        String mbNickname = "알 수 없는 사용자";
        Optional<Member> mOpt = memberRepository.findById(p.getPoMbNum());
        if(mOpt.isPresent()) mbNickname = mOpt.get().getMbNickname();
        map.put("mbNickname", mbNickname);

        int views = p.getPoView() != null ? p.getPoView() : 0;
        int likes = p.getPoUp() != null ? p.getPoUp() : 0;
        int reports = p.getPoReport() != null ? p.getPoReport() : 0;
        
        long commentCount = commentRepository.countByCoPoNumAndCoPoTypeAndCoDel(p.getPoNum(), "RECOMMEND", "N");
        long bookmarkCount = bookMarkRepository.countByBmPoNumAndBmPoType(p.getPoNum(), "RECOMMEND");

        // 🚩 점수 공식: 조회 + 추천 + 댓글 + 즐겨찾기 - 신고
        int score = views + likes + (int)commentCount + (int)bookmarkCount - reports;

        map.put("poView", views);
        map.put("poUp", likes);
        map.put("poReport", reports);
        map.put("commentCount", commentCount);
        map.put("bookmarkCount", bookmarkCount);
        map.put("score", score);

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