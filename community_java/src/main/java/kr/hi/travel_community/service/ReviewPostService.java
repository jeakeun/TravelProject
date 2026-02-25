package kr.hi.travel_community.service;

import kr.hi.travel_community.entity.ReviewPost;
import kr.hi.travel_community.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewPostService {

    private final ReviewRepository postRepository;
    private static final String SERVER_URL = "http://localhost:8080/pic/";

    @Transactional(readOnly = true)
    public List<Map<String, Object>> searchPosts(String type, String keyword) {
        List<ReviewPost> result;

        switch (type) {
            case "author":
                try {
                    Integer mbNum = Integer.parseInt(keyword);
                    result = postRepository.findByPoDelOrderByPoNumDesc("N").stream()
                            .filter(p -> p.getPoMbNum() != null && p.getPoMbNum().equals(mbNum))
                            .collect(Collectors.toList());
                } catch (NumberFormatException e) {
                    result = new ArrayList<>();
                }
                break;
            default:
                result = postRepository.findByPoDelOrderByPoNumDesc("N");
        }

        return result.stream().map(this::convertToMap).collect(Collectors.toList());
    }

    private Map<String, Object> convertToMap(ReviewPost p) {
        Map<String, Object> map = new HashMap<>();
        map.put("poNum", p.getPoNum());
        map.put("poTitle", p.getPoTitle());
        map.put("poContent", p.getPoContent());
        map.put("poDate", p.getPoDate());
        map.put("poView", p.getPoView() != null ? p.getPoView() : 0);
        map.put("poUp", p.getPoUp() != null ? p.getPoUp() : 0);
        map.put("poMbNum", p.getPoMbNum());
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
