package kr.hi.travel_community.repository;

import kr.hi.travel_community.entity.Photo;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface PhotoRepository extends JpaRepository<Photo, Integer> {

    // 🚩 1. 다중 이미지 조회를 위해 추가된 메서드 (이클립스 빨간 줄 해결)
    // 게시글 번호(phPoNum)에 해당하는 모든 사진을 사진 번호 역순으로 리스트 형태로 가져옵니다.
    List<Photo> findByPhPoNumOrderByPhNumDesc(Integer phPoNum);

    // 🚩 2. 기존 기능 유지: 게시글 번호(phPoNum)로 최신 사진 1장을 찾는 메서드
    Optional<Photo> findFirstByPhPoNumOrderByPhNumDesc(Integer phPoNum);
}