package com.wordapp.backend.repository;

import com.wordapp.backend.entity.Word;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WordRepository extends JpaRepository<Word, Long> {

    List<Word> findByWordSetId(Long wordSetId);
}