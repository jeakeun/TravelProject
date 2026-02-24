-- ※ 프로젝트 DDL.sql 신규 구축 시에는 DDL만 실행하세요.
-- 기존 DB에 ib_reply, rb_reply 컬럼이 없을 때 아래 실행
-- (이미 있으면 "Duplicate column name" 에러 발생 → 해당 줄만 건너뛰면 됨)
USE travel;
ALTER TABLE inquiry_box ADD COLUMN ib_reply TEXT NULL;
ALTER TABLE report_box ADD COLUMN rb_reply TEXT NULL;
