-- 기존 DB에 답변 컬럼이 없을 때 실행하세요. (DDL 전체 재실행 없이 컬럼만 추가)
-- 실행: mysql -u root -p travel < DB_migration_add_reply_columns.sql
-- 또는 MySQL Workbench에서 아래 구문 실행

USE travel;

-- 1:1 문의 관리자 답변 (컬럼이 있으면 "Duplicate column" 에러 무시)
ALTER TABLE inquiry_box ADD COLUMN ib_reply TEXT NULL;

-- 신고함 관리자 답변
ALTER TABLE report_box ADD COLUMN rb_reply TEXT NULL;

-- 신고 처리 상태 (N=대기, Y=처리완료, D=삭제, H=보류) - 기존 char(1)이면 수정 불필요
-- ALTER TABLE report_box MODIFY COLUMN rb_manage VARCHAR(2) DEFAULT 'N';
