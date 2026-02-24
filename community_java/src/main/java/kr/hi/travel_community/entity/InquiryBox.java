package kr.hi.travel_community.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "inquiry_box")
@Data
public class InquiryBox {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ib_num")
    private Integer ibNum;

    @Column(name = "ib_title", nullable = false, length = 200)
    private String ibTitle;

    @Column(name = "ib_content", nullable = false, columnDefinition = "TEXT")
    private String ibContent;

    @Column(name = "ib_date")
    private LocalDateTime ibDate;

    @Column(name = "ib_status", nullable = false, length = 1)
    private String ibStatus = "N";

    @Column(name = "ib_mb_num", nullable = false)
    private Integer ibMbNum;
}
