package kr.hi.travel_community.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
     * 회원가입 로직: 아이디, 비밀번호, 이메일 삽입 (비밀번호 확인은 프론트에서 검증)
     */
    public boolean signup(LoginDTO user) {
        try {
            // 1. 아이디 중복 확인
            if (memberDAO.selectMemberById(user.id()) != null) {
                return false;
            }
            // 2. 이메일 중복 확인
            if (memberDAO.selectMemberByEmail(user.email()) != null) {
                return false;
            }
            // 3. 비밀번호 암호화 후 DB 저장 (mb_agree varchar(1) -> "Y"/"N", mb_rol/mb_score 기본값)
            MemberSignUpDTO signUpDTO = new MemberSignUpDTO(
                user.id(),
                encoder.encode(user.pw()),
                user.email(),
                user.agree() ? "Y" : "N"
            );
            return memberDAO.insertMember(signUpDTO);
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

    // =========================================================
    // ✅ 여기부터 "추가" (기존 코드 최대한 유지)
    // =========================================================

    /**
     * ✅ 비밀번호 찾기: 아이디 + 이메일이 둘 다 일치하는 회원이 있는지 확인
     */
    public boolean verifyUserForReset(String id, String email) {
        try {
            if (id == null || id.trim().isEmpty()) return false;
            if (email == null || email.trim().isEmpty()) return false;

            MemberVO member = memberDAO.selectMemberByIdAndEmail(id.trim(), email.trim());
            return member != null;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * ✅ 비밀번호 변경: 새 비밀번호를 BCrypt로 암호화해서 업데이트 (비밀번호 찾기용)
     */
    public boolean resetPassword(String id, String newPw) {
        try {
            if (id == null || id.trim().isEmpty()) return false;
            if (newPw == null || newPw.trim().isEmpty()) return false;

            String encodedPw = encoder.encode(newPw.trim());
            int updated = memberDAO.updatePasswordById(id.trim(), encodedPw);
            return updated > 0;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * ✅ 로그인 사용자 비밀번호 변경: 현재 비밀번호 확인 후 새 비밀번호로 변경
     */
    public boolean changePassword(String id, String currentPw, String newPw) {
        try {
            if (id == null || id.trim().isEmpty()) return false;
            if (currentPw == null || currentPw.trim().isEmpty()) return false;
            if (newPw == null || newPw.trim().isEmpty()) return false;

            MemberVO member = memberDAO.selectMemberById(id.trim());
            if (member == null) return false;
            if (!encoder.matches(currentPw.trim(), member.getMb_pw())) return false;

            String encodedPw = encoder.encode(newPw.trim());
            int updated = memberDAO.updatePasswordById(id.trim(), encodedPw);
            return updated > 0;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * ✅ 이메일 변경: 로그인 사용자 본인만 가능. 새 이메일 중복 시 실패.
     */
    @Transactional
    public boolean updateEmail(String id, String newEmail) {
        try {
            if (id == null || id.trim().isEmpty()) return false;
            if (newEmail == null || newEmail.trim().isEmpty()) return false;

            MemberVO member = memberDAO.selectMemberById(id.trim());
            if (member == null) return false;

            String emailTrim = newEmail.trim();
            // 다른 회원이 이미 사용 중인 이메일이면 실패
            MemberVO existing = memberDAO.selectMemberByEmail(emailTrim);
            if (existing != null && !existing.getMb_Uid().equals(id.trim())) {
                return false;
            }
            // 동일 이메일이면 성공 처리(변경 없음)
            if (emailTrim.equals(member.getMb_email())) return true;

            int updated = memberDAO.updateEmailById(id.trim(), emailTrim);
            return updated > 0;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * ✅ 회원 탈퇴: 비밀번호 확인 후 계정 삭제
     */
    @Transactional
    public boolean withdraw(String id, String password) {
        try {
            if (id == null || id.trim().isEmpty()) return false;
            if (password == null || password.trim().isEmpty()) return false;

            MemberVO member = memberDAO.selectMemberById(id.trim());
            if (member == null) return false;
            if (!encoder.matches(password.trim(), member.getMb_pw())) return false;

            int deleted = memberDAO.deleteMemberById(id.trim());
            return deleted > 0;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}