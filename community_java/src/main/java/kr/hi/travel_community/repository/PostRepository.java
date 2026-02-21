package kr.hi.travel_community.repository;

import kr.hi.travel_community.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Integer> {

    // 🚩 [추가] 삭제되지 않은(poDel='N') 특정 카테고리(poCgNum)의 게시글 리스트 조회
    // 이 메서드를 사용하면 서비스 단의 filter 로직보다 훨씬 빠르고 정확합니다.
    List<Post> findByPoCgNumAndPoDelOrderByPoNumDesc(Integer poCgNum, String poDel);

    // 조회수 증가 메서드 (기존 유지)
    default void updateViewCount(Integer poNum) {
        findById(poNum).ifPresent(p -> {
            // null 방지 로직 추가
            int currentView = (p.getPoView() == null) ? 0 : p.getPoView();
            p.setPoView(currentView + 1);
            save(p);
        });
    }
}