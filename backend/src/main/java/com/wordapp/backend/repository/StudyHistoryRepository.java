package com.wordapp.backend.repository;

import com.wordapp.backend.entity.StudyHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudyHistoryRepository
        extends JpaRepository<StudyHistory, Long> {

    List<StudyHistory> findAllByOrderByCreatedAtDesc();
}