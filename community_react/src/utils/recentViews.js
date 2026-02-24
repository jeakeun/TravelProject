const STORAGE_KEY = "recentViewedPosts";
const MAX_ITEMS = 20;

/**
 * 최근 본 게시글 추가 (post detail 방문 시 호출)
 * @param {{ boardType: string, poNum: number, poTitle: string }} item
 */
export function addRecentView(item) {
  if (!item?.boardType || item.poNum == null) return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered.slice(0, MAX_ITEMS)));
  } catch (_) {}
}

/**
 * 최근 본 게시글 목록 (최신순, 최대 5개)
 */
export function getRecentViews(limit = 5) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return list.slice(0, limit);
  } catch (_) {
    return [];
  }
}
