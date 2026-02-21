package kr.hi.travel_community.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "comment")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Comment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer coNum;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String coContent;

    private LocalDateTime coDate;

    @Builder.Default
    private Integer coLike = 0;

    @Builder.Default
    private String coDel = "N";

    // 🚩 수정 포인트: 일반 댓글일 경우 DB 외래키 제약조건을 통과하기 위해 null 허용
    @Column(name = "co_ori_num")
    private Integer coOriNum;

    @ManyToOne
    @JoinColumn(name = "co_po_num")
    private Post post;

    @ManyToOne
    @JoinColumn(name = "co_mb_num")
    private Member member;
}