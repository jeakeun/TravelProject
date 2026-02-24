package kr.hi.travel_community.model.vo;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor  // MyBatis 객체 생성 시 필수
@AllArgsConstructor // 모든 필드 생성자
@Builder            // 객체 빌더 패턴
public class MemberVO {
    @JsonProperty("mb_num")
    private int mb_num;      // 회원 번호 (PK) - 마이페이지 내가 쓴 글 조회용
    private String mb_Uid;   // 회원 아이디
    private String mb_nickname; // 닉네임 (없으면 아이디 표시)
    private String mb_pw;    // 회원 비밀번호
    private String mb_email; // 회원 이메일
    private String mb_rol;   // 회원 권한
    private int mb_score;    // 회원 점수
    private String mb_photo; // 프로필 사진 경로
    private String mb_agree; // 동의 여부
}
