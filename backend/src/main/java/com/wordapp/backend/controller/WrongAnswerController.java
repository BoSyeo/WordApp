package com.wordapp.backend.controller;

import com.wordapp.backend.dto.WrongAnswerResponse;
import com.wordapp.backend.repository.WrongAnswerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import org.springframework.transaction.annotation.Transactional;

@RestController
@RequestMapping("/api/wrong-answers")
@RequiredArgsConstructor
public class WrongAnswerController {

    private final WrongAnswerRepository wrongAnswerRepository;

    @GetMapping
    public List<WrongAnswerResponse> getWrongAnswers(@RequestParam Long userId) {
        return wrongAnswerRepository
                .findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(w -> new WrongAnswerResponse(
                        w.getId(),
                        w.getWord().getId(),
                        w.getWord().getEnglish(),
                        w.getWord().getKorean()
                ))
                .toList();
    }

    @DeleteMapping("/{id}")
    public String deleteWrongAnswer(@PathVariable Long id) {
        wrongAnswerRepository.deleteById(id);
        return "deleted";
    }

    @Transactional
    @DeleteMapping("/word/{wordId}")
    public void deleteWrongAnswersByWordId(
            @PathVariable Long wordId,
            @RequestParam Long userId
    ) {
        wrongAnswerRepository.deleteAllByWordIdAndUserId(wordId, userId);
    }
}