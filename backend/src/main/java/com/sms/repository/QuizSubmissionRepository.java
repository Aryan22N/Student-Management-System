package com.sms.repository;

import com.sms.model.entity.QuizSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuizSubmissionRepository extends JpaRepository<QuizSubmission, Long> {

    Optional<QuizSubmission> findByQuizIdAndStudentId(Long quizId, Long studentId);

    boolean existsByQuizIdAndStudentId(Long quizId, Long studentId);

    List<QuizSubmission> findByStudentId(Long studentId);
}

