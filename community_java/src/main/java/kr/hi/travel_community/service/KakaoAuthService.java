package kr.hi.travel_community.service;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * 카카오 OAuth2: authorization code → access token → 사용자 정보
 * [카카오 로그인] 프론트에서 Kakao.Auth.authorize() 후 받은 code를 서버에서 토큰으로 교환하고
 * 사용자 정보를 가져오기 위한 서비스. 카카오 REST API 호출 담당.
 */
@Service
public class KakaoAuthService {

    /** 카카오 REST API 키. 토큰 교환 시 필요. application.properties 또는 KAKAO_REST_API_KEY 환경변수. */
    @Value("${kakao.rest-api-key:}")
    private String restApiKey;

    /** 카카오 개발자 콘솔에 등록한 Redirect URI와 동일해야 함. 토큰 교환 시 검증에 사용됨. */
    @Value("${kakao.redirect-uri:http://localhost:3000/kakao-callback}")
    private String redirectUri;

    /** Client Secret(콘솔에서 사용 설정 시 토큰 교환에 필수). 비어 있으면 생략. */
    @Value("${kakao.client-secret:}")
    private String clientSecret;

    private final HttpClient httpClient = HttpClient.newBuilder().build();
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * 인증 코드를 카카오 access token으로 교환.
     * 카카오 OAuth2 규격: code로 토큰 요청 → access_token 수신.
     */
    public String exchangeCodeForToken(String code) throws Exception {
        if (restApiKey == null || restApiKey.isBlank()) {
            throw new IllegalStateException("kakao.rest-api-key가 설정되지 않았습니다.");
        }
        String body = "grant_type=authorization_code"
                + "&client_id=" + URLEncoder.encode(restApiKey, StandardCharsets.UTF_8)
                + "&redirect_uri=" + URLEncoder.encode(redirectUri, StandardCharsets.UTF_8)
                + "&code=" + URLEncoder.encode(code, StandardCharsets.UTF_8);
        if (clientSecret != null && !clientSecret.isBlank()) {
            body += "&client_secret=" + URLEncoder.encode(clientSecret, StandardCharsets.UTF_8);
        }

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://kauth.kakao.com/oauth/token"))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new IllegalArgumentException("카카오 토큰 교환 실패: " + response.body());
        }

        JsonNode root = objectMapper.readTree(response.body());
        JsonNode accessToken = root.get("access_token");
        if (accessToken == null || accessToken.isNull()) {
            throw new IllegalArgumentException("카카오 access_token을 받지 못했습니다.");
        }
        return accessToken.asText();
    }

    /**
     * 카카오 access token으로 사용자 정보 조회.
     * id, nickname, email 추출 → 회원 가입/로그인 시 사용.
     * @return Map with keys: id (Long), email (String, nullable), nickname (String, nullable)
     */
    public Map<String, Object> getUserInfo(String accessToken) throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://kapi.kakao.com/v2/user/me"))
                .header("Authorization", "Bearer " + accessToken)
                .GET()
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new IllegalArgumentException("카카오 사용자 정보 조회 실패: " + response.body());
        }

        JsonNode root = objectMapper.readTree(response.body());

        long kakaoId = root.path("id").asLong();
        String nickname = null;
        if (root.has("properties") && root.get("properties").has("nickname")) {
            JsonNode nn = root.get("properties").get("nickname");
            if (nn != null && !nn.isNull()) nickname = nn.asText();
        }
        String email = null;
        if (root.has("kakao_account") && root.get("kakao_account").has("email")) {
            JsonNode emailNode = root.get("kakao_account").get("email");
            if (emailNode != null && !emailNode.isNull()) email = emailNode.asText();
        }

        // 이메일/닉네임 미동의 시 fallback 값 사용 (카카오 API에서 미제공 가능)
        return Map.of(
                "id", kakaoId,
                "nickname", nickname != null && !nickname.isBlank() ? nickname : "카카오회원",
                "email", email != null && !email.isBlank() ? email : "kakao_" + kakaoId + "@kakao.local"
        );
    }
}
