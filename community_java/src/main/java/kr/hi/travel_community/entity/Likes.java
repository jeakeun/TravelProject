package kr.hi.travel_community.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "likes")
@Data
public class Likes {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "li_num")
    private Integer liNum;

    @Column(name = "li_state")
    private Integer liState;

    @Column(name = "li_id")
    private Integer liId;

    @Column(name = "li_name")
    private String liName;

    @Column(name = "li_time")
    private LocalDateTime liTime = LocalDateTime.now();

    @Column(name = "li_mb_num")
    private Integer liMbNum;
}