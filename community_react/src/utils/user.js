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

/** 관리자 여부 (mb_rol === 'ADMIN' 또는 mb_score >= 10) */
export function isAdmin(userOrMember) {
  if (!userOrMember || typeof userOrMember !== 'object') return false;
  const rol = userOrMember.mb_rol ?? userOrMember.mbRol ?? '';
  const score = Number(userOrMember.mb_score ?? userOrMember.mbScore ?? 0);
  return String(rol).toUpperCase() === 'ADMIN' || score >= 10;
}
