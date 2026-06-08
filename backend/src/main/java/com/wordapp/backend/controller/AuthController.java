package com.wordapp.backend.controller;

import com.wordapp.backend.dto.LoginRequest;
import com.wordapp.backend.dto.RegisterRequest;
import com.wordapp.backend.entity.AppUser;
import com.wordapp.backend.repository.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AppUserRepository appUserRepository;

    @PostMapping("/register")
    public AppUser register(@RequestBody RegisterRequest request) {

        if (appUserRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("이미 존재하는 아이디입니다.");
        }

        AppUser user = new AppUser();
        user.setUsername(request.getUsername());
        user.setPassword(request.getPassword());
        user.setRole("STUDENT");

        return appUserRepository.save(user);
    }

    @PostMapping("/login")
    public AppUser login(@RequestBody LoginRequest request) {

        AppUser user = appUserRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("아이디가 존재하지 않습니다."));

        if (!user.getPassword().equals(request.getPassword())) {
            throw new RuntimeException("비밀번호가 틀렸습니다.");
        }

        return user;
    }
}