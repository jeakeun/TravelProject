package kr.hi.travel_community.model.dto;

public record VerifyUserRequestDTO(
    String id,
    String email
) {}