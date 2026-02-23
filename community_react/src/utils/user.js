/**
 * 서버 응답이 mb_Uid / mb_uid 둘 다 올 수 있으므로 한 곳에서만 처리
 * (DB/Jackson에 따라 키가 다를 수 있음)
 */
export function getUserId(userOrMember) {
  if (!userOrMember || typeof userOrMember !== 'object') return '';
  return userOrMember.mb_Uid ?? userOrMember.mb_uid ?? '';
}

/** 회원 번호 (mb_num / mbNum) */
export function getMemberNum(userOrMember) {
  if (!userOrMember || typeof userOrMember !== 'object') return null;
  const num = userOrMember.mbNum ?? userOrMember.mb_num;
  return num != null ? Number(num) : null;
}
