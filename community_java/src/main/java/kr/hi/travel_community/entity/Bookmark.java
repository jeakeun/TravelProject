package kr.hi.travel_community.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "bookmark")
@Data
public class Bookmark {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "bm_num")
    private Integer bmNum;

    @Column(name = "bm_po_num", nullable = false)
    private Integer bmPoNum;

    @Column(name = "bm_po_type", nullable = false, length = 20)
    private String bmPoType;

    @Column(name = "bm_mb_num", nullable = false)
    private Integer bmMbNum;
}
