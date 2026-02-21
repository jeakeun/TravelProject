package kr.hi.travel_community.repository;

import kr.hi.travel_community.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RecommendRepository extends JpaRepository<Post, Integer> {

    // 🚩 상세 페이지 조회 시: 삭제되지 않은 글만 가져오기
    Optional<Post> findByPoNumAndPoDel(Integer poNum, String poDel);

    // 🚩 리스트 조회 시: 특정 카테고리의 삭제되지 않은 글만 최신순으로 가져오기
    List<Post> findByPoCgNumAndPoDelOrderByPoNumDesc(Integer poCgNum, String poDel);

    // 🚩 조회수 증가 (기존의 default 메서드 방식 유지)
    default void updateViewCount(Integer poNum) {
        findByPoNumAndPoDel(poNum, "N").ifPresent(p -> {
            int currentView = (p.getPoView() == null) ? 0 : p.getPoView();
            p.setPoView(currentView + 1);
            save(p);
        });
    }
}