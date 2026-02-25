package kr.hi.travel_community.model.dto;

public record LoginRequestDTO(
	    String id,
	    String pw,
	    Boolean rememberMe   // <- Boolean 추천 (null 방어 가능)
	) {}