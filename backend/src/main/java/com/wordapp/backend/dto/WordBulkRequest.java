package com.wordapp.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class WordBulkRequest {

    private Long wordSetId;

    private String text;
}