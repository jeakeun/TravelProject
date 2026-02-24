package kr.hi.travel_community.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "newsletter_post")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NewsLetter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "po_num")
    private Integer poNum;

    @Column(name = "po_title", nullable = false)
    private String poTitle;

    @Column(name = "po_content", nullable = false, columnDefinition = "LONGTEXT")
    private String poContent;

    @Column(name = "po_img")
    private String poImg;

    @Column(name = "po_date")
    private LocalDateTime poDate;

    @Column(name = "po_view")
    private Integer poView;

    @Column(name = "po_up")
    private Integer poUp;

    @Column(name = "po_down")
    private Integer poDown;

    @Column(name = "po_report")
    private Integer poReport;

    @Column(name = "po_del")
    private String poDel;

    @Column(name = "po_mb_num")
    private Integer poMbNum;
}