package kr.hi.travel_community.entity; // 🚩 패키지 경로를 반드시 명시해야 합니다.

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor; // 🚩 모든 필드 생성자 추가 (안정성용)

@Entity
@Table(name = "photo")
@Data
@NoArgsConstructor
@AllArgsConstructor // 🚩 롬복의 모든 필드 생성자 추가
public class Photo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ph_num")
    private Integer phNum;

    @Column(name = "ph_ori_name")
    private String phOriName;

    @Column(name = "ph_name")
    private String phName;

    @Column(name = "ph_po_num")
    private Integer phPoNum;

    // 🚩 RecommendController에서 사용하는 커스텀 생성자 유지
    public Photo(String phOriName, String phName, Integer phPoNum) {
        this.phOriName = phOriName;
        this.phName = phName;
        this.phPoNum = phPoNum;
    }
}