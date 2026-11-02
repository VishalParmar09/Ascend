package com.ascend.hunter.security;

import com.ascend.hunter.repository.HunterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class HunterDetailsService implements UserDetailsService {

    private final HunterRepository hunterRepository;

    @Override
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        return hunterRepository.findByUsernameOrEmail(identifier)
                .orElseThrow(() -> new UsernameNotFoundException("Hunter not found with codename or email: " + identifier));
    }
}
