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
    @Column(name = "co_num")
    private Integer coNum;

    @Column(name = "co_content", columnDefinition = "TEXT", nullable = false)
    private String coContent;

    @CreationTimestamp
    @Column(name = "co_date", updatable = false)
    private LocalDateTime coDate;

    @Builder.Default
    @Column(name = "co_like")
    private Integer coLike = 0;

    @Builder.Default
    @Column(name = "co_del", length = 1)
    private String coDel = "N";

    /**
     * 대댓글 기능을 위한 원댓글 번호 (부모 댓글 ID)
     */
    @Column(name = "co_ori_num")
    private Integer coOriNum;

    /**
     * 게시글 번호 (RecommendPost 등의 ID)
     */
    @Column(name = "co_po_num", nullable = false)
    private Integer coPoNum;

    /**
     * 게시글 타입 (RECOMMEND, FREE 등)
     */
    @Column(name = "co_po_type", nullable = false)
    private String coPoType; 

    /**
     * 작성자 회원 번호 (Integer 필드 유지)
     */
    @Column(name = "co_mb_num", nullable = false)
    private Integer coMbNum;

}