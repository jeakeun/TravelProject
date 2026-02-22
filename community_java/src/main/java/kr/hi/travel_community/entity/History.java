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
    private Integer htNum;

    private LocalDateTime htTime;

    @Column(nullable = false)
    private Integer htPoNum;

    @Column(nullable = false)
    private Integer htMeNum;
}