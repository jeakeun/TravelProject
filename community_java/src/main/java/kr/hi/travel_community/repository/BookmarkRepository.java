package kr.hi.travel_community.repository;

import kr.hi.travel_community.entity.Bookmark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookmarkRepository extends JpaRepository<Bookmark, Integer> {

    List<Bookmark> findByBmMbNumOrderByBmNumDesc(Integer bmMbNum);

    Optional<Bookmark> findByBmMbNumAndBmPoNumAndBmPoType(Integer bmMbNum, Integer bmPoNum, String bmPoType);

    boolean existsByBmMbNumAndBmPoNumAndBmPoType(Integer bmMbNum, Integer bmPoNum, String bmPoType);
}
