package service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import dao.MemberDAO;
import model.DTO.LoginDTO;
import model.DTO.LoginRequestDTO;
import model.DTO.MemberSignUpDTO;
import model.VO.MemberVO;

@Service
public class MemberService {

	// MemberDAO 자동 주입
	@Autowired
	private MemberDAO memberDAO;
	
	// 비밀번호 암호화를 위한 BCryptPasswordEncoder 자동 주입
	@Autowired
    private BCryptPasswordEncoder encoder;

	// 회원가입 메서드
	public boolean signup(LoginDTO user) {
		try {
			// 1. DB에 동일한 아이디가 있는지 확인
			MemberVO member = memberDAO.selectMember(user);
			
			// 2. 동일한 아이디가 없으면 회원가입 진행
			if(member == null) {
				// 3. 비밀번호 암호화 후 DTO 생성
				MemberSignUpDTO signUpDTO = new MemberSignUpDTO(
					user.id(),
					encoder.encode(user.pw()),
					user.email(),
					user.agree()
				);
				// 4. 암호화된 정보로 DB 저장
				boolean res = memberDAO.insertMember(signUpDTO);
				return res;
			}
			// 5. 동일한 아이디가 있으면 회원가입 실패
			else {
				return false;
			}
		} catch (Exception e) {
			// 예외 발생 시 로그 출력 및 false 반환
			e.printStackTrace();
			return false;
		}
	}
	
	// 로그인 메서드
	public MemberVO login(LoginRequestDTO user) {
		try {
			// 1. DB에서 입력받은 아이디로 회원정보 조회
			MemberVO member = memberDAO.selectMemberById(user.id());
			
			// 2. 회원정보가 존재하면
			if(member != null) {
				// 3. 입력한 비밀번호와 DB의 암호화된 비밀번호 비교
				if(encoder.matches(user.pw(), member.getMb_pw())) {
					// 4. 비밀번호가 일치하면 회원정보 반환
					return member;
				}
			}
			// 5. 회원정보가 없거나 비밀번호가 일치하지 않으면 null 반환
			return null;
		} catch (Exception e) {
			// 예외 발생 시 로그 출력 및 null 반환
			e.printStackTrace();
			return null;
		}
	}

}
