package com.wordapp.backend.repository;

import com.wordapp.backend.entity.WordSet;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WordSetRepository extends JpaRepository<WordSet, Long> {
}