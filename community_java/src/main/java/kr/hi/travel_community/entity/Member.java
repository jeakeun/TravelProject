package kr.hi.travel_community.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "member")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Member {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer mbNum;

    @Column(nullable = false, unique = true, length = 30)
    private String mbUid;

    @Column(name = "mb_nickname", nullable = false, length = 50)
    private String mbNickname;

    @Column(length = 255)
    private String mbPw;

    @Column(length = 50)
    private String mbEmail;

    @Column(nullable = false, length = 10)
    private String mbRol = "USER";

    @Column(nullable = false)
    private Integer mbScore = 0;

    @Column(length = 100)
    private String mbPhoto;

    @Column(nullable = false, length = 1)
    private String mbAgree = "N";
}