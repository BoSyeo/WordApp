package com.wordapp.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AnswerCheckRequest {

    private Long wordId;
    private String answer;
    private boolean reviewMode;
    private Long userId;
}