package kr.hi.travel_community.controller;

import kr.hi.travel_community.entity.RankingEntity;
import kr.hi.travel_community.service.RankingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/travel")
public class RankingController {

    @Autowired
    private RankingService rankingService;

    @GetMapping("/update")
    public String updateRanking() {
        try {
            // 서비스에서 결과를 직접 문자열로 받아 리턴
            return rankingService.updateRankingFromApi(null, null);
        } catch (Exception e) {
            return "❌ 컨트롤러 오류 발생: " + e.getMessage();
        }
    }

    @GetMapping("/ranking")
    public List<RankingEntity> getRanking() {
        return rankingService.getTop5Rankings();
    }
}