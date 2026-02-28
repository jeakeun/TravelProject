const STORAGE_KEY_PREFIX = "recentViewedPosts_";
const MAX_ITEMS = 20;

/**
 * 최근 본 게시글 추가 (post detail 방문 시 호출)
 * @param {{ boardType: string, poNum: number, poTitle: string }} item
 * @param {number|string|null} userId - 로그인 회원 번호 (mb_num). 없으면 저장 안 함 (회원별 분리)
 */
export function addRecentView(item, userId) {
  if (!item?.boardType || item.poNum == null || userId == null || userId === "") return;
  try {
    const key = STORAGE_KEY_PREFIX + String(userId);
    const raw = localStorage.getItem(key);
    const list = raw ? JSON.parse(raw) : [];
    const newItem = {
      boardType: item.boardType,
      poNum: item.poNum,
      poTitle: (item.poTitle || "").slice(0, 80),
      viewedAt: Date.now(),
    };
    const filtered = list.filter(
      (x) => !(x.boardType === newItem.boardType && x.poNum === newItem.poNum)
    );
    filtered.unshift(newItem);
    localStorage.setItem(key, JSON.stringify(filtered.slice(0, MAX_ITEMS)));
  } catch (_) {}
}

/**
 * 최근 본 게시글 목록 (최신순, 최대 5개)
 * @param {number} limit
 * @param {number|string|null} userId - 로그인 회원 번호 (mb_num). 없으면 빈 배열 반환 (회원별 분리)
 */
export function getRecentViews(limit = 5, userId = null) {
  if (userId == null || userId === "") return [];
  try {
    const key = STORAGE_KEY_PREFIX + String(userId);
    const raw = localStorage.getItem(key);
    const list = raw ? JSON.parse(raw) : [];
    return list.slice(0, limit);
  } catch (_) {
    return [];
  }
}
