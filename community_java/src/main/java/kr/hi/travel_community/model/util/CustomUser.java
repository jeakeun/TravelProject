package kr.hi.travel_community.model.util;

import java.util.Arrays;
import java.util.Collection;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;

import kr.hi.travel_community.model.vo.MemberVO;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CustomUser extends User {

	private MemberVO member;

	public CustomUser(String username, String password, Collection<? extends GrantedAuthority> authorities) {
		super(username, password, authorities);
	}

	public CustomUser(MemberVO vo) {
		super(vo.getMb_Uid(),
				vo.getMb_pw(),
				Arrays.asList(new SimpleGrantedAuthority(
						vo.getMb_rol() != null ? vo.getMb_rol() : UserRole.USER.name())));
		this.member = vo;
	}
}
