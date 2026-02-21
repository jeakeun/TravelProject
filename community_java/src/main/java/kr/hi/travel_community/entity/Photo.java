package kr.hi.travel_community.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "photo")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Photo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer phNum;

    private String phOriginName;
    private String phName;
    private Integer phPoNum;

    public Photo(String phOriginName, String phName, Integer phPoNum) {
        this.phOriginName = phOriginName;
        this.phName = phName;
        this.phPoNum = phPoNum;
    }
}