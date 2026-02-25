package kr.hi.travel_community.model.dto;

/** DB member 테이블: mb_agree varchar(1) 에 맞게 agree는 "Y"/"N" */
public record MemberSignUpDTO(
	String id,
	String pw,
	String email,
	String agree,
	String nickname
) {}
