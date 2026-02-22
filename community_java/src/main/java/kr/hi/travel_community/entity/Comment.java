package kr.hi.travel_community.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
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

    @CreationTimestamp
    private LocalDateTime coDate;

    @Builder.Default
    private Integer coLike = 0;

    @Builder.Default
    private String coDel = "N";

    @Column(name = "co_ori_num")
    private Integer coOriNum;

    // 🚩 [수정] Post 엔티티 대신 게시글 번호와 타입을 저장합니다.
    @Column(name = "co_po_num", nullable = false)
    private Integer coPoNum;

    @Column(name = "co_po_type", nullable = false)
    private String coPoType; // "RECOMMEND", "FREE", "REVIEW" 등

    @Column(name = "co_mb_num", nullable = false)
    private Integer coMbNum;
    
    // Member 엔티티와 관계가 유지되어야 한다면 아래 주석을 해제하고 위 coMbNum을 지우세요.
    // @ManyToOne
    // @JoinColumn(name = "co_mb_num")
    // private Member member;
}