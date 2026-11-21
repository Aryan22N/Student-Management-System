package com.sms.repository;

import com.sms.model.entity.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long> {

    List<Quiz> findByClassRoomIdOrderByCreatedAtDesc(Long classId);

    List<Quiz> findByTeacherIdOrderByCreatedAtDesc(Long teacherId);

    @Query("SELECT q FROM Quiz q WHERE q.classRoom.id IN " +
           "(SELECT ce.classRoom.id FROM ClassEnrollment ce WHERE ce.student.id = :studentId) " +
           "ORDER BY q.createdAt DESC")
    List<Quiz> findQuizzesForStudent(@Param("studentId") Long studentId);
}

