DROP DATABASE IF EXISTS travel;
CREATE DATABASE travel;
USE travel;

-- 1. 기초 테이블
CREATE TABLE `member` (
    `mb_num` int PRIMARY KEY AUTO_INCREMENT,
    `mb_uid` varchar(30) UNIQUE NOT NULL,
    `mb_nickname` varchar(30) NULL,
    `mb_pw` varchar(255) NULL,
    `mb_email` varchar(50) NULL,
    `mb_rol` varchar(10) DEFAULT 'USER' NOT NULL,
    `mb_score` int NOT NULL DEFAULT 0,
    `mb_photo_data` LONGBLOB NULL,
    `mb_photo_type` varchar(30) NULL,
    `mb_photo_ver` int NULL,
    `mb_agree` char(1) NOT NULL DEFAULT 'N'
);

CREATE TABLE `board` (
    `bo_num` int PRIMARY KEY AUTO_INCREMENT,
    `bo_name` varchar(100) UNIQUE NOT NULL
);

CREATE TABLE `category` (
    `cg_num` int PRIMARY KEY AUTO_INCREMENT,
    `cg_kind` varchar(100) UNIQUE NOT NULL,
    `cg_display` char(1) NOT NULL,
    `cg_bo_num` int NOT NULL,
    FOREIGN KEY (`cg_bo_num`) REFERENCES `board` (`bo_num`) ON DELETE CASCADE
);

CREATE TABLE `kind` (
    `ki_num` int PRIMARY KEY AUTO_INCREMENT,
    `ki_name` varchar(10) UNIQUE NOT NULL
);

CREATE TABLE `travel` (
    `tv_num` int PRIMARY KEY AUTO_INCREMENT,
    `tv_API` varchar(100) NOT NULL,
    `tv_lat` DOUBLE NULL,
    `tv_lng` DOUBLE NULL,
    `tv_geo_status` ENUM('NO_COORD', 'READY') DEFAULT 'NO_COORD',
    `tv_mapAPI` varchar(100) NOT NULL,
    `tv_cg_num` int NOT NULL,
    FOREIGN KEY (`tv_cg_num`) REFERENCES `category` (`cg_num`)
);

-- 2. 게시판 테이블 (기존)
CREATE TABLE `recommend_post` (
    `po_num` int PRIMARY KEY AUTO_INCREMENT,
    `po_title` varchar(100) NOT NULL,
    `po_content` LONGTEXT NOT NULL,
    `po_img` varchar(1000) NULL,
    `po_date` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `po_view` int NOT NULL DEFAULT 0,
    `po_up` int NOT NULL DEFAULT 0,
    `po_down` int NOT NULL DEFAULT 0,
    `po_report` int NOT NULL DEFAULT 0,
    `po_del` char(1) NOT NULL DEFAULT 'N',
    `po_mb_num` int NOT NULL,
    FOREIGN KEY (`po_mb_num`) REFERENCES `member` (`mb_num`)
);

CREATE TABLE `review_post` (
    `po_num` int PRIMARY KEY AUTO_INCREMENT,
    `po_title` varchar(100) NOT NULL,
    `po_content` LONGTEXT NOT NULL,
    `po_img` varchar(1000) NULL,
    `po_date` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `po_view` int NOT NULL DEFAULT 0,
    `po_up` int NOT NULL DEFAULT 0,
    `po_down` int NOT NULL DEFAULT 0,
    `po_report` int NOT NULL DEFAULT 0,
    `po_del` char(1) NOT NULL DEFAULT 'N',
    `po_mb_num` int NOT NULL,
    FOREIGN KEY (`po_mb_num`) REFERENCES `member` (`mb_num`)
);

CREATE TABLE `free_post` (
    `po_num` int PRIMARY KEY AUTO_INCREMENT,
    `po_title` varchar(100) NOT NULL,
    `po_content` LONGTEXT NOT NULL,
    `po_img` varchar(1000) NULL,
    `po_date` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `po_view` int NOT NULL DEFAULT 0,
    `po_up` int NOT NULL DEFAULT 0,
    `po_down` int NOT NULL DEFAULT 0,
    `po_report` int NOT NULL DEFAULT 0,
    `po_del` char(1) NOT NULL DEFAULT 'N',
    `po_mb_num` int NOT NULL,
    FOREIGN KEY (`po_mb_num`) REFERENCES `member` (`mb_num`)
);

CREATE TABLE `event_post` (
    `po_num` int PRIMARY KEY AUTO_INCREMENT,
    `po_title` varchar(100) NOT NULL,
    `po_content` LONGTEXT NOT NULL,
    `po_img` varchar(1000) NULL,
    `po_date` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `po_view` int NOT NULL DEFAULT 0,
    `po_up` int NOT NULL DEFAULT 0, 
    `po_down` int NOT NULL DEFAULT 0,
    `po_report` int NOT NULL DEFAULT 0,
    `po_del` char(1) NOT NULL DEFAULT 'N',
    `po_mb_num` int NOT NULL,
    FOREIGN KEY (`po_mb_num`) REFERENCES `member` (`mb_num`)
);

CREATE TABLE `newsletter_post` (
    `po_num` int PRIMARY KEY AUTO_INCREMENT,
    `po_title` varchar(100) NOT NULL,
    `po_content` LONGTEXT NOT NULL,
    `po_img` varchar(1000) NULL,
    `po_date` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `po_view` int NOT NULL DEFAULT 0,
    `po_up` int NOT NULL DEFAULT 0,
    `po_down` int NOT NULL DEFAULT 0,
    `po_report` int NOT NULL DEFAULT 0,
    `po_del` char(1) NOT NULL DEFAULT 'N',
    `po_mb_num` int NOT NULL,
    FOREIGN KEY (`po_mb_num`) REFERENCES `member` (`mb_num`)
);

-- 🚩 [추가] 자주 묻는 질문(FAQ) 테이블
CREATE TABLE `faq_post` (
    `po_num` int PRIMARY KEY AUTO_INCREMENT,
    `po_title` varchar(100) NOT NULL,
    `po_content` LONGTEXT NOT NULL,
    `po_img` varchar(1000) NULL,
    `po_date` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `po_view` int NOT NULL DEFAULT 0,
    `po_up` int NOT NULL DEFAULT 0,
    `po_down` int NOT NULL DEFAULT 0,
    `po_report` int NOT NULL DEFAULT 0,
    `po_del` char(1) NOT NULL DEFAULT 'N',
    `po_mb_num` int NOT NULL,
    FOREIGN KEY (`po_mb_num`) REFERENCES `member` (`mb_num`)
);

-- 🚩 [유지] 공지사항 테이블
CREATE TABLE `notice_post` (
    `nn_num` int PRIMARY KEY AUTO_INCREMENT,
    `nn_title` varchar(100) NOT NULL,
    `nn_content` LONGTEXT NOT NULL,
    `nn_date` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `nn_view` int NOT NULL DEFAULT 0,
    `nn_up` int NOT NULL DEFAULT 0,
    `nn_down` int NOT NULL DEFAULT 0,
    `nn_report` int NOT NULL DEFAULT 0,
    `nn_del` char(1) NOT NULL DEFAULT 'N',
    `nn_mb_num` int NOT NULL,
    `file_url` varchar(1000) NULL,
    FOREIGN KEY (`nn_mb_num`) REFERENCES `member` (`mb_num`)
);

-- 3. 사진 및 리뷰 테이블
CREATE TABLE `recommend_photo` (
    `ph_num` int PRIMARY KEY AUTO_INCREMENT,
    `ph_ori_name` varchar(100) NOT NULL,
    `ph_name` varchar(255) NOT NULL,
    `ph_po_num` int NOT NULL,
    FOREIGN KEY (`ph_po_num`) REFERENCES `recommend_post` (`po_num`) ON DELETE CASCADE
);

CREATE TABLE `review_photo` (
    `ph_num` int PRIMARY KEY AUTO_INCREMENT,
    `ph_ori_name` varchar(100) NOT NULL,
    `ph_name` varchar(255) NOT NULL, 
    `ph_po_num` int NOT NULL,
    FOREIGN KEY (`ph_po_num`) REFERENCES `review_post` (`po_num`) ON DELETE CASCADE
);

CREATE TABLE `free_photo` (
    `ph_num` int PRIMARY KEY AUTO_INCREMENT,
    `ph_ori_name` varchar(100) NOT NULL,
    `ph_name` varchar(255) NOT NULL,
    `ph_po_num` int NOT NULL,
    FOREIGN KEY (`ph_po_num`) REFERENCES `free_post` (`po_num`) ON DELETE CASCADE
);

CREATE TABLE `newsletter_photo` (
    `ph_num`    int PRIMARY KEY AUTO_INCREMENT,
    `ph_ori_name`    varchar(100) NOT NULL,
    `ph_name`    varchar(100) NOT NULL,
    `ph_po_num` int    NOT NULL,
    FOREIGN KEY (`ph_po_num`) REFERENCES `newsletter_post` (`po_num`) ON DELETE CASCADE
);

CREATE TABLE `review` (
    `rv_num` int PRIMARY KEY AUTO_INCREMENT,
    `rv_content` text NOT NULL,
    `rv_up` int NOT NULL DEFAULT 0,
    `rv_down` int NOT NULL DEFAULT 0,
    `rv_del` char(1) NOT NULL DEFAULT 'N',
    `rv_view` int NOT NULL DEFAULT 0,
    `rv_date` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `rv_tv_num` int NOT NULL,
    `rv_mb_num` int NOT NULL,
    FOREIGN KEY (`rv_tv_num`) REFERENCES `travel` (`tv_num`) ON DELETE CASCADE,
    FOREIGN KEY (`rv_mb_num`) REFERENCES `member` (`mb_num`)
);

-- 4. 소셜 및 보조 테이블
CREATE TABLE `comment` (
    `co_num` int PRIMARY KEY AUTO_INCREMENT,
    `co_content` text NOT NULL,
    `co_date` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `co_like` int NOT NULL DEFAULT 0,
    `co_del` char(1) NOT NULL DEFAULT 'N',
    `co_ori_num` int NULL,
    `co_po_num` int NOT NULL,
    `co_po_type` varchar(20) NOT NULL,
    `co_mb_num` int NOT NULL,
    FOREIGN KEY (`co_ori_num`) REFERENCES `comment` (`co_num`) ON DELETE CASCADE,
    FOREIGN KEY (`co_mb_num`) REFERENCES `member` (`mb_num`)
);

CREATE TABLE `mark` (
    `ma_num` int PRIMARY KEY AUTO_INCREMENT,
    `ma_score` int NOT NULL DEFAULT 0,
    `ma_ki_num` int NOT NULL,
    `ma_po_num` int NOT NULL,
    `ma_po_type` varchar(20) NOT NULL,
    FOREIGN KEY (`ma_ki_num`) REFERENCES `kind` (`ki_num`) ON DELETE CASCADE
);

CREATE TABLE `likes` (
    `li_num` int PRIMARY KEY AUTO_INCREMENT,
    `li_state` int NOT NULL,
    `li_id` int NOT NULL,
    `li_name` varchar(20) NOT NULL,
    `li_time` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `li_mb_num` int NOT NULL,
    FOREIGN KEY (`li_mb_num`) REFERENCES `member` (`mb_num`)
);

CREATE TABLE `bookmark` (
    `bm_num` int PRIMARY KEY AUTO_INCREMENT,
    `bm_po_num` int NOT NULL,
    `bm_po_type` varchar(20) NOT NULL,
    `bm_mb_num` int NOT NULL,
    FOREIGN KEY (`bm_mb_num`) REFERENCES `member` (`mb_num`)
);

CREATE TABLE `live_rank` (
    `lr_num` int PRIMARY KEY AUTO_INCREMENT,
    `lr_time` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `lr_ori_num` int NOT NULL,
    `lr_po_num` int NOT NULL,
    `lr_po_type` varchar(20) NOT NULL
);

CREATE TABLE `history` (
    `ht_num` int PRIMARY KEY AUTO_INCREMENT,
    `ht_time` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `ht_po_num` int NOT NULL,
    `ht_po_type` varchar(20) NOT NULL,
    `ht_me_num` int NOT NULL,
    FOREIGN KEY (`ht_me_num`) REFERENCES `member` (`mb_num`)
);

CREATE TABLE `inquiry_box` (
    `ib_num` int PRIMARY KEY AUTO_INCREMENT,
    `ib_title` varchar(200) NOT NULL,
    `ib_content` text NOT NULL,
    `ib_reply` text NULL,
    `ib_date` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `ib_status` char(1) NOT NULL DEFAULT 'N',
    `ib_mb_num` int NOT NULL,
    FOREIGN KEY (`ib_mb_num`) REFERENCES `member` (`mb_num`)
);

CREATE TABLE `report_box` (
    `rb_num` int PRIMARY KEY AUTO_INCREMENT,
    `rb_content` text NOT NULL,
    `rb_reply` text NULL,
    `rb_manage` char(1) DEFAULT 'N',
    `rb_id` int NOT NULL,
    `rb_name` varchar(30) NOT NULL,
    `rb_mb_num` int NOT NULL,
    FOREIGN KEY (`rb_mb_num`) REFERENCES `member` (`mb_num`)
);

CREATE TABLE `main_photo` (
    `mp_num` int PRIMARY KEY AUTO_INCREMENT,
    `mp_name` varchar(100) NOT NULL,
    `mp_tv_num` int NOT NULL,
    FOREIGN KEY (`mp_tv_num`) REFERENCES `travel` (`tv_num`)
);

-- 5. 데이터 삽입
INSERT INTO `member` (mb_num, mb_uid, mb_pw, mb_email, mb_nickname, mb_rol) VALUES 
(1, '123', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin@test.com', 'admin', 'ADMIN'),
(2, '456', '$2a$10$8K1p/a0dL2LXMIgoEDFrwOfMQfKUtEbPQ8dNFqLqjnM/zIIElKjQu', 'user@test.com', 'user', 'USER');

INSERT INTO `board` (bo_num, bo_name) VALUES (1, '전체게시판');

INSERT INTO `category` (cg_num, cg_kind, cg_display, cg_bo_num) VALUES 
(1, '여행 추천 게시판', 'Y', 1),
(2, '여행 후기 게시판', 'Y', 1),
(3, '자유 게시판', 'Y', 1),
(4, '이벤트 게시판', 'Y', 1),
(5, '뉴스레터 게시판', 'Y', 1),
(6, '공지사항 게시판', 'Y', 1),
(7, 'FAQ 게시판', 'Y', 1); -- 🚩 [추가] FAQ 카테고리

INSERT INTO `kind` (ki_num, ki_name) VALUES (1, '추천점수');

INSERT INTO `recommend_post` (po_title, po_content, po_mb_num, po_del) VALUES ('안녕하세요 추천 테스트 게시글입니다', '내용입니다.', 1, 'N');
INSERT INTO `event_post` (po_title, po_content, po_mb_num, po_del) VALUES ('진행중인 이벤트입니다', '이벤트 내용입니다.', 1, 'N');
INSERT INTO `newsletter_post` (po_title, po_content, po_mb_num, po_del) VALUES ('2월의 여행 뉴스레터', '뉴스레터 내용입니다.', 1, 'N');
INSERT INTO `notice_post` (nn_title, nn_content, nn_mb_num, nn_del) VALUES ('여행 커뮤니티 정식 오픈 안내', '안녕하세요. 여행 커뮤니티 서비스가 정식 오픈되었습니다.', 1, 'N');
INSERT INTO `faq_post` (po_title, po_content, po_mb_num, po_del) VALUES ('비밀번호를 분실했어요.', '로그인 화면에서 비밀번호 찾기를 이용해주세요.', 1, 'N'); -- 🚩 [추가] FAQ 초기 데이터