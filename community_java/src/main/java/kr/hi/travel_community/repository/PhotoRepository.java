package kr.hi.travel_community.repository;

import kr.hi.travel_community.entity.Photo;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PhotoRepository extends JpaRepository<Photo, Integer> {
    Optional<Photo> findFirstByPhPoNumOrderByPhNumDesc(Integer poNum);
}