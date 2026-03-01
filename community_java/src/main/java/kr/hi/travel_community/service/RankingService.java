package kr.hi.travel_community.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import kr.hi.travel_community.entity.RankingEntity;
import kr.hi.travel_community.repository.RankingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class RankingService {

    @Autowired
    private RankingRepository rankingRepository;

    // 🚩 공공데이터 포털에서 [국문 관광정보 서비스] 활용 신청이 승인되었는지 꼭 확인하세요.
    private final String SERVICE_KEY = "3963ee2063c0717b8235e149a144343f5ed10c86d73dde2b75c2f3adbe9603f0";
    
    // 🚩 서버 500 에러를 방지하기 위해 https 대신 http로 호출을 시도합니다.
    private final String API_URL = "http://apis.data.go.kr/B551011/KorService1/areaBasedList1";

    /**
     * [매주 월요일 00:00 자동 리셋]
     */
    @Scheduled(cron = "0 0 0 * * MON")
    @Transactional
    public String updateRankingFromApiAuto() {
        LocalDate now = LocalDate.now();
        String startDay = now.minusWeeks(1).format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String endDay = now.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        
        return updateRankingFromApi(startDay, endDay);
    }

    /**
     * 세부 명소 데이터를 가져와 DB를 업데이트합니다.
     */
    @Transactional
    public String updateRankingFromApi(String start, String end) {
        try {
            String startDay = (start == null || start.isEmpty()) ? "20260215" : start;
            String endDay = (end == null || end.isEmpty()) ? "20260222" : end;

            // URI 빌드 (조회수 순 정렬: arrange=R)
            URI uri = UriComponentsBuilder.fromHttpUrl(API_URL)
                    .queryParam("serviceKey", SERVICE_KEY)
                    .queryParam("numOfRows", 15)
                    .queryParam("pageNo", 1)
                    .queryParam("MobileOS", "ETC")
                    .queryParam("MobileApp", "travel")
                    .queryParam("_type", "json")
                    .queryParam("contentTypeId", 12) 
                    .queryParam("arrange", "R")      
                    .build(true)
                    .toUri();

            System.out.println("🚀 [요청 시도] URI: " + uri);

            RestTemplate restTemplate = new RestTemplate();
            
            // 🚩 서버에서 500 에러가 발생하면 여기서 Exception이 터져 catch 블록으로 이동합니다.
            String response = restTemplate.getForObject(uri, String.class);
            
            System.out.println("📩 [응답 수신] 내용: " + response);

            if (response == null || response.contains("<returnAuthMsg>") || response.contains("SERVICE_KEY_IS_NOT_REGISTERED_ERROR")) {
                throw new RuntimeException("API 인증 실패");
            }

            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(response);
            JsonNode items = root.path("response").path("body").path("items").path("item");

            List<RankingEntity> top5List = new ArrayList<>();

            if (items.isArray() && items.size() > 0) {
                for (JsonNode item : items) {
                    if (top5List.size() >= 5) break;

                    RankingEntity entity = new RankingEntity();
                    // 🚩 title 필드를 사용하여 세부 명소(경복궁 등) 저장
                    entity.setAreaNm(item.path("title").asText("알 수 없는 명소"));
                    entity.setVCount(item.path("readcount").asLong(0));
                    entity.setSigunguCode(item.path("sigungucode").asText("000"));
                    entity.setBaseDate(startDay + "~" + endDay);
                    
                    top5List.add(entity);
                }
            }

            if (!top5List.isEmpty()) {
                rankingRepository.deleteAll();
                rankingRepository.saveAll(top5List);
                return "✅ [실시간 업데이트] 세부 명소 데이터 갱신 완료!";
            } else {
                return insertDummyData();
            }

        } catch (Exception e) {
            // 🚩 500 에러 발생 시 이 로그가 찍히며 더미 데이터를 넣습니다.
            System.err.println("⚠️ API 서버 응답 오류 혹은 호출 실패. 테스트 데이터를 로드합니다.");
            return insertDummyData();
        }
    }

    /**
     * 리액트 지도에서 바로 검색 가능한 구체적인 명소 데이터를 강제로 넣습니다.
     */
    private String insertDummyData() {
        List<RankingEntity> dummyList = new ArrayList<>();
        // 실제 검색이 매우 잘 되는 구체적인 명소 이름 리스트
        String[] places = {"경복궁", "해운대해수욕장", "남산서울타워", "성산일출봉", "불국사"};
        long[] counts = {450800, 380200, 310500, 290100, 210400};

        for (int i = 0; i < 5; i++) {
            RankingEntity entity = new RankingEntity();
            entity.setAreaNm(places[i]);
            entity.setVCount(counts[i]);
            entity.setSigunguCode("000");
            entity.setBaseDate(LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")) + " (업데이트 대기)");
            dummyList.add(entity);
        }
        rankingRepository.deleteAll();
        rankingRepository.saveAll(dummyList);
        return "⚠️ [임시 모드] 공공데이터 서버 응답 지연으로 테스트 명소 데이터를 로드했습니다.";
    }

    public List<RankingEntity> getTop5Rankings() {
        return rankingRepository.findAll();
    }
}