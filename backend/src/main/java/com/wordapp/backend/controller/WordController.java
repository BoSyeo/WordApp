package com.wordapp.backend.controller;

import com.wordapp.backend.dto.WordBulkRequest;
import com.wordapp.backend.entity.AppUser;
import com.wordapp.backend.entity.Word;
import com.wordapp.backend.repository.WordRepository;
import com.wordapp.backend.service.WordService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import com.wordapp.backend.dto.AnswerCheckRequest;
import com.wordapp.backend.dto.AnswerCheckResponse;
import com.wordapp.backend.entity.WrongAnswer;
import com.wordapp.backend.repository.WrongAnswerRepository;

import java.util.Arrays;
import java.util.List;

import com.wordapp.backend.repository.AppUserRepository;

@RestController
@RequestMapping("/api/words")
@RequiredArgsConstructor
public class WordController {

    private final WordService wordService;
    private final WordRepository wordRepository;
    private final WrongAnswerRepository wrongAnswerRepository;

    private final AppUserRepository appUserRepository;

    @PostMapping("/bulk")
    public List<Word> saveWords(@RequestBody WordBulkRequest request) {
        return wordService.saveWordsFromText(
        request.getWordSetId(),
        request.getText()
);
    }

    @GetMapping
    public List<Word> getWords() {
        return wordRepository.findAll();
    }

    @DeleteMapping("/{id}")
    public String deleteWord(@PathVariable Long id) {
        wordRepository.deleteById(id);
        return "deleted";
    }

    @PostMapping("/check")
    public AnswerCheckResponse checkAnswer(@RequestBody AnswerCheckRequest request) {

        Word word = wordRepository.findById(request.getWordId())
                .orElse(null);

        if (word == null) {
            return new AnswerCheckResponse(false, "단어를 찾을 수 없습니다.");
        }

        String correctAnswer = word.getKorean().trim();
        String userAnswer = request.getAnswer().trim();

        boolean correct = Arrays.stream(correctAnswer.split(","))
            .map(this::normalizeAnswer)
            .anyMatch(answer ->
                    answer.equals(normalizeAnswer(userAnswer)));

        if (!correct && !request.isReviewMode()) {
            AppUser user = appUserRepository.findById(request.getUserId())
                    .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

            WrongAnswer wrongAnswer = new WrongAnswer();
            wrongAnswer.setWord(word);
            wrongAnswer.setUser(user);
            wrongAnswer.setUserAnswer(userAnswer);

            wrongAnswerRepository.save(wrongAnswer);
        }

        return new AnswerCheckResponse(correct, correctAnswer);
    }

    @PutMapping("/{id}")
    public Word updateWord(@PathVariable Long id, @RequestBody Word updatedWord) {
        Word word = wordRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("단어를 찾을 수 없습니다."));

        word.setEnglish(updatedWord.getEnglish());
        word.setKorean(updatedWord.getKorean());

        return wordRepository.save(word);
    }

    private String normalizeAnswer(String answer) {

        answer = answer
                .replace("(명사)", "")
                .replace("(동사)", "")
                .replace("(형용사)", "")
                .replace("(부사)", "");

        return answer
                .replaceAll("[^가-힣a-zA-Z0-9]", "")
                .trim()
                .toLowerCase();
    }
}