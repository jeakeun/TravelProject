/** 회원가입 폼 검증/알림 메시지 - 사용 중인 언어에 따라 표시 */
export const signupMessages = {
  KR: {
    id_required: "아이디를 입력하세요.",
    pw_required: "비밀번호를 입력하세요.",
    pw_mismatch: "비밀번호가 일치하지 않습니다.",
    email_required: "이메일을 입력하세요.",
    agree_required: "개인정보 처리방침에 동의해주세요.",
    network_error: "서버와 통신 중 오류가 발생했습니다.",
    kakao_unavailable: "카카오 로그인을 사용할 수 없습니다. 페이지를 새로고침 후 다시 시도하세요.",
  },
  EN: {
    id_required: "Please enter your ID.",
    pw_required: "Please enter your password.",
    pw_mismatch: "Passwords do not match.",
    email_required: "Please enter your email.",
    agree_required: "Please agree to the privacy policy.",
    network_error: "A network error occurred.",
    kakao_unavailable: "Kakao login is unavailable. Please refresh the page and try again.",
  },
  JP: {
    id_required: "IDを入力してください。",
    pw_required: "パスワードを入力してください。",
    pw_mismatch: "パスワードが一致しません。",
    email_required: "メールアドレスを入力してください。",
    agree_required: "個人情報処理方針に同意してください。",
    network_error: "通信エラーが発生しました。",
    kakao_unavailable: "カカオログインが利用できません。ページを更新して再度お試しください。",
  },
  CH: {
    id_required: "请输入用户名。",
    pw_required: "请输入密码。",
    pw_mismatch: "两次密码不一致。",
    email_required: "请输入邮箱地址。",
    agree_required: "请同意隐私政策。",
    network_error: "网络通信出错。",
    kakao_unavailable: "无法使用 Kakao 登录，请刷新页面后重试。",
  },
};
