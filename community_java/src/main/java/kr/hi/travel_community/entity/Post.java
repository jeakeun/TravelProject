package kr.hi.travel_community.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "post")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer poNum;

    private String poTitle;
    private String poContent;
    private Integer poCgNum; // 카테고리
    private Integer poMbNum; // 작성자
    private Integer poView;
    private String poDel;
    private LocalDateTime poDate;
}