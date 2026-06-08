package com.wordapp.backend.repository;

import com.wordapp.backend.entity.WrongAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface WrongAnswerRepository
        extends JpaRepository<WrongAnswer, Long> {

    List<WrongAnswer> findAllByOrderByCreatedAtDesc();

    List<WrongAnswer> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Modifying
    @Query("DELETE FROM WrongAnswer w WHERE w.word.id = :wordId")
    void deleteAllByWordId(Long wordId);

    @Modifying
    @Query("DELETE FROM WrongAnswer w WHERE w.word.id = :wordId AND w.user.id = :userId")
    void deleteAllByWordIdAndUserId(Long wordId, Long userId);
}