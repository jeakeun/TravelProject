package kr.hi.travel_community.service;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

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

    @Autowired
    private KakaoAuthService kakaoAuthService;

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
                user.agree() ? "Y" : "N",
                user.id()
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
     * 카카오 로그인 사용자는 비밀번호 변경 불가
     */
    public boolean changePassword(String id, String currentPw, String newPw) {
        try {
            if (id == null || id.trim().isEmpty()) return false;
            if (currentPw == null || currentPw.trim().isEmpty()) return false;
            if (newPw == null || newPw.trim().isEmpty()) return false;

            MemberVO member = memberDAO.selectMemberById(id.trim());
            if (member == null) return false;
            if ("kakao".equalsIgnoreCase(member.getMb_provider())) return false;
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
     * ✅ 닉네임 변경: 로그인 사용자 본인만 가능. 2~15자, 특수문자 제한.
     */
    @Transactional
    public boolean updateNickname(String id, String newNickname) {
        try {
            if (id == null || id.trim().isEmpty()) return false;
            if (newNickname == null || newNickname.trim().isEmpty()) return false;

            MemberVO member = memberDAO.selectMemberById(id.trim());
            if (member == null) return false;

            String nick = newNickname.trim();
            if (nick.length() < 2 || nick.length() > 15) return false;
            if (!nick.matches("^[가-힣a-zA-Z0-9_]+$")) return false;

            int updated = memberDAO.updateNicknameById(id.trim(), nick);
            return updated > 0;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * ✅ 이메일 변경: 로그인 사용자 본인만 가능. 새 이메일 중복 시 실패.
     * 카카오 로그인 사용자는 이메일 수정 불가 (카카오 API 데이터 보호)
     */
    @Transactional
    public boolean updateEmail(String id, String newEmail) {
        try {
            if (id == null || id.trim().isEmpty()) return false;
            if (newEmail == null || newEmail.trim().isEmpty()) return false;

            MemberVO member = memberDAO.selectMemberById(id.trim());
            if (member == null) return false;
            if ("kakao".equalsIgnoreCase(member.getMb_provider())) return false;

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
     * ✅ 프로필 사진 변경: DB BLOB에 직접 저장 (프로젝트 파일 사용 안 함)
     */
    @Transactional
    public Integer updatePhoto(String id, MultipartFile file) {
        try {
            if (id == null || id.trim().isEmpty()) return null;
            if (file == null || file.isEmpty()) return null;

            byte[] photoData = file.getBytes();
            String photoType = file.getContentType();
            if (photoType == null || !photoType.startsWith("image/")) return null;

            int photoVer = (int) (System.currentTimeMillis() / 1000);
            int updated = memberDAO.updatePhotoBlobById(id.trim(), photoData, photoType, photoVer);
            return updated > 0 ? photoVer : null;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * ✅ 프로필 사진 조회 (DB BLOB → 바이트 배열)
     */
    public byte[] getPhotoData(String id) {
        try {
            if (id == null || id.trim().isEmpty()) return null;
            var row = memberDAO.selectPhotoByMemberId(id.trim());
            if (row == null) return null;
            Object data = row.get("photoData");
            if (data == null) data = row.get("photodata");
            return data instanceof byte[] ? (byte[]) data : null;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    public String getPhotoContentType(String id) {
        try {
            if (id == null || id.trim().isEmpty()) return null;
            var row = memberDAO.selectPhotoByMemberId(id.trim());
            if (row == null) return null;
            Object t = row.get("photoType");
            if (t == null) t = row.get("phototype");
            return t != null ? t.toString() : "image/jpeg";
        } catch (Exception e) {
            return "image/jpeg";
        }
    }

    /**
     * ✅ 회원 탈퇴: 비밀번호 확인 후 계정 삭제.
     * 카카오 로그인 사용자는 비밀번호 없이 확인만으로 탈퇴 가능.
     */
    @Transactional
    public boolean withdraw(String id, String password) {
        try {
            if (id == null || id.trim().isEmpty()) return false;

            MemberVO member = memberDAO.selectMemberById(id.trim());
            if (member == null) return false;

            if ("kakao".equalsIgnoreCase(member.getMb_provider())) {
                // 카카오 회원: 비밀번호 검증 없이 탈퇴
                int deleted = memberDAO.deleteMemberById(id.trim());
                return deleted > 0;
            }

            if (password == null || password.trim().isEmpty()) return false;
            if (!encoder.matches(password.trim(), member.getMb_pw())) return false;

            int deleted = memberDAO.deleteMemberById(id.trim());
            return deleted > 0;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * 카카오 인증 코드로 로그인 또는 자동 회원가입
     * @return 로그인된 회원 정보 (없으면 null)
     */
    @Transactional
    public MemberVO kakaoLoginOrSignup(String code) {
        try {
            if (code == null || code.trim().isEmpty()) return null;
            String accessToken = kakaoAuthService.exchangeCodeForToken(code.trim());
            Map<String, Object> kakaoUser = kakaoAuthService.getUserInfo(accessToken);

            long kakaoId = ((Number) kakaoUser.get("id")).longValue();
            String nickname = (String) kakaoUser.get("nickname");
            String email = (String) kakaoUser.get("email");

            String kakaoUid = "kakao_" + kakaoId;
            MemberVO existing = memberDAO.selectMemberByKakaoId(kakaoUid);
            if (existing != null) {
                existing.setMb_pw(null);
                return existing;
            }

            // 신규 가입: placeholder 비밀번호 (사용 안 함)
            // [카카오 로그인] 신규 가입 (탈퇴 후 재가입 가능): 비밀번호 미사용이므로 placeholder BCrypt 저장
            String placeholderPw = encoder.encode(java.util.UUID.randomUUID().toString());
            boolean inserted = memberDAO.insertMemberKakao(kakaoUid, nickname, placeholderPw, email);
            if (!inserted) return null;

            MemberVO created = memberDAO.selectMemberByKakaoId(kakaoUid);
            if (created != null) created.setMb_pw(null);
            return created;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}