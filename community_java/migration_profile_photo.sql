-- 기존 DB용 프로필 사진 컬럼 마이그레이션 (DB에만 저장, 프로젝트 파일 사용 안 함)
-- 이미 해당 컬럼이 있으면 에러 발생하므로, 없을 때만 실행하세요.

ALTER TABLE `member` ADD COLUMN `mb_photo_data` LONGBLOB NULL;
ALTER TABLE `member` ADD COLUMN `mb_photo_type` VARCHAR(30) NULL;
ALTER TABLE `member` ADD COLUMN `mb_photo_ver` INT NULL;
