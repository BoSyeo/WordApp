package com.wordapp.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class WrongAnswerResponse {

    private Long wrongAnswerId;

    private Long wordId;

    private String english;

    private String correctAnswer;
}