package kr.hi.travel_community.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import kr.hi.travel_community.model.dto.LoginDTO;
import kr.hi.travel_community.model.dto.LoginRequestDTO;
import kr.hi.travel_community.model.dto.ResetPasswordRequestDTO;
import kr.hi.travel_community.model.dto.VerifyUserRequestDTO;
import kr.hi.travel_community.model.vo.MemberVO;
import kr.hi.travel_community.service.MemberService;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class MemberController {

	@Autowired
	private MemberService memberService;

	/**
	 * 회원가입 요청 처리
	 */
	@PostMapping("/signup")
	public ResponseEntity<String> signup(@RequestBody LoginDTO user) {
		boolean res = memberService.signup(user);

		if (res) {
			return ResponseEntity.ok("회원가입이 완료되었습니다.");
		} else {
			return ResponseEntity.badRequest().body("이미 가입된 사용자이거나 가입 정보가 올바르지 않습니다.");
		}
	}

	/**
	 * 로그인 요청 처리
	 */
	@PostMapping("/login")
	public ResponseEntity<?> login(@RequestBody LoginRequestDTO user) {
		MemberVO member = memberService.login(user);

		if (member != null) {
			member.setMb_pw(null); // 보안상 비번 제거
			return ResponseEntity.ok(member);
		} else {
			return ResponseEntity.badRequest().body("아이디 또는 비밀번호가 일치하지 않습니다.");
		}
	}

	/**
	 * ✅ 비밀번호 찾기 검증: 아이디 + 이메일이 둘 다 일치하는지 확인
	 * - 일치하면 OK (프론트에서 ResetPassword 팝업 열기)
	 */
	@PostMapping("/auth/verify-user")
	public ResponseEntity<String> verifyUser(@RequestBody VerifyUserRequestDTO req) {
		boolean ok = memberService.verifyUserForReset(req.id(), req.email());

		if (ok) {
			return ResponseEntity.ok("OK");
		} else {
			return ResponseEntity.badRequest().body("아이디 또는 이메일이 일치하지 않습니다.");
		}
	}

	/**
	 * ✅ 비밀번호 변경: 새 비밀번호를 BCrypt로 암호화해서 DB에 저장
	 */
	@PostMapping("/auth/reset-password")
	public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordRequestDTO req) {
		boolean ok = memberService.resetPassword(req.id(), req.newPw());

		if (ok) {
			return ResponseEntity.ok("비밀번호가 변경되었습니다.");
		} else {
			return ResponseEntity.badRequest().body("비밀번호 변경에 실패했습니다.");
		}
	}
}