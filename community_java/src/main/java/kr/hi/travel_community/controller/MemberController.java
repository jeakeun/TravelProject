package kr.hi.travel_community.controller;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import kr.hi.travel_community.dao.MemberDAO;
import kr.hi.travel_community.model.dto.LoginDTO;
import kr.hi.travel_community.model.dto.LoginRequestDTO;
import kr.hi.travel_community.model.util.CustomUser;
import kr.hi.travel_community.model.vo.MemberVO;
import kr.hi.travel_community.security.jwt.JwtTokenProvider;
import kr.hi.travel_community.service.MemberService;

@RestController
public class MemberController {

    @Autowired private MemberService memberService;
    @Autowired private JwtTokenProvider jwtTokenProvider;
    @Autowired private MemberDAO memberDAO;

    /**
     * 회원가입: 아이디, 비밀번호, 비밀번호 확인(프론트 검증), 이메일
     */
    @PostMapping("/signup")
    public ResponseEntity<String> signup(@RequestBody LoginDTO dto) {
        if (dto == null) {
            return ResponseEntity.badRequest().body("입력 정보를 확인해주세요.");
        }
        String id = dto.id() != null ? dto.id().trim() : "";
        String pw = dto.pw() != null ? dto.pw().trim() : "";
        String email = dto.email() != null ? dto.email().trim() : "";

        if (id.isEmpty()) {
            return ResponseEntity.badRequest().body("아이디를 입력하세요.");
        }
        if (pw.isEmpty()) {
            return ResponseEntity.badRequest().body("비밀번호를 입력하세요.");
        }
        if (email.isEmpty()) {
            return ResponseEntity.badRequest().body("이메일을 입력하세요.");
        }
        if (!dto.agree()) {
            return ResponseEntity.badRequest().body("개인정보 처리방침에 동의해주세요.");
        }

        boolean ok = memberService.signup(new LoginDTO(id, pw, email, dto.agree()));
        if (ok) {
            return ResponseEntity.ok("회원가입이 완료되었습니다.");
        }
        return ResponseEntity.badRequest().body("이미 사용 중인 아이디 또는 이메일입니다.");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDTO user) {

        if (user == null
                || user.id() == null || user.id().trim().isEmpty()
                || user.pw() == null || user.pw().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("아이디/비밀번호를 입력하세요.");
        }

        // ✅ rememberMe가 boolean/Boolean 어떤 타입이든 안전하게 처리
        boolean remember = false;
        try {
            // record의 rememberMe()가 Boolean이면 null 가능
            // boolean이면 항상 값이 나오므로 그대로 들어감
            remember = (Boolean.TRUE.equals(user.rememberMe()));
        } catch (Exception ignore) {
            // 혹시 record 구조가 다른 경우 대비
            remember = false;
        }

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

        member.setMb_pw(null);

        // ✅ access token 발급
        String accessToken = jwtTokenProvider.createAccessToken(member.getMb_Uid());

        Map<String, Object> body = new HashMap<>();
        body.put("member", member);
        body.put("accessToken", accessToken);

        // ✅ rememberMe false면 refreshToken 쿠키 삭제 내려주기
        if (!remember) {
            ResponseCookie deleteCookie = ResponseCookie.from("refreshToken", "")
                    .httpOnly(true)
                    .secure(false)      // 로컬 http: false / 배포 https: true
                    .sameSite("Lax")
                    .path("/")
                    .maxAge(0)
                    .build();

            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, deleteCookie.toString())
                    .body(body);
        }

        // ✅ rememberMe true면 refreshToken 쿠키 발급
        String refreshToken = jwtTokenProvider.createRefreshToken(member.getMb_Uid());

        ResponseCookie cookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(false)
                .sameSite("Lax")
                .path("/")
                .maxAge(Duration.ofDays(14))
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(body);
    }

    /**
     * ✅ 자동로그인: refreshToken(쿠키)로 accessToken 재발급
     * - 프론트에서 fetch/axios 요청 시 반드시 credentials(include) 필요
     */
    @PostMapping("/auth/refresh")
    public ResponseEntity<?> refresh(HttpServletRequest request) {

        String refreshToken = jwtTokenProvider.getTokenFromCookie(request, "refreshToken");

        if (refreshToken == null || refreshToken.isBlank()) {
            return ResponseEntity.status(401).body("자동로그인 정보가 없습니다.");
        }

        try {
            // ✅ refresh 토큰인지 확인
            if (!jwtTokenProvider.isRefreshToken(refreshToken)) {
                return deleteRefreshCookieAnd401("유효하지 않은 토큰입니다.");
            }

            Claims claims = jwtTokenProvider.parseClaims(refreshToken);
            String id = claims.getSubject();

            // ✅ 계정 존재 확인(권장)
            MemberVO member = memberDAO.selectMemberById(id);
            if (member == null) {
                return deleteRefreshCookieAnd401("계정을 찾을 수 없습니다.");
            }
            member.setMb_pw(null);

            // ✅ 새 accessToken 발급
            String newAccessToken = jwtTokenProvider.createAccessToken(id);

            Map<String, Object> body = new HashMap<>();
            body.put("member", member);
            body.put("accessToken", newAccessToken);

            // ✅ refreshToken rotate(추천)
            String newRefreshToken = jwtTokenProvider.createRefreshToken(id);

            ResponseCookie cookie = ResponseCookie.from("refreshToken", newRefreshToken)
                    .httpOnly(true)
                    .secure(false)
                    .sameSite("Lax")
                    .path("/")
                    .maxAge(Duration.ofDays(14))
                    .build();

            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, cookie.toString())
                    .body(body);

        } catch (Exception e) {
            return deleteRefreshCookieAnd401("자동로그인 정보가 만료되었습니다. 다시 로그인 해주세요.");
        }
    }

    /**
     * 비밀번호 찾기 1단계: 아이디 + 이메일로 본인 확인
     */
    @PostMapping("/auth/verify-user")
    public ResponseEntity<String> verifyUser(@RequestBody Map<String, String> body) {
        String id = body != null ? (body.get("id") != null ? body.get("id").trim() : "") : "";
        String email = body != null ? (body.get("email") != null ? body.get("email").trim() : "") : "";
        if (id.isEmpty() || email.isEmpty()) {
            return ResponseEntity.badRequest().body("아이디와 이메일을 입력하세요.");
        }
        boolean ok = memberService.verifyUserForReset(id, email);
        if (ok) {
            return ResponseEntity.ok("OK");
        }
        return ResponseEntity.badRequest().body("아이디/이메일이 일치하는 계정을 찾을 수 없습니다.");
    }

    /**
     * 비밀번호 찾기 2단계: 새 비밀번호로 변경 (아이디+이메일 인증 후)
     */
    @PostMapping("/auth/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody Map<String, String> body) {
        String id = body != null ? (body.get("id") != null ? body.get("id").trim() : "") : "";
        String newPw = body != null ? (body.get("newPw") != null ? body.get("newPw").trim() : "") : "";
        if (id.isEmpty() || newPw.isEmpty()) {
            return ResponseEntity.badRequest().body("아이디와 새 비밀번호를 입력하세요.");
        }
        boolean ok = memberService.resetPassword(id, newPw);
        if (ok) {
            return ResponseEntity.ok("OK");
        }
        return ResponseEntity.badRequest().body("비밀번호 변경에 실패했습니다.");
    }

    /**
     * 로그인 사용자 비밀번호 변경: 현재 비밀번호 확인 후 새 비밀번호로 변경
     */
    @PostMapping("/auth/change-password")
    public ResponseEntity<String> changePassword(@RequestBody Map<String, String> body) {
        String id = body != null ? (body.get("id") != null ? body.get("id").trim() : "") : "";
        String currentPw = body != null ? (body.get("currentPw") != null ? body.get("currentPw").trim() : "") : "";
        String newPw = body != null ? (body.get("newPw") != null ? body.get("newPw").trim() : "") : "";
        if (id.isEmpty() || currentPw.isEmpty() || newPw.isEmpty()) {
            return ResponseEntity.badRequest().body("현재 비밀번호와 새 비밀번호를 모두 입력하세요.");
        }
        boolean ok = memberService.changePassword(id, currentPw, newPw);
        if (ok) {
            return ResponseEntity.ok("OK");
        }
        return ResponseEntity.badRequest().body("현재 비밀번호가 일치하지 않거나 변경에 실패했습니다.");
    }

    /**
     * ✅ 로그인 사용자 닉네임 변경 (JWT로 본인 확인)
     */
    @PostMapping("/auth/update-nickname")
    public ResponseEntity<String> updateNickname(Authentication authentication, @RequestBody Map<String, String> body) {
        if (authentication == null || !(authentication.getPrincipal() instanceof CustomUser)) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }
        String id = ((CustomUser) authentication.getPrincipal()).getMember().getMb_Uid();
        String newNickname = body != null ? (body.get("nickname") != null ? body.get("nickname").trim() : "") : "";
        if (newNickname.isEmpty()) {
            return ResponseEntity.badRequest().body("닉네임을 입력하세요.");
        }
        boolean ok = memberService.updateNickname(id, newNickname);
        if (ok) {
            return ResponseEntity.ok("OK");
        }
        return ResponseEntity.badRequest().body("닉네임은 2~15자, 한글/영문/숫자/밑줄만 가능합니다.");
    }

    /**
     * ✅ 로그인 사용자 프로필 사진 변경 (DB BLOB 저장, 프로젝트 파일 사용 안 함)
     */
    @PostMapping("/auth/update-photo")
    public ResponseEntity<?> updatePhoto(Authentication authentication, @RequestParam("photo") MultipartFile photo) {
        if (authentication == null || !(authentication.getPrincipal() instanceof CustomUser)) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }
        String id = ((CustomUser) authentication.getPrincipal()).getMember().getMb_Uid();
        if (photo == null || photo.isEmpty()) {
            return ResponseEntity.badRequest().body("사진을 선택하세요.");
        }
        String contentType = photo.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ResponseEntity.badRequest().body("이미지 파일만 업로드 가능합니다.");
        }
        Integer photoVer = memberService.updatePhoto(id, photo);
        if (photoVer == null) {
            return ResponseEntity.badRequest().body("업로드에 실패했습니다.");
        }
        Map<String, Object> body = new HashMap<>();
        body.put("mb_photo_ver", photoVer);
        return ResponseEntity.ok(body);
    }

    /**
     * ✅ 프로필 사진 조회 (DB에서 BLOB 반환, JWT 인증)
     */
    @GetMapping("/auth/profile-photo")
    public ResponseEntity<?> getProfilePhoto(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof CustomUser)) {
            return ResponseEntity.status(401).build();
        }
        String id = ((CustomUser) authentication.getPrincipal()).getMember().getMb_Uid();
        byte[] data = memberService.getPhotoData(id);
        if (data == null || data.length == 0) {
            return ResponseEntity.notFound().build();
        }
        String contentType = memberService.getPhotoContentType(id);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType != null ? contentType : "image/jpeg"))
                .body(data);
    }

    /**
     * ✅ 로그인 사용자 이메일 변경 (JWT로 본인 확인)
     */
    @PostMapping("/auth/update-email")
    public ResponseEntity<String> updateEmail(Authentication authentication, @RequestBody Map<String, String> body) {
        if (authentication == null || !(authentication.getPrincipal() instanceof CustomUser)) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }
        String id = ((CustomUser) authentication.getPrincipal()).getMember().getMb_Uid();
        String newEmail = body != null ? (body.get("email") != null ? body.get("email").trim() : "") : "";
        if (newEmail.isEmpty()) {
            return ResponseEntity.badRequest().body("이메일을 입력하세요.");
        }
        boolean ok = memberService.updateEmail(id, newEmail);
        if (ok) {
            return ResponseEntity.ok("OK");
        }
        return ResponseEntity.badRequest().body("이미 사용 중인 이메일이거나 변경에 실패했습니다.");
    }

    /**
     * ✅ 회원 탈퇴: 비밀번호 확인 후 계정 삭제 (JWT로 본인 확인)
     * 카카오 로그인 사용자는 비밀번호 없이 탈퇴 가능
     */
    @PostMapping("/auth/withdraw")
    public ResponseEntity<String> withdraw(Authentication authentication, @RequestBody Map<String, String> body) {
        if (authentication == null || !(authentication.getPrincipal() instanceof CustomUser)) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }
        String id = ((CustomUser) authentication.getPrincipal()).getMember().getMb_Uid();
        String password = body != null ? (body.get("password") != null ? body.get("password") : "") : "";
        MemberVO member = memberDAO.selectMemberById(id);
        boolean isKakao = member != null && "kakao".equalsIgnoreCase(member.getMb_provider());
        if (!isKakao && password.isEmpty()) {
            return ResponseEntity.badRequest().body("비밀번호를 입력하세요.");
        }
        boolean ok = memberService.withdraw(id, password);
        if (ok) {
            return ResponseEntity.ok("OK");
        }
        return ResponseEntity.badRequest().body("비밀번호가 일치하지 않거나 탈퇴에 실패했습니다.");
    }

    /**
     * 카카오 로그인/회원가입: authorization code를 받아 토큰 교환 → 사용자 조회/생성 → JWT 발급
     */
    @PostMapping("/auth/kakao")
    public ResponseEntity<?> kakaoAuth(@RequestBody Map<String, Object> body) {
        String code = body != null && body.get("code") != null ? body.get("code").toString().trim() : null;
        if (code == null || code.isEmpty()) {
            return ResponseEntity.badRequest().body("카카오 인증 코드가 없습니다.");
        }
        boolean fromSignup = body != null && Boolean.TRUE.equals(body.get("signup"));
        MemberVO member = memberService.kakaoLoginOrSignup(code, fromSignup);
        if (member == null) {
            return ResponseEntity.badRequest().body("카카오 로그인에 실패했습니다.");
        }

        String accessToken = jwtTokenProvider.createAccessToken(member.getMb_Uid());
        String refreshToken = jwtTokenProvider.createRefreshToken(member.getMb_Uid());

        ResponseCookie cookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(false)
                .sameSite("Lax")
                .path("/")
                .maxAge(Duration.ofDays(14))
                .build();

        Map<String, Object> resBody = new HashMap<>();
        resBody.put("member", member);
        resBody.put("accessToken", accessToken);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(resBody);
    }

    /**
     * ✅ 로그아웃: refreshToken 쿠키 삭제
     */
    @PostMapping("/auth/logout")
    public ResponseEntity<?> logout() {
        ResponseCookie deleteCookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(false)
                .sameSite("Lax")
                .path("/")
                .maxAge(0)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, deleteCookie.toString())
                .body("OK");
    }

    // ✅ 공통: refresh 쿠키 삭제 + 401
    private ResponseEntity<String> deleteRefreshCookieAnd401(String message) {
        ResponseCookie deleteCookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(false)
                .sameSite("Lax")
                .path("/")
                .maxAge(0)
                .build();

        return ResponseEntity.status(401)
                .header(HttpHeaders.SET_COOKIE, deleteCookie.toString())
                .body(message);
    }
}