package kr.hi.travel_community.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import kr.hi.travel_community.dao.MemberDAO;
import kr.hi.travel_community.model.dto.LoginDTO;
import kr.hi.travel_community.model.dto.LoginRequestDTO;
import kr.hi.travel_community.model.dto.MemberSignUpDTO;
import kr.hi.travel_community.model.vo.MemberVO;

@Service
public class MemberService {

    @Autowired
    private MemberDAO memberDAO;
    
    @Autowired
    private BCryptPasswordEncoder encoder;

    /**
     * 회원가입 로직
     */
    public boolean signup(LoginDTO user) {
        try {
            // 1. 기존 회원 여부 확인 (아이디와 이메일 중복 체크)
            MemberVO member = memberDAO.selectMember(user);
            
            // 2. 가입된 정보가 없으면 진행
            if (member == null) {
                // 3. 비밀번호 암호화 및 새로운 DTO 생성
                // Record 객체이므로 .id(), .pw() 형태로 접근합니다.
                MemberSignUpDTO signUpDTO = new MemberSignUpDTO(
                    user.id(),
                    encoder.encode(user.pw()), // 비밀번호 암호화
                    user.email(),
                    user.agree()
                );
                
                // 4. DB 저장 후 결과 반환
                return memberDAO.insertMember(signUpDTO);
            }
            return false; // 이미 가입된 아이디/이메일
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
    
    /**
     * 로그인 로직
     */
    public MemberVO login(LoginRequestDTO user) {
        try {
            // 1. 아이디로 회원 정보 조회
            MemberVO member = memberDAO.selectMemberById(user.id());
            
            // 2. 회원이 존재하고 비밀번호가 일치하는지 확인
            if (member != null) {
                // DB의 암호화된 비밀번호(mb_pw)와 입력한 비밀번호(user.pw) 비교
                if (encoder.matches(user.pw(), member.getMb_pw())) {
                    return member; // 로그인 성공
                }
            }
            return null; // 로그인 실패
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}
