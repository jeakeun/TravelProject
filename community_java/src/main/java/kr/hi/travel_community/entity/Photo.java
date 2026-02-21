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

    private String phOriName;
    private String phName;
    private Integer phPoNum;

    public Photo(String phOriName, String phName, Integer phPoNum) {
        this.phOriName = phOriName;
        this.phName = phName;
        this.phPoNum = phPoNum;
    }
}