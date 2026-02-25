package kr.hi.travel_community.model.dto;

public record ResetPasswordRequestDTO(
    String id,
    String newPw
) {}