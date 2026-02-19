package kr.hi.travel_community.model.dto;

public record LoginDTO(
	String id,
	String pw,
	String email,
	boolean agree
) {}
