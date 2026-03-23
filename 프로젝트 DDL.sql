-- TravelProject DB Schema (structure only, no data)
-- Source: MySQL dump from server, cleaned to keep only table definitions
-- Charset: utf8mb4 / InnoDB

SET NAMES utf8mb4;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

-- -----------------------------------------------------
-- Table `RankingEntity`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `RankingEntity`;
CREATE TABLE `RankingEntity` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `areaNm` varchar(255) DEFAULT NULL,
  `baseDate` varchar(255) DEFAULT NULL,
  `sigunguCode` varchar(255) DEFAULT NULL,
  `vCount` bigint DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `board`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `board`;
CREATE TABLE `board` (
  `bo_num` int NOT NULL AUTO_INCREMENT,
  `bo_name` varchar(100) NOT NULL,
  PRIMARY KEY (`bo_num`),
  UNIQUE KEY `bo_name` (`bo_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `bookmark`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `bookmark`;
CREATE TABLE `bookmark` (
  `bm_num` int NOT NULL AUTO_INCREMENT,
  `bm_po_num` int NOT NULL,
  `bm_po_type` varchar(20) NOT NULL,
  `bm_mb_num` int NOT NULL,
  PRIMARY KEY (`bm_num`),
  KEY `bm_mb_num` (`bm_mb_num`),
  CONSTRAINT `bookmark_ibfk_1` FOREIGN KEY (`bm_mb_num`) REFERENCES `member` (`mb_num`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `category`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `category`;
CREATE TABLE `category` (
  `cg_num` int NOT NULL AUTO_INCREMENT,
  `cg_kind` varchar(100) NOT NULL,
  `cg_display` char(1) NOT NULL,
  `cg_bo_num` int NOT NULL,
  PRIMARY KEY (`cg_num`),
  UNIQUE KEY `cg_kind` (`cg_kind`),
  KEY `cg_bo_num` (`cg_bo_num`),
  CONSTRAINT `category_ibfk_1` FOREIGN KEY (`cg_bo_num`) REFERENCES `board` (`bo_num`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `comment`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `comment`;
CREATE TABLE `comment` (
  `co_num` int NOT NULL AUTO_INCREMENT,
  `co_content` text NOT NULL,
  `co_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `co_like` int NOT NULL DEFAULT '0',
  `co_del` varchar(1) DEFAULT NULL,
  `co_ori_num` int DEFAULT NULL,
  `co_po_num` int NOT NULL,
  `co_po_type` varchar(255) NOT NULL,
  `co_mb_num` int NOT NULL,
  PRIMARY KEY (`co_num`),
  KEY `co_ori_num` (`co_ori_num`),
  KEY `co_mb_num` (`co_mb_num`),
  CONSTRAINT `comment_ibfk_1` FOREIGN KEY (`co_ori_num`) REFERENCES `comment` (`co_num`) ON DELETE CASCADE,
  CONSTRAINT `comment_ibfk_2` FOREIGN KEY (`co_mb_num`) REFERENCES `member` (`mb_num`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `comment_like`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `comment_like`;
CREATE TABLE `comment_like` (
  `clNum` int NOT NULL AUTO_INCREMENT,
  `co_num` int DEFAULT NULL,
  `mb_num` int DEFAULT NULL,
  PRIMARY KEY (`clNum`),
  KEY `FKow2fjqv8557owtldol3yye04g` (`co_num`),
  KEY `FKi4oakehdy57lenf0mafp9g5c2` (`mb_num`),
  CONSTRAINT `FKi4oakehdy57lenf0mafp9g5c2` FOREIGN KEY (`mb_num`) REFERENCES `member` (`mb_num`),
  CONSTRAINT `FKow2fjqv8557owtldol3yye04g` FOREIGN KEY (`co_num`) REFERENCES `comment` (`co_num`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `event_post`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `event_post`;
CREATE TABLE `event_post` (
  `po_num` int NOT NULL AUTO_INCREMENT,
  `po_title` varchar(255) NOT NULL,
  `po_content` longtext NOT NULL,
  `po_img` varchar(1000) DEFAULT NULL,
  `po_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `po_view` int NOT NULL DEFAULT '0',
  `po_up` int NOT NULL DEFAULT '0',
  `po_down` int NOT NULL DEFAULT '0',
  `po_report` int NOT NULL DEFAULT '0',
  `po_del` char(1) NOT NULL DEFAULT 'N',
  `po_mb_num` int NOT NULL,
  `po_type` varchar(20) NOT NULL,
  PRIMARY KEY (`po_num`),
  KEY `po_mb_num` (`po_mb_num`),
  CONSTRAINT `event_post_ibfk_1` FOREIGN KEY (`po_mb_num`) REFERENCES `member` (`mb_num`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `faq_post`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `faq_post`;
CREATE TABLE `faq_post` (
  `po_num` int NOT NULL AUTO_INCREMENT,
  `po_content` longtext NOT NULL,
  `po_date` datetime(6) DEFAULT NULL,
  `po_del` char(1) DEFAULT 'N',
  `po_down` int DEFAULT '0',
  `po_img` varchar(1000) DEFAULT NULL,
  `po_mb_num` int DEFAULT NULL,
  `po_report` int DEFAULT '0',
  `po_title` varchar(100) NOT NULL,
  `po_up` int DEFAULT '0',
  `po_view` int DEFAULT '0',
  PRIMARY KEY (`po_num`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `free_photo`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `free_photo`;
CREATE TABLE `free_photo` (
  `ph_num` int NOT NULL AUTO_INCREMENT,
  `ph_ori_name` varchar(100) NOT NULL,
  `ph_name` varchar(255) NOT NULL,
  `ph_po_num` int NOT NULL,
  PRIMARY KEY (`ph_num`),
  KEY `ph_po_num` (`ph_po_num`),
  CONSTRAINT `free_photo_ibfk_1` FOREIGN KEY (`ph_po_num`) REFERENCES `free_post` (`po_num`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `free_post`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `free_post`;
CREATE TABLE `free_post` (
  `po_num` int NOT NULL AUTO_INCREMENT,
  `po_title` varchar(100) NOT NULL,
  `po_content` longtext NOT NULL,
  `po_img` varchar(1000) DEFAULT NULL,
  `po_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `po_view` int NOT NULL DEFAULT '0',
  `po_up` int NOT NULL DEFAULT '0',
  `po_down` int NOT NULL DEFAULT '0',
  `po_report` int NOT NULL DEFAULT '0',
  `po_del` varchar(1) NOT NULL,
  `po_mb_num` int NOT NULL,
  PRIMARY KEY (`po_num`),
  KEY `po_mb_num` (`po_mb_num`),
  CONSTRAINT `free_post_ibfk_1` FOREIGN KEY (`po_mb_num`) REFERENCES `member` (`mb_num`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `history`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `history`;
CREATE TABLE `history` (
  `ht_num` int NOT NULL AUTO_INCREMENT,
  `ht_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ht_po_num` int NOT NULL,
  `ht_po_type` varchar(20) NOT NULL,
  `ht_me_num` int NOT NULL,
  `htMeNum` int NOT NULL,
  `htPoNum` int NOT NULL,
  `htTime` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`ht_num`),
  KEY `ht_me_num` (`ht_me_num`),
  CONSTRAINT `history_ibfk_1` FOREIGN KEY (`ht_me_num`) REFERENCES `member` (`mb_num`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `inquiry_box`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `inquiry_box`;
CREATE TABLE `inquiry_box` (
  `ib_num` int NOT NULL AUTO_INCREMENT,
  `ib_title` varchar(200) NOT NULL,
  `ib_content` text NOT NULL,
  `ib_reply` text,
  `ib_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ib_status` char(1) NOT NULL DEFAULT 'N',
  `ib_seen` char(1) NOT NULL DEFAULT 'N',
  `ib_mb_num` int NOT NULL,
  PRIMARY KEY (`ib_num`),
  KEY `ib_mb_num` (`ib_mb_num`),
  CONSTRAINT `inquiry_box_ibfk_1` FOREIGN KEY (`ib_mb_num`) REFERENCES `member` (`mb_num`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `kakaomap`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `kakaomap`;
CREATE TABLE `kakaomap` (
  `km_num` int NOT NULL AUTO_INCREMENT,
  `km_name` varchar(100) NOT NULL,
  `km_lat` double NOT NULL,
  `km_lng` double NOT NULL,
  `km_address` varchar(255) DEFAULT NULL,
  `km_category` varchar(50) DEFAULT NULL,
  `km_api_id` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`km_num`),
  UNIQUE KEY `km_api_id` (`km_api_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `kind`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `kind`;
CREATE TABLE `kind` (
  `ki_num` int NOT NULL AUTO_INCREMENT,
  `ki_name` varchar(10) NOT NULL,
  PRIMARY KEY (`ki_num`),
  UNIQUE KEY `ki_name` (`ki_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `likes`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `likes`;
CREATE TABLE `likes` (
  `li_num` int NOT NULL AUTO_INCREMENT,
  `li_state` int NOT NULL,
  `li_id` int NOT NULL,
  `li_name` varchar(10) NOT NULL,
  `li_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `li_mb_num` int NOT NULL,
  PRIMARY KEY (`li_num`),
  KEY `li_mb_num` (`li_mb_num`),
  CONSTRAINT `likes_ibfk_1` FOREIGN KEY (`li_mb_num`) REFERENCES `member` (`mb_num`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `live_rank`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `live_rank`;
CREATE TABLE `live_rank` (
  `lr_num` int NOT NULL AUTO_INCREMENT,
  `lr_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `lr_ori_num` int NOT NULL,
  `lr_po_num` int NOT NULL,
  `lr_po_type` varchar(20) NOT NULL,
  PRIMARY KEY (`lr_num`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `live_rank_region`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `live_rank_region`;
CREATE TABLE `live_rank_region` (
  `lr_id` bigint NOT NULL AUTO_INCREMENT,
  `area_nm` varchar(255) NOT NULL,
  `sigungu_code` varchar(255) NOT NULL,
  `v_count` bigint NOT NULL,
  `base_date` varchar(255) NOT NULL,
  `reg_date` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`lr_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `main_photo`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `main_photo`;
CREATE TABLE `main_photo` (
  `mp_num` int NOT NULL AUTO_INCREMENT,
  `mp_name` varchar(100) NOT NULL,
  `mp_tv_num` int NOT NULL,
  PRIMARY KEY (`mp_num`),
  KEY `mp_tv_num` (`mp_tv_num`),
  CONSTRAINT `main_photo_ibfk_1` FOREIGN KEY (`mp_tv_num`) REFERENCES `travel` (`tv_num`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `mark`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `mark`;
CREATE TABLE `mark` (
  `ma_num` int NOT NULL AUTO_INCREMENT,
  `ma_score` int NOT NULL DEFAULT '0',
  `ma_ki_num` int NOT NULL,
  `ma_po_num` int NOT NULL,
  `ma_po_type` varchar(20) NOT NULL,
  PRIMARY KEY (`ma_num`),
  KEY `ma_ki_num` (`ma_ki_num`),
  CONSTRAINT `mark_ibfk_1` FOREIGN KEY (`ma_ki_num`) REFERENCES `kind` (`ki_num`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `member`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `member`;
CREATE TABLE `member` (
  `mb_num` int NOT NULL AUTO_INCREMENT,
  `mb_uid` varchar(30) NOT NULL,
  `mb_nickname` varchar(50) NOT NULL,
  `mb_pw` varchar(255) DEFAULT NULL,
  `mb_email` varchar(50) DEFAULT NULL,
  `mb_rol` varchar(10) NOT NULL DEFAULT 'USER',
  `mb_score` int NOT NULL DEFAULT '0',
  `mb_photo` varchar(100) DEFAULT NULL,
  `mb_photo_data` longblob,
  `mb_photo_type` varchar(30) DEFAULT NULL,
  `mb_photo_ver` int DEFAULT NULL,
  `mb_agree` char(1) NOT NULL DEFAULT 'N',
  `mb_provider` varchar(20) DEFAULT 'local',
  PRIMARY KEY (`mb_num`),
  UNIQUE KEY `mb_uid` (`mb_uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `newsletter_photo`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `newsletter_photo`;
CREATE TABLE `newsletter_photo` (
  `ph_num` int NOT NULL AUTO_INCREMENT,
  `ph_ori_name` varchar(100) NOT NULL,
  `ph_name` varchar(100) NOT NULL,
  `ph_po_num` int NOT NULL,
  PRIMARY KEY (`ph_num`),
  KEY `ph_po_num` (`ph_po_num`),
  CONSTRAINT `newsletter_photo_ibfk_1` FOREIGN KEY (`ph_po_num`) REFERENCES `newsletter_post` (`po_num`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `newsletter_post`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `newsletter_post`;
CREATE TABLE `newsletter_post` (
  `po_num` int NOT NULL AUTO_INCREMENT,
  `po_title` varchar(255) NOT NULL,
  `po_content` longtext NOT NULL,
  `po_img` varchar(1000) DEFAULT NULL,
  `po_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `po_view` int NOT NULL DEFAULT '0',
  `po_up` int NOT NULL DEFAULT '0',
  `po_down` int NOT NULL DEFAULT '0',
  `po_report` int NOT NULL DEFAULT '0',
  `po_del` char(1) NOT NULL DEFAULT 'N',
  `po_mb_num` int NOT NULL,
  PRIMARY KEY (`po_num`),
  KEY `po_mb_num` (`po_mb_num`),
  CONSTRAINT `newsletter_post_ibfk_1` FOREIGN KEY (`po_mb_num`) REFERENCES `member` (`mb_num`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `notice_post`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `notice_post`;
CREATE TABLE `notice_post` (
  `nn_num` int NOT NULL AUTO_INCREMENT,
  `file_url` varchar(255) DEFAULT NULL,
  `nn_content` longtext NOT NULL,
  `nn_date` datetime(6) NOT NULL,
  `nn_del` varchar(255) DEFAULT NULL,
  `nn_down` int DEFAULT NULL,
  `nn_mb_num` int NOT NULL,
  `nn_report` int DEFAULT NULL,
  `nn_title` varchar(100) NOT NULL,
  `nn_up` int DEFAULT NULL,
  `nn_view` int DEFAULT NULL,
  PRIMARY KEY (`nn_num`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `recommend_photo`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `recommend_photo`;
CREATE TABLE `recommend_photo` (
  `ph_num` int NOT NULL AUTO_INCREMENT,
  `ph_ori_name` varchar(100) NOT NULL,
  `ph_name` varchar(255) NOT NULL,
  `ph_po_num` int NOT NULL,
  PRIMARY KEY (`ph_num`),
  KEY `ph_po_num` (`ph_po_num`),
  CONSTRAINT `recommend_photo_ibfk_1` FOREIGN KEY (`ph_po_num`) REFERENCES `recommend_post` (`po_num`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `recommend_post`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `recommend_post`;
CREATE TABLE `recommend_post` (
  `po_num` int NOT NULL AUTO_INCREMENT,
  `po_title` varchar(100) NOT NULL,
  `po_content` longtext NOT NULL,
  `po_img` varchar(1000) DEFAULT NULL,
  `po_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `po_view` int NOT NULL DEFAULT '0',
  `po_up` int NOT NULL DEFAULT '0',
  `po_down` int NOT NULL DEFAULT '0',
  `po_report` int NOT NULL DEFAULT '0',
  `po_del` varchar(1) NOT NULL,
  `po_mb_num` int NOT NULL,
  PRIMARY KEY (`po_num`),
  KEY `po_mb_num` (`po_mb_num`),
  CONSTRAINT `recommend_post_ibfk_1` FOREIGN KEY (`po_mb_num`) REFERENCES `member` (`mb_num`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `report_box`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `report_box`;
CREATE TABLE `report_box` (
  `rb_num` int NOT NULL AUTO_INCREMENT,
  `rb_content` varchar(255) DEFAULT NULL,
  `rb_reply` text,
  `rb_manage` char(1) DEFAULT 'N',
  `rb_id` int NOT NULL,
  `rb_name` varchar(255) DEFAULT NULL,
  `rb_mb_num` int NOT NULL,
  `rb_seen` char(1) DEFAULT 'N',
  PRIMARY KEY (`rb_num`),
  KEY `rb_mb_num` (`rb_mb_num`),
  CONSTRAINT `report_box_ibfk_1` FOREIGN KEY (`rb_mb_num`) REFERENCES `member` (`mb_num`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `review`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `review`;
CREATE TABLE `review` (
  `rv_num` int NOT NULL AUTO_INCREMENT,
  `rv_content` text NOT NULL,
  `rv_up` int NOT NULL DEFAULT '0',
  `rv_down` int NOT NULL DEFAULT '0',
  `rv_del` char(1) NOT NULL DEFAULT 'N',
  `rv_view` int NOT NULL DEFAULT '0',
  `rv_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `rv_tv_num` int NOT NULL,
  `rv_mb_num` int NOT NULL,
  PRIMARY KEY (`rv_num`),
  KEY `rv_tv_num` (`rv_tv_num`),
  KEY `rv_mb_num` (`rv_mb_num`),
  CONSTRAINT `review_ibfk_1` FOREIGN KEY (`rv_tv_num`) REFERENCES `travel` (`tv_num`) ON DELETE CASCADE,
  CONSTRAINT `review_ibfk_2` FOREIGN KEY (`rv_mb_num`) REFERENCES `member` (`mb_num`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `review_photo`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `review_photo`;
CREATE TABLE `review_photo` (
  `ph_num` int NOT NULL AUTO_INCREMENT,
  `ph_ori_name` varchar(100) NOT NULL,
  `ph_name` varchar(255) NOT NULL,
  `ph_po_num` int NOT NULL,
  PRIMARY KEY (`ph_num`),
  KEY `ph_po_num` (`ph_po_num`),
  CONSTRAINT `review_photo_ibfk_1` FOREIGN KEY (`ph_po_num`) REFERENCES `review_post` (`po_num`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `review_post`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `review_post`;
CREATE TABLE `review_post` (
  `po_num` int NOT NULL AUTO_INCREMENT,
  `po_title` varchar(100) NOT NULL,
  `po_content` longtext NOT NULL,
  `po_img` varchar(100) DEFAULT NULL,
  `po_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `po_view` int NOT NULL DEFAULT '0',
  `po_up` int NOT NULL DEFAULT '0',
  `po_down` int NOT NULL DEFAULT '0',
  `po_report` int NOT NULL DEFAULT '0',
  `po_del` varchar(255) DEFAULT NULL,
  `po_mb_num` int NOT NULL,
  PRIMARY KEY (`po_num`),
  KEY `po_mb_num` (`po_mb_num`),
  CONSTRAINT `review_post_ibfk_1` FOREIGN KEY (`po_mb_num`) REFERENCES `member` (`mb_num`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `travel`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `travel`;
CREATE TABLE `travel` (
  `tv_num` int NOT NULL AUTO_INCREMENT,
  `tv_API` varchar(100) NOT NULL,
  `tv_lat` double DEFAULT NULL,
  `tv_lng` double DEFAULT NULL,
  `tv_geo_status` enum('NO_COORD','READY') DEFAULT 'NO_COORD',
  `tv_mapAPI` varchar(100) NOT NULL,
  `tv_cg_num` int NOT NULL,
  PRIMARY KEY (`tv_num`),
  KEY `tv_cg_num` (`tv_cg_num`),
  CONSTRAINT `travel_ibfk_1` FOREIGN KEY (`tv_cg_num`) REFERENCES `category` (`cg_num`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


SET foreign_key_checks = 1;


-- =====================================================
--  부록 1. 주요 클래스 목록 (Controller / Service / DAO / Entity)
-- =====================================================

-- Controller
-- - AdminController: 관리자(문의/신고/회원 관리, 알림)
-- - MemberController: 회원가입/로그인/JWT 재발급/프로필·이메일·PW 변경/탈퇴/카카오 로그인
-- - InquiryController: 1:1 문의 작성/조회
-- - FreeBoardController, RecommendController, EventBoardController, NewsLetterController,
--   NoticeBoardController, FAQController, CommentController, BookMarkController,
--   KakaomapController, RankingController, MypageController, MainController, SpaController

-- Service
-- - MemberService: 회원 도메인(가입/로그인/프로필/탈퇴/카카오)
-- - AdminService: 관리자 페이지(문의/신고/회원/알림)
-- - FreePostService, RecommendPostService, ReviewPostService, EventBoardService,
--   NewsLetterService, NoticeBoardService, FAQService, CommentService,
--   BookMarkService, KakaomapService, RankingService, MemberDetailService

-- DAO (MyBatis)
-- - MemberDAO: member 테이블 조회/가입 등
-- - RecommendPostDAO: 추천 게시판 관련 복잡 쿼리

-- Entity (JPA)
-- - Member, InquiryBox, ReportBox, RecommendPost, FreePost, ReviewPost,
--   NewsLetter, NoticePost, Event, FAQ, Comment, CommentLike, BookMark,
--   Likes, RankingEntity, History, Kakaomap, Travel, MainPhoto 등


-- =====================================================
--  부록 2. 주요 클래스별 핵심 메서드 (요약)
-- =====================================================

-- MemberController
-- - signup(LoginDTO): 회원가입, 입력 검증 후 MemberService.signup 호출
-- - login(LoginRequestDTO): 로그인, MemberService.login → JWT+refresh 쿠키 발급
-- - refresh(HttpServletRequest): refreshToken으로 accessToken 재발급
-- - updateNickname(Authentication, {nickname}): 닉네임 변경
-- - updateEmail(Authentication, {email}): 이메일 변경
-- - changePassword({id,currentPw,newPw}): 비밀번호 변경
-- - withdraw(Authentication, {password}): 탈퇴 (local: PW 필요, kakao: PW 없이)
-- - kakaoAuth({code,signup,redirect_uri}): Kakao 로그인/회원가입 처리

-- MemberService
-- - signup(LoginDTO) : boolean
-- - login(LoginRequestDTO) : MemberVO
-- - verifyUserForReset(id,email) : boolean
-- - resetPassword(id,newPw) : boolean
-- - changePassword(id,currentPw,newPw) : boolean
-- - updateNickname(id,newNickname) : boolean
-- - updateEmail(id,newEmail) : boolean
-- - updatePhoto(id, MultipartFile) : Integer (mb_photo_ver)
-- - deletePhoto(id) : Integer
-- - hasProfilePhoto(id) : boolean
-- - withdraw(id,password) : boolean
-- - kakaoLoginOrSignup(code, fromSignup, redirectUri) : MemberVO

-- AdminController
-- - getInquiries(auth) : 전체 문의 리스트(JSON)
-- - getReports(auth) : 전체 신고 리스트(JSON)
-- - getMembers(auth) : 전체 회원 리스트 (ADMIN 전용)
-- - updateMemberStatus(mbNum,{status}) : 정지/해제 (status=ACTIVE/BANNED_*)
-- - updateMemberRole(mbNum,{role}) : 권한 변경 (USER/SUB_ADMIN/ADMIN, ADMIN 전용)
-- - getNotificationCounts(auth) : {newInquiries,newReports}
-- - updateInquiryStatus(ibNum,{status}), updateInquiryReply(ibNum,{reply})
-- - updateReportStatus(rbNum,{status}), processReport(rbNum,{action}), updateReportReply(rbNum,{reply})

-- AdminService
-- - getAllInquiries() : List<Map> (문의 + 작성자 닉네임)
-- - getAllReports() : List<Map> (신고 + 신고자/대상 닉네임)
-- - getNewCounts() : Map<String,Long> (미답변 문의/미처리 신고 건수)
-- - getAllMembers() : List<Map> (회원 목록 + mbStatus)
-- - updateMemberStatus(mbNum,statusCode) : mb_rol에 BANNED_* 코드 저장
-- - updateMemberRole(mbNum,roleCode) : mb_rol에 USER/SUB_ADMIN/ADMIN 저장
-- - updateInquiryStatus/updateInquiryReply/updateReportStatus/processReport/updateReportReply

-- InquiryController
-- - createInquiry({title,content}, auth) : 1:1 문의 생성
-- - getMyInquiries(auth) : 로그인 사용자의 문의 리스트

-- 게시판 서비스 (예: RecommendPostService)
-- - getPostList(...), getPostDetail(poNum), writePost(...), updatePost(...), deletePost(...)
--   → 각 게시판(추천/자유/리뷰/뉴스레터/이벤트/공지/FAQ)에 대해 유사한 구조

-- CommentService
-- - addComment(...), updateComment(...), deleteComment(...)
-- - addLike/removeLike(...)

-- RankingService / KakaomapService
-- - 랭킹/지도 데이터 조회용 메서드 (여행지 기반 통계/좌표)


-- =====================================================
--  부록 3. 클래스 관계 / 의존 관계 (UML 텍스트 초안)
-- =====================================================

-- 레이어 관계
-- - Controller → Service → Repository/DAO → Entity/VO
--   예) MemberController → MemberService → MemberDAO/MemberRepository → Member / MemberVO

-- 인증/보안
-- - SecurityConfig: Spring Security 설정, JwtAuthenticationFilter 등록
-- - JwtAuthenticationFilter: JwtTokenProvider + MemberDetailService 사용, JWT로 인증 설정
-- - MemberDetailService: MemberDAO로 MemberVO 조회 후 CustomUser(UserDetails) 생성
-- - CustomUser: Spring Security User 상속, 내부에 MemberVO 보관

-- 관리자 흐름
-- - AdminController → AdminService → InquiryRepository / ReportRepository / MemberRepository 등
-- - InquiryBox / ReportBox / Member / RecommendPost / FreePost / ReviewPost 등 Entity들과 연관

-- DB ↔ 코드 매핑 예시
-- - member ↔ Member(Entity) ↔ MemberVO(VO)
-- - inquiry_box ↔ InquiryBox
-- - report_box ↔ ReportBox
-- - recommend_post / free_post / review_post / newsletter_post / event_post / notice_post ↔ 각 게시판 Entity
-- - comment / comment_like / bookmark / likes / travel / live_rank_region 등 ↔ 대응 Entity


-- =====================================================
--  부록 4. 발표용 - 메뉴 구조/라우팅/페이지 흐름
-- =====================================================
--
-- [캡처 1] 메인 화면 메뉴 (브라우저)
-- - 주소: http://localhost:3000/
-- - 상단 헤더에 있는 전체 메뉴가 한 번에 보이도록 캡처
--   (국내여행, 해외여행, 커뮤니티, 뉴스, 고객센터, 마이페이지, 관리자페이지 등)
--
-- [캡처 2] 라우팅 코드 (App.jsx)
-- - 파일: community_react/src/App.jsx
-- - 내용: 최상위 <Routes> ~ 하위 <Route> 정의 부분
--
--   핵심 코드 구조 (요약):
--
--   <Routes>
--     <Route element={
--       <GlobalLayout ...공통 레이아웃/헤더/모달... />
--     }>
--       <Route path="/" element={<Main />} />
--
--       {/* 커뮤니티/국내/해외 서브라우팅 */}
--       <Route path="/domestic/*" element={<CommunityContainer ... />} />
--       <Route path="/foreigncountry/*" element={<CommunityContainer ... />} />
--       <Route path="/community/*" element={<CommunityContainer ... />} />
--
--       {/* 뉴스(이벤트/뉴스레터/공지) */}
--       <Route path="/news/event" element={<EventBoardList ... />} />
--       <Route path="/news/event/write" element={<PostWrite boardType="event" ... />} />
--       <Route path="/news/event/:poNum" element={<EventBoardDetail />} />
--
--       <Route path="/news/newsletter" element={<NewsLetterList ... />} />
--       <Route path="/news/newsletter/write" element={<PostWrite boardType="newsletter" ... />} />
--       <Route path="/news/newsletter/:poNum" element={<NewsLetterDetail />} />
--
--       {/* 고객센터/FAQ */}
--       <Route path="/cscenter/faq" element={<FAQList ... />} />
--       <Route path="/cscenter/faq/write" element={<PostWrite boardType="faq" ... />} />
--       <Route path="/cscenter/faq/posts/:id" element={<FAQDetail />} />
--       <Route path="/cscenter/faq/edit/:id" element={<PostWrite boardType="faq" isEdit={true} ... />} />
--
--       {/* 인증/마이페이지/관리자 */}
--       <Route path="/kakao-callback" element={<KakaoCallback />} />
--       <Route path="/mypage" element={<MyPage />} />
--       <Route path="/admin" element={<AdminPage />} />
--       <Route path="/login" element={<OpenLoginModal ... />} />
--       <Route path="/signup" element={<OpenSignupModal ... />} />
--
--       {/* 공지사항/문의 */}
--       <Route path="/news/notice" element={<NoticeList ... />} />
--       <Route path="/news/notice/write" element={<PostWrite boardType="notice" ... />} />
--       <Route path="/news/notice/edit/:id" element={<PostWrite boardType="notice" isEdit={true} ... />} />
--       <Route path="/news/notice/:poNum" element={<NoticeDetail />} />
--       <Route path="/inquiry" element={<InquiryPage />} />
--     </Route>
--   </Routes>
--
-- - 발표 포인트:
--   · GlobalLayout로 공통 레이아웃을 감싸고, 하위 Route가 각 메뉴와 1:1로 매핑
--   · /domestic/*, /community/* 처럼 서브라우팅으로 게시판 계층 구조 표현


-- =====================================================
--  부록 5. 발표용 - React 컴포넌트 + axios(API) + 상태관리 (MyPage 예시)
-- =====================================================
--
-- [캡처 3] 마이페이지 화면 (브라우저)
-- - 주소: http://localhost:3000/mypage
-- - 상단 프로필(닉네임/이메일/프로필 사진)과
--   하단 탭(내가 쓴 글 / 신고함 / 문의함) + 목록 + 페이지네이션이 보이도록 캡처
--
-- [캡처 4] MyPage 컴포넌트 코드 (상태 + axios)
-- - 파일: community_react/src/pages/MyPage.jsx
-- - 위쪽 import/useState/useEffect/useCallback 부분이 한 화면에 나오도록 캡처
--
--   1) 상태 관리 구조 (요약 코드)
--
--   function MyPage() {
--     const { user, setUser, openChangePassword, onLogout } = useOutletContext() || {};
--     const navigate = useNavigate();
--     const [myPosts, setMyPosts] = useState([]);
--     const [loading, setLoading] = useState(true);
--     const [searchKeyword, setSearchKeyword] = useState("");
--     const [selectedBoard, setSelectedBoard] = useState("");
--     const [isEditingEmail, setIsEditingEmail] = useState(false);
--     const [editEmailValue, setEditEmailValue] = useState("");
--     const [isEditingNickname, setIsEditingNickname] = useState(false);
--     const [editNicknameValue, setEditNicknameValue] = useState("");
--     const [bookmarks, setBookmarks] = useState([]);
--     const [bottomTab, setBottomTab] = useState("posts");
--     const [myReports, setMyReports] = useState([]);
--     const [myInquiries, setMyInquiries] = useState([]);
--     const [postsPage, setPostsPage] = useState(1);
--     const [reportsPage, setReportsPage] = useState(1);
--     const [inquiriesPage, setInquiriesPage] = useState(1);
--
--     const POSTS_PER_PAGE = 3;
--     const REPORTS_PER_PAGE = 3;
--     const INQUIRIES_PER_PAGE = 3;
--     ...
--   }
--
--   · 여러 useState로 프로필/북마크/신고/문의/페이지네이션 상태를 분리 관리
--   · *PER_PAGE 상수를 3으로 두고, 한 페이지당 3개씩만 보여주도록 구현
--
--   2) axios(api)로 "내가 쓴 글" 불러오기
--
--   const loadMyPosts = useCallback(async () => {
--     if (!user) {
--       setLoading(false);
--       return;
--     }
--     setLoading(true);
--     try {
--       // JWT로 로그인된 회원 번호를 서버가 인식해서, 내가 쓴 글만 반환
--       const res = await api.get("/api/mypage/posts");
--       const data = res.data;
--       if (!Array.isArray(data)) {
--         setMyPosts([]);
--         return;
--       }
--       const norm = (p) => ({
--         ...p,
--         poNum: p.poNum ?? p.po_num,
--         poTitle: p.poTitle ?? p.po_title,
--         poDate: p.poDate ?? p.po_date,
--       });
--       const combined = data
--         .map(norm)
--         .sort((a, b) => new Date(b.poDate || 0) - new Date(a.poDate || 0));
--       setMyPosts(combined);
--     } catch (err) {
--       console.error("내 글 목록 조회 실패:", err);
--       setMyPosts([]);
--     } finally {
--       setLoading(false);
--     }
--   }, [user]);
--
--   useEffect(() => {
--     loadMyPosts();
--   }, [loadMyPosts]);
--
--   · api(axios 인스턴스)를 이용해 /api/mypage/posts 호출
--   · 응답을 정규화/정렬해서 myPosts 상태에 저장
--   · useEffect에서 loadMyPosts를 호출해 마운트 시 자동 로딩
--
--   3) 신고/문의 목록 불러오기 (패턴 재사용)
--
--   useEffect(() => {
--     if (!user) return;
--     const fetchReports = async () => {
--       try {
--         const res = await api.get("/api/mypage/reports");
--         setMyReports(Array.isArray(res.data) ? res.data : []);
--       } catch (_) {
--         setMyReports([]);
--       }
--     };
--     fetchReports();
--   }, [user]);
--
--   useEffect(() => {
--     if (!user) return;
--     const fetchInquiries = async () => {
--       try {
--         const res = await api.get("/api/inquiry/my");
--         setMyInquiries(Array.isArray(res.data) ? res.data : []);
--       } catch (_) {
--         setMyInquiries([]);
--       }
--     };
--     fetchInquiries();
--   }, [user]);
--
--   · 동일한 패턴(axios 호출 → 배열 확인 → useState 업데이트)을 재사용
--   · 발표에서는 "컴포넌트 하나 안에 상태관리 + API 호출 + 페이지네이션이 다 들어있는 예시"로 설명 가능


-- =====================================================
--  부록 6. 왜 그렇게 했는지 / 사용한 방법·필요한 것
-- =====================================================
--
-- ■ 1. 메뉴·라우팅 구조 (React Router)
--
--  · GlobalLayout으로 감싼 이유
--    → 헤더, 푸터, 로그인/회원가입 모달을 모든 페이지에서 공통으로 쓰기 위해.
--    → 레이아웃을 한 곳에서 관리하면 새 메뉴 추가 시 Route만 추가하면 됨.
--
--  · path에 /* 를 쓴 이유 (예: /community/*, /domestic/*)
--    → 그 안에서 다시 서브 경로(목록/글쓰기/상세/수정)를 쓰려고.
--    → CommunityContainer 안에 <Routes><Route path="recommend" .../><Route path="recommend/:id" .../> 식으로 중첩 라우팅.
--
--  · PostWrite를 boardType으로 한 컴포넌트로 쓰는 이유
--    → 추천/자유/이벤트/뉴스레터/공지/FAQ가 모두 제목+내용+이미지 구조라 하나의 폼으로 처리 가능.
--    → boardType만 바꿔서 같은 API를 다른 테이블(게시판)에 맞게 호출하도록 함.
--
--  · 필요한 것: react-router-dom (Routes, Route, Outlet, useNavigate, useOutletContext)
--
--
-- ■ 2. React 컴포넌트 + axios + 상태관리
--
--  · useState를 목록/탭/편집 모드마다 나눈 이유
--    → 한 상태가 바뀔 때 다른 부분까지 같이 리렌더되면 복잡해지므로, 역할별로 나누면 유지보수와 디버깅이 쉬움.
--    → 예: myPosts / myReports / myInquiries 를 따로 두어 "내가 쓴 글"과 "신고함·문의함"을 각각 로딩·표시.
--
--  · useCallback으로 loadMyPosts를 감싼 이유
--    → 이 함수를 useEffect 의존성에 넣었기 때문에, 매 렌더마다 새 함수가 되면 useEffect가 계속 돌아감.
--    → useCallback(..., [user]) 로 user가 바뀔 때만 함수를 새로 만들게 해서 불필요한 재요청을 막음.
--
--  · useEffect에서 api.get 호출하는 이유
--    → 페이지(컴포넌트)가 열릴 때 한 번만 서버에서 데이터를 가져오면 되기 때문.
--    → 로그인한 user가 있을 때만 요청하도록 if (!user) return 으로 막아서 비로그인 시 에러·빈 호출 방지.
--
--  · api (axios 인스턴스)를 쓰는 이유
--    → baseURL, withCredentials(쿠키), 요청/응답 인터셉터를 한 곳에서 설정하기 위해.
--    → 만료된 accessToken이면 refresh로 갱신한 뒤 재요청하는 로직을 인터셉터에 넣어 두었음.
--
--  · norm(p) 로 po_num ↔ poNum 같이 필드명을 맞추는 이유
--    → 백엔드는 스네이크, 프론트는 카멜을 쓸 수 있어서 한쪽으로 통일해 두면 컴포넌트에서 다루기 쉬움.
--
--  · 페이지당 3개(POSTS_PER_PAGE=3)로 한 이유
--    → 발표/과제에서 "페이지네이션 구현"을 보여주기 좋고, 한 화면에 목록이 너무 길어지지 않게 하기 위해.
--
--  · 필요한 것: axios, useState, useEffect, useCallback (React 훅)
--
--
-- ■ 3. 백엔드 레이어 (Controller → Service → DAO/Repository)
--
--  · Controller만 요청/응답 처리하게 한 이유
--    → HTTP 상태코드, JSON 변환, 권한 체크를 한 곳에서 하면 Service는 순수 비즈니스 로직만 담당 가능.
--
--  · Service에서 Map/List를 반환하는 이유 (예: AdminService.getAllMembers)
--    → 화면에 보여줄 때 "권한·상태 라벨" 등 DB 컬럼과 다른 값으로 보여줘야 해서.
--    → Entity를 그대로 내보내지 않고 Service에서 DTO처럼 Map으로 가공해 전달.
--
--  · 회원 정지/해제를 mb_rol 컬럼으로만 처리한 이유
--    → 실제 서버 DB에 mb_status, mb_ban_until 컬럼이 없어서 스키마 변경 없이 구현하려고.
--    → mb_rol에 USER, ADMIN, SUB_ADMIN 외에 BANNED_7D, BANNED_30D, BANNED_PERM 등을 넣어 "역할+정지"를 같이 표현.
--
--  · SUB_ADMIN을 둔 이유
--    → 문의/신고 처리만 맡기고, 회원 목록·정지·권한 변경은 하지 못하게 하려고.
--    → AdminController에서 회원 관련 API는 isAdmin(auth)만 체크하고, 문의/신고/알림은 isAdminOrSubAdmin(auth)로 열어둠.
--
--  · 필요한 것: Spring Security, JWT(access+refresh), Authentication 객체로 role 확인
--
--
-- ■ 4. 관리자 알림 (신규 문의/신고)
--
--  · 실시간처럼 보이게 하려고 2초마다 폴링하는 이유
--    → WebSocket/SSE를 쓰지 않고 단순 HTTP만으로 구현하려고.
--    → 짧은 주기(2초)로 /api/admin/notification-counts 를 호출해 새 건수가 있으면 헤더에 알림 표시.
--
--  · 쿼리스트링 ?t=Date.now() 를 붙인 이유
--    → 브라우저나 프록시가 GET 응답을 캐시해서 "새 문의가 있어도 숫자가 안 바뀌는" 문제를 줄이려고.
--
--  · API 실패 시 setAdminNewCounts(prev => prev) 로 두는 이유
--    → 네트워크 오류 등으로 한 번 실패했을 때 기존 알림 숫자를 0으로 덮어쓰지 않기 위해.
--
--  · 필요한 것: setInterval, window focus 이벤트로 탭 전환 후 다시 숫자 갱신
--
--
-- ■ 5. 로그인·인증 (JWT + 쿠키)
--
--  · accessToken은 메모리(상태), refreshToken은 httpOnly 쿠키로 둔 이유
--    → accessToken이 JS에서 안 보이면 XSS로 훔치기 어렵지만 매 요청에 넣기 번거로우므로, 짧은 수명의 access는 상태로 두고
--    → 장기 수명의 refresh는 쿠키에만 두어 서버가 재발급할 때만 사용.
--
--  · axios 인터셉터에서 401 나오면 /auth/refresh 호출하는 이유
--    → accessToken 만료 시 자동으로 갱신 후 원래 요청을 다시 보내서 사용자가 로그아웃되지 않게 하려고.
--
--  · 로그인/리프레시 시 BANNED_* 인 회원은 로그인 차단하는 이유
--    → 정지 회원이 토큰만 있으면 API를 쓰는 것을 막으려고. MemberController에서 mb_rol 확인 후 403 + 메시지 반환.
--
--  · 필요한 것: JwtTokenProvider, 쿠키 설정(withCredentials), SecurityConfig에서 permitAll/authenticated 경로 구분
--
--
-- ■ 6. DB·엔티티
--
--  · JPA Entity와 MyBatis DAO를 같이 쓰는 이유
--    → 단순 CRUD·연관관계는 JPA Repository로, 복잡한 조건 검색·집계는 MyBatis XML로 작성하기 위해.
--
--  · Member 엔티티에 mb_status, mb_ban_until을 넣지 않은 이유
--    → 운영 DB에 해당 컬럼이 없어서 추가 마이그레이션 없이 mb_rol만으로 정지/기간을 표현하도록 함.
--
--  · 필요한 것: JPA Repository, MyBatis Mapper, DDL과 엔티티 필드 일치

