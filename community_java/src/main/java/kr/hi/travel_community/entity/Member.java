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
@ToString // 일반적인 ToString 사용 (순환 참조 방지 필요 시 exclude 추가 가능)
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "mb_num") // DB 컬럼명 명시
    private Integer mbNum;

    @Column(name = "mb_uid", nullable = false, unique = true, length = 30)
    private String mbUid;

    @Column(name = "mb_nickname", nullable = false, length = 50)
    private String mbNickname;

    @Column(name = "mb_pw", length = 255)
    private String mbPw;

    @Column(name = "mb_email", length = 50)
    private String mbEmail;

    @Builder.Default
    @Column(name = "mb_rol", nullable = false, length = 10)
    private String mbRol = "USER";

    @Builder.Default
    @Column(name = "mb_score", nullable = false)
    private Integer mbScore = 0;

    @Column(name = "mb_photo", length = 100)
    private String mbPhoto;

    @Builder.Default
    @Column(name = "mb_agree", nullable = false, length = 1)
    private String mbAgree = "N";
}