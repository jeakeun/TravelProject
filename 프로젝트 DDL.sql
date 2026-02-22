DROP DATABASE IF EXISTS travel;
CREATE DATABASE travel;
USE travel;

-- ==========================================
-- 1. 회원 테이블
-- ==========================================
DROP TABLE IF EXISTS `member`;
CREATE TABLE `member` (
    `mb_num`    int PRIMARY KEY AUTO_INCREMENT,
    `mb_Uid`    varchar(30)    unique NOT NULL,
    `mb_pw`     varchar(255)   NULL,
    `mb_email`  varchar(50)    NULL,
    `mb_rol`    varchar(10)    default "USER" NOT NULL,
    `mb_score`  int    NOT NULL DEFAULT 0,
    `mb_photo`  varchar(100) NULL,
    `mb_agree`  char(1)    NOT NULL DEFAULT "N"
);

-- ==========================================
-- 2. 게시판 테이블
-- ==========================================
DROP TABLE IF EXISTS `board`;
CREATE TABLE `board` (
    `bo_num`    int PRIMARY KEY AUTO_INCREMENT,
    `bo_name`    varchar(100) unique NOT NULL
);

-- ==========================================
-- 3. 카테고리 테이블
-- ==========================================
DROP TABLE IF EXISTS `category`;
CREATE TABLE `category` (
    `cg_num`    int PRIMARY KEY AUTO_INCREMENT,
    `cg_kind`    varchar(10) unique NOT NULL,
    `cg_display`    char(1) NOT    NULL,
    `cg_bo_num` int    NOT NULL,
    FOREIGN KEY (`cg_bo_num`) REFERENCES `board` (`bo_num`) ON DELETE CASCADE
);

-- ==========================================
-- 4-1. 여행 추천 게시판 (Recommend)
-- [수정] po_img 컬럼 추가 (리스트 썸네일용)
-- ==========================================
DROP TABLE IF EXISTS `recommend_post`;
CREATE TABLE `recommend_post` (
    `po_num`    int PRIMARY KEY AUTO_INCREMENT,
    `po_title`  varchar(100) NOT NULL,
    `po_content`    longtext NOT NULL,
    `po_img`    varchar(100) NULL, -- 리스트 출력용 대표 이미지 파일명
    `po_date`    datetime default current_timestamp not    NULL,
    `po_view`    int    NOT NULL DEFAULT 0,
    `po_up`      int    NOT NULL DEFAULT 0,
    `po_down`    int    NOT NULL DEFAULT 0,
    `po_report` int    NOT NULL DEFAULT 0,
    `po_del`    char(1)    NOT NULL DEFAULT "N",
    `po_mb_num` int    NOT NULL,
    FOREIGN KEY (`po_mb_num`) REFERENCES `member` (`mb_num`)
);

DROP TABLE IF EXISTS `recommend_photo`;
CREATE TABLE `recommend_photo` (
    `ph_num`    int PRIMARY KEY AUTO_INCREMENT,
    `ph_ori_name`    varchar(100) NOT NULL,
    `ph_name`    varchar(100) NOT NULL,
    `ph_po_num` int    NOT NULL,
    FOREIGN KEY (`ph_po_num`) REFERENCES `recommend_post` (`po_num`) ON DELETE CASCADE
);

-- ==========================================
-- 4-2. 여행 후기 게시판 (ReviewBoard)
-- [수정] po_img 컬럼 추가 (리스트 썸네일용)
-- ==========================================
DROP TABLE IF EXISTS `review_post`;
CREATE TABLE `review_post` (
    `po_num`    int PRIMARY KEY AUTO_INCREMENT,
    `po_title`  varchar(100) NOT NULL,
    `po_content`    longtext NOT NULL,
    `po_img`    varchar(100) NULL, -- 리스트 출력용 대표 이미지 파일명
    `po_date`    datetime default current_timestamp not    NULL,
    `po_view`    int    NOT NULL DEFAULT 0,
    `po_up`      int    NOT NULL DEFAULT 0,
    `po_down`    int    NOT NULL DEFAULT 0,
    `po_report` int    NOT NULL DEFAULT 0,
    `po_del`    char(1)    NOT NULL DEFAULT "N",
    `po_mb_num` int    NOT NULL,
    FOREIGN KEY (`po_mb_num`) REFERENCES `member` (`mb_num`)
);

DROP TABLE IF EXISTS `review_photo`;
CREATE TABLE `review_photo` (
    `ph_num`    int PRIMARY KEY AUTO_INCREMENT,
    `ph_ori_name`    varchar(100) NOT NULL,
    `ph_name`    varchar(100) NOT NULL,
    `ph_po_num` int    NOT NULL,
    FOREIGN KEY (`ph_po_num`) REFERENCES `review_post` (`po_num`) ON DELETE CASCADE
);

-- ==========================================
-- 4-3. 자유 게시판 (FreeBoard)
-- ==========================================
DROP TABLE IF EXISTS `free_post`;
CREATE TABLE `free_post` (
    `po_num`    int PRIMARY KEY AUTO_INCREMENT,
    `po_title`  varchar(100) NOT NULL,
    `po_content`    longtext NOT NULL,
    `po_date`    datetime default current_timestamp not    NULL,
    `po_view`    int    NOT NULL DEFAULT 0,
    `po_up`      int    NOT NULL DEFAULT 0,
    `po_down`    int    NOT NULL DEFAULT 0,
    `po_report` int    NOT NULL DEFAULT 0,
    `po_del`    char(1)    NOT NULL DEFAULT "N",
    `po_mb_num` int    NOT NULL,
    FOREIGN KEY (`po_mb_num`) REFERENCES `member` (`mb_num`)
);

DROP TABLE IF EXISTS `free_photo`;
CREATE TABLE `free_photo` (
    `ph_num`    int PRIMARY KEY AUTO_INCREMENT,
    `ph_ori_name`    varchar(100) NOT NULL,
    `ph_name`    varchar(100) NOT NULL,
    `ph_po_num` int    NOT NULL,
    FOREIGN KEY (`ph_po_num`) REFERENCES `free_post` (`po_num`) ON DELETE CASCADE
);

-- ==========================================
-- 5. 댓글 테이블 (기존 유지)
-- ==========================================
DROP TABLE IF EXISTS `comment`;
CREATE TABLE `comment` (
    `co_num`    int PRIMARY KEY AUTO_INCREMENT,
    `co_content`    text NOT NULL,
    `co_date`    datetime default current_timestamp not    NULL,
    `co_like`    int    NOT NULL DEFAULT 0,
    `co_del`     char(1)    NOT NULL DEFAULT "N",
    `co_ori_num`    int    NULL, 
    `co_po_num` int    NOT NULL, 
    `co_po_type` varchar(20) NOT NULL, 
    `co_mb_num` int    NOT NULL,
    FOREIGN KEY (`co_ori_num`) REFERENCES `comment` (`co_num`) ON DELETE CASCADE,
    FOREIGN KEY (`co_mb_num`) REFERENCES `member` (`mb_num`)
);

-- ==========================================
-- 6. 보조 및 연관 테이블 (기존 유지)
-- ==========================================
DROP TABLE IF EXISTS `live_rank`;
CREATE TABLE `live_rank` (
    `lr_num`    int PRIMARY KEY AUTO_INCREMENT,
    `lr_time`    datetime default current_timestamp not    NULL,
    `lr_ori_num` int NOT NULL,
    `lr_po_num` int    NOT NULL,
    `lr_po_type` varchar(20) NOT NULL
);

DROP TABLE IF EXISTS `history`;
CREATE TABLE `history` (
    `ht_num`    int PRIMARY KEY AUTO_INCREMENT,
    `ht_time`    datetime default current_timestamp not    NULL,
    `ht_po_num` int    NOT NULL,
    `ht_po_type` varchar(20) NOT NULL,
    `ht_me_num` int    NOT NULL,
    FOREIGN KEY (`ht_me_num`) REFERENCES `member` (`mb_num`)
);

DROP TABLE IF EXISTS `report_box`;
CREATE TABLE `report_box` (
    `rb_num`    int PRIMARY KEY AUTO_INCREMENT,
    `rb_content`    text NOT NULL,
    `rb_manage` char(1)    NULL,
    `rb_id` int    NOT NULL,
    `rb_name`    varchar(10)    NOT NULL,
    `rb_mb_num` int    NOT NULL,
    FOREIGN KEY (`rb_mb_num`) REFERENCES `member` (`mb_num`)
);

DROP TABLE IF EXISTS `travel`;
CREATE TABLE `travel` (
    `tv_num`    int PRIMARY KEY AUTO_INCREMENT,
    `tv_API`    varchar(100) NOT NULL,
    `tv_lat`    DOUBLE NULL,
    `tv_lng`    DOUBLE NULL,
    `tv_geo_status` ENUM("NO_COORD", "READY") DEFAULT "NO_COORD",
    `tv_mapAPI` varchar(100) NOT NULL,
    `tv_cg_num` int    NOT NULL,
    FOREIGN KEY (`tv_cg_num`) REFERENCES `category` (`cg_num`)
);

DROP TABLE IF EXISTS `kind`;
CREATE TABLE `kind` (
    `ki_num`    int PRIMARY KEY AUTO_INCREMENT,
    `ki_name`    varchar(10) unique NOT NULL
);

DROP TABLE IF EXISTS `bookmark`;
CREATE TABLE `bookmark` (
    `bm_num`    int PRIMARY KEY AUTO_INCREMENT,
    `bm_po_num` int    NOT NULL,
    `bm_po_type` varchar(20) NOT NULL,
    `bm_mb_num` int    NOT NULL,
    FOREIGN KEY (`bm_mb_num`) REFERENCES `member` (`mb_num`)
);

DROP TABLE IF EXISTS `main_photo`;
CREATE TABLE `main_photo` (
    `mp_num`    int PRIMARY KEY AUTO_INCREMENT,
    `mp_name`    varchar(100) NOT NULL,
    `mp_tv_num` int    NOT NULL,
    FOREIGN KEY (`mp_tv_num`) REFERENCES `travel` (`tv_num`)
);

DROP TABLE IF EXISTS `mark`;
CREATE TABLE `mark` (
    `ma_num`    int PRIMARY KEY AUTO_INCREMENT,
    `ma_score`  int    NOT NULL DEFAULT 0,
    `ma_ki_num` int    NOT NULL,
    `ma_po_num` int    NOT NULL,
    `ma_po_type` varchar(20) NOT NULL,
    FOREIGN KEY (`ma_ki_num`) REFERENCES `kind` (`ki_num`) ON DELETE CASCADE
);

DROP TABLE IF EXISTS `review`;
CREATE TABLE `review` (
    `rv_num`    int PRIMARY KEY AUTO_INCREMENT,
    `rv_content`    text NOT NULL,
    `rv_up` int    NOT NULL DEFAULT 0,
    `rv_down`    int    NOT NULL DEFAULT 0,
    `rv_del`    char(1) NOT    NULL DEFAULT "N",
    `rv_view`    int    NOT NULL DEFAULT 0,
    `rv_date`    datetime default current_timestamp not    NULL,
    `rv_tv_num` int    NOT NULL,
    `rv_mb_num` int    NOT NULL,
    FOREIGN KEY (`rv_tv_num`) REFERENCES `travel` (`tv_num`) ON DELETE CASCADE,
    FOREIGN KEY (`rv_mb_num`) REFERENCES `member` (`mb_num`)
);

DROP TABLE IF EXISTS `likes`;
CREATE TABLE `likes` (
    `li_num`    int PRIMARY KEY AUTO_INCREMENT,
    `li_state`  int    NOT NULL,
    `li_id`     int    NOT NULL,
    `li_name`    varchar(10) NOT    NULL,
    `li_time`    datetime default current_timestamp not    NULL,
    `li_mb_num` int    NOT NULL,
    FOREIGN KEY (`li_mb_num`) REFERENCES `member` (`mb_num`)
);

-- ==========================================
-- 7. 초기 데이터 삽입
-- ==========================================
INSERT INTO `member` (mb_num, mb_Uid, mb_rol) VALUES (1, 'admin', 'ADMIN');
INSERT INTO `board` (bo_name) VALUES ('전체게시판');
INSERT INTO `category` (cg_num, cg_kind, cg_display, cg_bo_num) VALUES (1, '여행 추천 게시판', 'Y', 1);
INSERT INTO `category` (cg_num, cg_kind, cg_display, cg_bo_num) VALUES (2, '여행 후기 게시판', 'Y', 1);
INSERT INTO `category` (cg_num, cg_kind, cg_display, cg_bo_num) VALUES (3, '자유 게시판', 'Y', 1);

INSERT INTO `recommend_post` (po_title, po_content, po_mb_num, po_del) 
VALUES ('안녕하세요 추천 테스트 게시글입니다', '내용입니다.', 1, 'N');