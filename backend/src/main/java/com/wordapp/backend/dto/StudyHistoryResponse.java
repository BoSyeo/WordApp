package com.wordapp.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class StudyHistoryResponse {

    private Long id;

    private String username;

    private String quizMode;

    private String quizType;

    private int score;

    private int totalQuestion;

    private LocalDateTime createdAt;
}