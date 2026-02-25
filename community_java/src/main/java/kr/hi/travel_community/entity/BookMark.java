package kr.hi.travel_community.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Entity
@Table(name = "bookmark")
@Getter 
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookMark {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "bm_num")
    private Integer bmNum;

    // 즐겨찾기한 게시글의 번호
    @Column(name = "bm_po_num", nullable = false)
    private Integer bmPoNum;

    // 게시판 종류 (예: recommend, review, free 등)
    @Column(name = "bm_po_type", nullable = false, length = 20)
    private String bmPoType;

    // 즐겨찾기를 등록한 회원 번호 (member 테이블의 mb_num 참조)
    @Column(name = "bm_mb_num", nullable = false)
    private Integer bmMbNum;

}