package kr.hi.travel_community.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class History {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ht_num") // DB의 ht_num과 매핑
    private Integer htNum;

    @Column(name = "ht_time", insertable = false, updatable = false) // DB의 ht_time과 매핑
    private LocalDateTime htTime;

    @Column(name = "ht_po_num", nullable = false) // DB의 ht_po_num과 매핑
    private Integer htPoNum;

    @Column(name = "ht_po_type", nullable = false) // DB 테이블에 존재하므로 추가 필요
    private String htPoType;

    @Column(name = "ht_me_num", nullable = false) // DB의 ht_me_num과 매핑
    private Integer htMeNum;
}