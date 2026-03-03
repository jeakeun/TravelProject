package kr.hi.travel_community.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter 
@Setter
@Table(name = "live_rank_region")
public class RankingEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "lr_id")
    private Long id;

    @Column(name = "area_nm")
    private String areaNm;

    @Column(name = "sigungu_code")
    private String sigunguCode;

    @Column(name = "v_count")
    private Long vCount; // 필드명: vCount

    @Column(name = "base_date")
    private String baseDate;
}