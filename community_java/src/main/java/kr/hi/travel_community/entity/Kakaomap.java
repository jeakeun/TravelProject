package kr.hi.travel_community.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "kakaomap")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class Kakaomap {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "km_num")
    private Integer kmNum;

    @Column(name = "km_name", length = 100, nullable = false)
    private String kmName;

    @Column(name = "km_lat", nullable = false)
    private Double kmLat;

    @Column(name = "km_lng", nullable = false)
    private Double kmLng;

    @Column(name = "km_address", length = 255)
    private String kmAddress;

    @Column(name = "km_category", length = 50)
    private String kmCategory;

    @Column(name = "km_api_id", length = 100)
    private String kmApiId;

}