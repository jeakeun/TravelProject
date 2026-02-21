package kr.hi.travel_community.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "report_box")
@Data
public class ReportBox {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "rb_num")
    private Integer rbNum;

    @Column(name = "rb_content")
    private String rbContent;

    @Column(name = "rb_manage")
    private String rbManage;

    @Column(name = "rb_id")
    private Integer rbId;

    @Column(name = "rb_name")
    private String rbName;

    @Column(name = "rb_mb_num")
    private Integer rbMbNum;
}