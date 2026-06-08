package com.wordapp.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AnswerCheckResponse {

    private boolean correct;
    private String correctAnswer;
}