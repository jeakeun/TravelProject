package kr.hi.travel_community.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import kr.hi.travel_community.dao.MemberDAO;
import kr.hi.travel_community.model.util.CustomUser;
import kr.hi.travel_community.model.vo.MemberVO;

@Service
public class MemberDetailService implements UserDetailsService {

	@Autowired
	MemberDAO memberDao;

	@Override
	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
		MemberVO member = memberDao.selectMemberById(username);

		// ✅ 기존 흐름 유지하되, Spring Security 표준대로 예외 처리만 추가
		if (member == null) {
			throw new UsernameNotFoundException("User not found: " + username);
		}

		return new CustomUser(member);
	}
}
