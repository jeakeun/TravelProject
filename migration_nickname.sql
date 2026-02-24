-- 기존 DB에 닉네임 컬럼 추가
-- (이미 mb_nickname이 있으면 1번째 문 실행 시 에러 나므로 건너뛰세요)
ALTER TABLE `member` ADD COLUMN `mb_nickname` varchar(30) NULL AFTER `mb_uid`;

-- 기존 회원의 닉네임이 NULL이면 아이디로 채우기
UPDATE `member` SET mb_nickname = mb_uid WHERE mb_nickname IS NULL OR mb_nickname = '';
