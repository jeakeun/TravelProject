package kr.hi.travel_community.dao;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param; // 🚩 추가
import kr.hi.travel_community.model.dto.LoginDTO;
import kr.hi.travel_community.model.dto.MemberSignUpDTO;
import kr.hi.travel_community.model.vo.MemberVO;

@Mapper
public interface MemberDAO {
	
	/**
	 * 아이디와 이메일로 회원정보 조회 (중복 가입 확인용)
	 * Mapper XML의 #{id}, #{email}과 매칭됩니다.
	 */
	MemberVO selectMember(LoginDTO user);

	/**
	 * 아이디로 회원정보 조회 (로그인 인증용)
	 * 🚩 @Param을 사용하여 Mapper XML의 #{id}와 명확하게 연결합니다.
	 */
	MemberVO selectMemberById(@Param("id") String id);

	/**
	 * 이메일로 회원정보 조회 (회원가입 이메일 중복 확인용)
	 */
	MemberVO selectMemberByEmail(@Param("email") String email);

	/**
	 * 새로운 회원정보 저장 (회원가입 완료)
	 * Mapper XML의 #{id}, #{pw}, #{email}, #{agree}와 매칭됩니다.
	 */
	boolean insertMember(MemberSignUpDTO member);

	// ✅ 아이디 + 이메일로 일치 회원 찾기 (비밀번호 찾기 검증용)
    MemberVO selectMemberByIdAndEmail(@Param("id") String id, @Param("email") String email);

    // ✅ 비밀번호 변경
    int updatePasswordById(@Param("id") String id, @Param("pw") String pw);

    // ✅ 이메일 변경
    int updateEmailById(@Param("id") String id, @Param("email") String email);

    // ✅ 회원 탈퇴
    int deleteMemberById(@Param("id") String id);
}
