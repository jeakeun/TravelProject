package kr.hi.travel_community.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import kr.hi.travel_community.dao.MemberDAO;
import kr.hi.travel_community.model.dto.MemberSignUpDTO;
import kr.hi.travel_community.model.vo.MemberVO;

/**
 * 앱 기동 시 초기 계정(123/123, 456/456)을 보장.
 * 로그인: 아이디 123 / 비밀번호 123 (관리자), 아이디 456 / 비밀번호 456 (일반회원)
 */
@Component
@Order(1)
public class InitialDataLoader implements ApplicationRunner {

    @Autowired
    private MemberDAO memberDAO;

    @Autowired
    private BCryptPasswordEncoder encoder;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        ensureTestAccount("123", "123", "admin@test.com", "admin", "ADMIN");
        ensureTestAccount("456", "456", "user@test.com", "user", "USER");
    }

    private void ensureTestAccount(String id, String plainPw, String email, String nickname, String role) {
        try {
            MemberVO member = memberDAO.selectMemberById(id);
            if (member == null) {
                memberDAO.insertMember(new MemberSignUpDTO(
                    id, encoder.encode(plainPw), email, "Y", nickname
                ));
                if ("ADMIN".equals(role)) {
                    memberDAO.updateRoleById(id, role);
                }
                return;
            }
            String currentPw = member.getMb_pw();
            if (currentPw != null && !currentPw.isEmpty()
                    && (currentPw.startsWith("$2a$") || currentPw.startsWith("$2b$"))
                    && encoder.matches(plainPw, currentPw)) {
                return;
            }
            memberDAO.updatePasswordById(id, encoder.encode(plainPw));
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
