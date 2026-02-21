package kr.hi.travel_community.repository;

import kr.hi.travel_community.entity.History;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HistoryRepository extends JpaRepository<History, Integer> {
    boolean existsByHtPoNumAndHtMeNum(Integer poNum, Integer meNum);
}