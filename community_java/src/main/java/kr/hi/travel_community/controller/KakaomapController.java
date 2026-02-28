package kr.hi.travel_community.controller;

import kr.hi.travel_community.entity.Kakaomap;
import kr.hi.travel_community.service.KakaomapService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/map")
@RequiredArgsConstructor
@CrossOrigin(origins = {
        "http://localhost:3000",
        "http://3.37.160.108"
})
public class KakaomapController {

    private final KakaomapService kakaomapService;

    // 1. 서버 연결 테스트
    @GetMapping("/hello")
    public String hello() {
        return "백엔드 서버와 연결되었습니다!";
    }

    // 2. 전체 장소(마커) 데이터 전송
    @GetMapping("/places")
    public List<Kakaomap> getPlaces() {
        return kakaomapService.getAllPlaces();
    }

    // 3. 카테고리별 장소 데이터 전송
    @GetMapping("/places/{category}")
    public List<Kakaomap> getPlacesByCategory(@PathVariable String category) {
        return kakaomapService.getPlacesByCategory(category);
    }

    // 4. 새로운 장소 DB 저장
    @PostMapping("/save")
    public ResponseEntity<Kakaomap> savePlace(@RequestBody Kakaomap kakaomap) {
        Kakaomap savedPlace = kakaomapService.savePlace(kakaomap);
        if (savedPlace != null) {
            return ResponseEntity.ok(savedPlace);
        } else {
            return ResponseEntity.badRequest().build();
        }
    }
}