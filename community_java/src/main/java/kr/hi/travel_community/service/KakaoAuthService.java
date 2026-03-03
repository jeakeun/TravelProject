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
 */
@Service
public class KakaoAuthService {

    @Value("${kakao.rest-api-key:}")
    private String restApiKey;

    @Value("${kakao.redirect-uri:http://localhost:3000/kakao-callback}")
    private String redirectUri;

    /** Client Secret(콘솔에서 사용 설정 시 토큰 교환에 필수). 비어 있으면 생략. */
    @Value("${kakao.client-secret:}")
    private String clientSecret;

    private final HttpClient httpClient = HttpClient.newBuilder().build();
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * 인증 코드를 카카오 access token으로 교환.
     * @param redirectUriOverride 프론트에서 사용한 redirect_uri(있으면 이 값 사용, 없으면 설정값 사용)
     */
    public String exchangeCodeForToken(String code, String redirectUriOverride) throws Exception {
        if (restApiKey == null || restApiKey.isBlank()) {
            throw new IllegalStateException("kakao.rest-api-key가 설정되지 않았습니다.");
        }
        String uri = (redirectUriOverride != null && !redirectUriOverride.isBlank()) ? redirectUriOverride : redirectUri;
        String body = "grant_type=authorization_code"
                + "&client_id=" + URLEncoder.encode(restApiKey, StandardCharsets.UTF_8)
                + "&redirect_uri=" + URLEncoder.encode(uri, StandardCharsets.UTF_8)
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
     * 카카오 access token으로 사용자 정보 조회
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

        return Map.of(
                "id", kakaoId,
                "nickname", nickname != null && !nickname.isBlank() ? nickname : "카카오회원",
                "email", email != null && !email.isBlank() ? email : "kakao_" + kakaoId + "@kakao.local"
        );
    }
}
