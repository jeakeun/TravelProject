package kr.hi.travel_community.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "likes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Likes {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer liNum;

    @Column(nullable = false)
    private Integer liState;

    @Column(nullable = false)
    private Integer liId;

    @Column(nullable = false, length = 10)
    private String liName;

    private LocalDateTime liTime;

    @Column(nullable = false)
    private Integer liMbNum;
}