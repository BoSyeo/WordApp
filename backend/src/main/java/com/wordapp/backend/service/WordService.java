package com.wordapp.backend.service;

import com.wordapp.backend.entity.Word;
import com.wordapp.backend.repository.WordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.wordapp.backend.entity.WordSet;
import com.wordapp.backend.repository.WordSetRepository;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WordService {

    private final WordRepository wordRepository;
    private final WordSetRepository wordSetRepository;

    public List<Word> saveWordsFromText(Long wordSetId, String text) {
        WordSet wordSet = wordSetRepository.findById(wordSetId).orElseThrow(() -> new RuntimeException("단어장을 찾을 수 없습니다."));
        List<Word> words = new ArrayList<>();

        String[] lines = text.split("\\r?\\n");

        for (String line : lines) {
            line = line.trim();

            if (line.isEmpty()) {
                continue;
            }

            int koreanIndex = findFirstKoreanIndex(line);

            if (koreanIndex == -1) {
                continue;
            }

            String english = line.substring(0, koreanIndex).trim();
            String korean = line.substring(koreanIndex).trim();

            if (english.isEmpty() || korean.isEmpty()) {
                continue;
            }

            Word word = new Word();
            word.setEnglish(english);
            word.setKorean(korean);
            word.setWordSet(wordSet);
            
            words.add(word);
        }

        return wordRepository.saveAll(words);
    }

    private int findFirstKoreanIndex(String text) {
        for (int i = 0; i < text.length(); i++) {
            char ch = text.charAt(i);

            if (ch >= '가' && ch <= '힣') {
                return i;
            }
        }

        return -1;
    }
}