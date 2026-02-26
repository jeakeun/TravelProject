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
@ToString
public class Likes {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "li_num")
    private Integer liNum;

    @Column(name = "li_state", nullable = false)
    private Integer liState;

    // 추천 대상 글 번호 (po_num 등)
    @Column(name = "li_id", nullable = false)
    private Integer liId;

    // 추천 대상 게시판 종류 (FREE, REC 등)
    @Column(name = "li_name", nullable = false, length = 10)
    private String liName;

    @Column(name = "li_time", insertable = false, updatable = false)
    private LocalDateTime liTime;

    // 추천한 사용자 번호 (mb_num)
    @Column(name = "li_mb_num", nullable = false)
    private Integer liMbNum;

    /**
     * 저장 전 시간 설정 (DB Default가 있더라도 자바 단에서 처리하는 것이 안전함)
     */
    @PrePersist
    public void prePersist() {
        if (this.liTime == null) {
            this.liTime = LocalDateTime.now();
        }
    }
}