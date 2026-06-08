package com.wordapp.backend.controller;

import com.wordapp.backend.dto.StudyHistoryResponse;
import com.wordapp.backend.entity.AppUser;
import com.wordapp.backend.entity.StudyHistory;
import com.wordapp.backend.repository.AppUserRepository;
import com.wordapp.backend.repository.StudyHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/histories")
@RequiredArgsConstructor
public class StudyHistoryController {

    private final StudyHistoryRepository studyHistoryRepository;
    private final AppUserRepository appUserRepository;

    @PostMapping
    public StudyHistory createHistory(@RequestBody StudyHistory history) {

        AppUser user = appUserRepository.findById(history.getUser().getId())
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        history.setUser(user);

        return studyHistoryRepository.save(history);
    }

    @GetMapping
    public List<StudyHistoryResponse> getHistories() {
        return studyHistoryRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(h -> new StudyHistoryResponse(
                        h.getId(),
                        h.getUser().getUsername(),
                        h.getQuizMode(),
                        h.getQuizType(),
                        h.getScore(),
                        h.getTotalQuestion(),
                        h.getCreatedAt()
                ))
                .toList();
    }
}