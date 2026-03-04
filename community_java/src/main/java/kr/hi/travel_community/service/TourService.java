package kr.hi.travel_community.service;

import kr.hi.travel_community.mapper.TourMapper;
import kr.hi.travel_community.model.dto.ItemDto;
import kr.hi.travel_community.model.dto.TourResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.List;

@Service
@RequiredArgsConstructor // final이 붙은 필드를 자동으로 생성자 주입해줍니다.
public class TourService {

    private final TourMapper tourMapper;
    private final RestTemplate restTemplate;

    // 공공데이터포털에서 발급받은 'Decoding' 인증키를 사용하세요.
    private final String SERVICE_KEY = "7bc754a262db3e1a61b0337c5163a04796ab2c65e18d778fd264305dd120a86c";

    @Transactional
    public void getTourDataAndSave() {
        // 1. 서비스키를 포함한 전체 URL 문자열을 먼저 만듭니다.
        // 주의: SERVICE_KEY 변수에는 공공데이터포털에서 받은 'Encoding' 키를 넣는 것이 보통 가장 잘 작동합니다.
        String urlString = "http://apis.data.go.kr/B551011/KorService1/areaBasedList1"
                + "?serviceKey=" + SERVICE_KEY  // 인증키 직접 결합
                + "&numOfRows=100"
                + "&pageNo=1"
                + "&MobileOS=ETC"
                + "&MobileApp=TravelApp"
                + "&_type=json";

        try {
            // 2. 문자열을 URI 객체로 변환 (자동 인코딩 방지)
            URI uri = new URI(urlString);

            // 3. 호출
            TourResponseDto response = restTemplate.getForObject(uri, TourResponseDto.class);

            if (response != null && response.getResponse().getBody().getItems() != null) {
                List<ItemDto> tourList = response.getResponse().getBody().getItems().getItem();
                for (ItemDto item : tourList) {
                    tourMapper.insertTour(item);
                }
                System.out.println(">>> 성공: " + tourList.size() + "건 저장 완료");
            }
        } catch (Exception e) {
            System.err.println(">>> 상세 에러: " + e.getMessage());
            e.printStackTrace();
        }
    }
}