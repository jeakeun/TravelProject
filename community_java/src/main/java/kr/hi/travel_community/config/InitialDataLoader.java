package kr.hi.travel_community.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import kr.hi.travel_community.dao.MemberDAO;
import kr.hi.travel_community.model.vo.MemberVO;

/**
 * 앱 기동 시 초기 계정(admin: 123/123, user: 456/456)의 비밀번호를 BCrypt로 갱신.
 * DDL INSERT는 평문으로 넣으므로, 실제 로그인 가능하도록 기동 시 한 번 갱신.
 */
@Component
public class InitialDataLoader implements ApplicationRunner {

    @Autowired
    private MemberDAO memberDAO;

    @Autowired
    private BCryptPasswordEncoder encoder;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        // admin: id=123, pw=123
        ensureBcryptPassword("123", "123");
        // user: id=456, pw=456
        ensureBcryptPassword("456", "456");
    }

    private void ensureBcryptPassword(String id, String plainPw) {
        try {
            MemberVO member = memberDAO.selectMemberById(id);
            if (member == null) return;
            String currentPw = member.getMb_pw();
            if (currentPw == null || currentPw.isEmpty()) return;
            // 이미 BCrypt 형식이면 스킵
            if (currentPw.startsWith("$2a$") || currentPw.startsWith("$2b$")) return;
            // 평문이면 BCrypt로 갱신
            memberDAO.updatePasswordById(id, encoder.encode(plainPw));
        } catch (Exception e) {
            // 기동 실패 방지
            e.printStackTrace();
        }
    }
}
