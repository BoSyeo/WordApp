package com.wordapp.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "words")
public class Word {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String english;

    @Column(columnDefinition = "TEXT")
    private String korean;

    @ManyToOne
    @JoinColumn(name = "word_set_id")
    private WordSet wordSet;

    private LocalDateTime createdAt = LocalDateTime.now();
}