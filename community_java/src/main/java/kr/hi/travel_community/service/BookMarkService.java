package kr.hi.travel_community.service;

import kr.hi.travel_community.entity.BookMark; // M 대문자 확인
import kr.hi.travel_community.repository.BookMarkRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class BookMarkService {

    @Autowired
    private BookMarkRepository bookMarkRepository;

    /**
     * 🚩 즐겨찾기 토글 로직
     * DB를 조회하여 데이터가 있으면 삭제, 없으면 삽입합니다.
     * @return true(추가됨), false(삭제됨)
     */
    @Transactional
    public boolean toggleBookMark(BookMark bookMark) {
        // 1. 해당 유저가 해당 게시판의 특정 게시글을 이미 즐겨찾기 했는지 확인
        Optional<BookMark> existingBookMark = bookMarkRepository.findByBmMbNumAndBmPoNumAndBmPoType(
                bookMark.getBmMbNum(),
                bookMark.getBmPoNum(),
                bookMark.getBmPoType()
        );

        if (existingBookMark.isPresent()) {
            // 2. 이미 존재한다면 삭제 (즐겨찾기 취소)
            bookMarkRepository.delete(existingBookMark.get());
            return false;
        } else {
            // 3. 존재하지 않는다면 새롭게 저장 (즐겨찾기 등록)
            bookMarkRepository.save(bookMark);
            return true;
        }
    }

    /**
     * 🚩 마이페이지용 즐겨찾기 목록 조회
     * 특정 회원 번호(mb_num)에 해당하는 모든 즐겨찾기 내역을 가져옵니다.
     */
    @Transactional(readOnly = true)
    public List<BookMark> getMyBookMarks(Integer mbNum) {
        // Repository에서 최신순 정렬 메서드를 사용하는 것을 추천합니다.
        return bookMarkRepository.findByBmMbNumOrderByBmNumDesc(mbNum);
    }
}