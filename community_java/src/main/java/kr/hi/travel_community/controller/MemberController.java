package kr.hi.travel_community.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin; // 🚩 추가
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import kr.hi.travel_community.model.dto.LoginDTO;
import kr.hi.travel_community.model.dto.LoginRequestDTO;
import kr.hi.travel_community.model.vo.MemberVO;
import kr.hi.travel_community.service.MemberService;

@RestController
@CrossOrigin(origins = "http://localhost:3000") // 🚩 리액트(3000포트) 접속 허용을 위해 필수 추가
public class MemberController {
	
	@Autowired
	private MemberService memberService;

	/**
	 * 회원가입 요청 처리
	 */
	@PostMapping("/signup")
	public ResponseEntity<String> signup(@RequestBody LoginDTO user) {
		// MemberService의 signup 메서드 호출
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
		// MemberService의 login 메서드 호출하여 사용자 인증
		MemberVO member = memberService.login(user);
		
		if (member != null) {
			// 🚩 보안을 위해 클라이언트로 전송 전 비밀번호는 비웁니다.
			member.setMb_pw(null);
			// 리액트에서 로그인한 사용자의 정보를 활용할 수 있도록 객체를 반환합니다.
			return ResponseEntity.ok(member);
		} else {
			return ResponseEntity.badRequest().body("아이디 또는 비밀번호가 일치하지 않습니다.");
		}
	}
}
