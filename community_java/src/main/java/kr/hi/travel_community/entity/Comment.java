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

    private String coContent;
    private LocalDateTime coDate;
    private Integer coLike;
    private String coDel;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "po_num")
    private Post post;
}