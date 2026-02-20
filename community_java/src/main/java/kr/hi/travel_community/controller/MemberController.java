import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import kr.hi.travel_community.model.dto.LoginRequestDTO;
import kr.hi.travel_community.model.vo.MemberVO;
import kr.hi.travel_community.security.jwt.JwtTokenProvider;
import kr.hi.travel_community.service.MemberService;

@RestController
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class MemberController {

    @Autowired private MemberService memberService;
    @Autowired private JwtTokenProvider jwtTokenProvider;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDTO user) {

        if (user == null
                || user.id() == null || user.id().trim().isEmpty()
                || user.pw() == null || user.pw().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("아이디/비밀번호를 입력하세요.");
        }

        // ✅ rememberMe null 방어 (프론트에서 필드 안 보내면 null 들어올 수 있음)
        boolean remember = (user.rememberMe() != null) && user.rememberMe();

        // ✅ trim 처리 (record라 새로 생성)
        LoginRequestDTO cleaned = new LoginRequestDTO(
                user.id().trim(),
                user.pw().trim(),
                remember
        );

        MemberVO member = memberService.login(cleaned);

        if (member == null) {
            return ResponseEntity.badRequest().body("아이디 또는 비밀번호가 일치하지 않습니다.");
        }

        // ✅ 보안상 비번 제거
        member.setMb_pw(null);

        // ✅ access token 발급 (바디로 내려줌)
        // (중요) JwtTokenProvider에 createAccessToken(String) 오버로드가 있어야 함!
        String accessToken = jwtTokenProvider.createAccessToken(member.getMb_Uid());

        Map<String, Object> body = new HashMap<>();
        body.put("member", member);
        body.put("accessToken", accessToken);

        // ✅ rememberMe false면 기존 refreshToken 쿠키가 남아있을 수 있으니 삭제 쿠키 내려줌
        if (!remember) {
            ResponseCookie deleteCookie = ResponseCookie.from("refreshToken", "")
                    .httpOnly(true)
                    .secure(false)     // 로컬 http는 false, 배포 https면 true
                    .sameSite("Lax")
                    .path("/")
                    .maxAge(0)         // 삭제
                    .build();

            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, deleteCookie.toString())
                    .body(body);
        }

        // ✅ rememberMe true면 refreshToken 쿠키 발급
        String refreshToken = jwtTokenProvider.createRefreshToken(member.getMb_Uid());

        ResponseCookie cookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(false)       // 로컬 http라 false (배포 https면 true)
                .sameSite("Lax")
                .path("/")
                .maxAge(Duration.ofDays(14)) // 자동로그인 유지기간
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(body);
    }
}