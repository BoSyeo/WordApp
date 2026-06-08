package com.wordapp.backend.controller;

import com.wordapp.backend.dto.CreateWordSetRequest;
import com.wordapp.backend.entity.WordSet;
import com.wordapp.backend.repository.WordSetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import com.wordapp.backend.entity.Word;
import com.wordapp.backend.repository.WordRepository;

import java.util.List;

@RestController
@RequestMapping("/api/wordsets")
@RequiredArgsConstructor
public class WordSetController {

    private final WordRepository wordRepository;
    private final WordSetRepository wordSetRepository;

    @PostMapping
    public WordSet createWordSet(@RequestBody CreateWordSetRequest request) {

        WordSet wordSet = new WordSet();
        wordSet.setTitle(request.getTitle());

        return wordSetRepository.save(wordSet);
    }

    @GetMapping
    public List<WordSet> getWordSets() {
        return wordSetRepository.findAll();
    }

    @GetMapping("/{id}/words")
    public List<Word> getWordsByWordSet(@PathVariable Long id) {
        return wordRepository.findByWordSetId(id);
    }

    @DeleteMapping("/{id}")
    public String deleteWordSet(@PathVariable Long id) {
        wordSetRepository.deleteById(id);
        return "deleted";
    }

    @PutMapping("/{id}")
    public WordSet updateWordSet(
            @PathVariable Long id,
            @RequestBody WordSet updatedWordSet
    ) {

        WordSet wordSet = wordSetRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("단어장을 찾을 수 없습니다."));

        wordSet.setTitle(updatedWordSet.getTitle());

        return wordSetRepository.save(wordSet);
    }
}