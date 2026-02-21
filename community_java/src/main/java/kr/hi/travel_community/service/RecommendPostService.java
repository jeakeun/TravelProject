package kr.hi.travel_community.service;

import kr.hi.travel_community.entity.Post;
import kr.hi.travel_community.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecommendPostService {
    private final PostRepository postRepository;

    public List<Map<String, Object>> getAllPosts() {
        return postRepository.findAll().stream()
                .filter(p -> "N".equals(p.getPoDel()))
                .map(p -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("poNum", p.getPoNum());
                    map.put("poTitle", p.getPoTitle());
                    map.put("poContent", p.getPoContent());
                    map.put("poView", p.getPoView());
                    map.put("poDate", p.getPoDate());
                    return map;
                }).collect(Collectors.toList());
    }

    public Optional<Post> getPostDetail(Integer id, Integer memberId) {
        return postRepository.findById(id)
                .map(post -> {
                    postRepository.updateViewCount(post.getPoNum());
                    return post;
                });
    }
}