package com.sms.model.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "quiz_submissions", uniqueConstraints = {
        @UniqueConstraint(name = "uq_quiz_student", columnNames = {"quiz_id", "student_id"})
})
public class QuizSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private StudentProfile student;

    @Column(nullable = false)
    private Integer score;

    @Column(name = "total_questions", nullable = false)
    private Integer totalQuestions;

    @Column(name = "points_earned", nullable = false)
    private Integer pointsEarned;

    @Column(name = "submitted_at", nullable = false, updatable = false)
    private Instant submittedAt;

    public QuizSubmission() {
    }

    public QuizSubmission(Quiz quiz, StudentProfile student, Integer score, Integer totalQuestions, Integer pointsEarned) {
        this.quiz = quiz;
        this.student = student;
        this.score = score;
        this.totalQuestions = totalQuestions;
        this.pointsEarned = pointsEarned;
    }

    @PrePersist
    protected void onCreate() {
        this.submittedAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Quiz getQuiz() {
        return quiz;
    }

    public void setQuiz(Quiz quiz) {
        this.quiz = quiz;
    }

    public StudentProfile getStudent() {
        return student;
    }

    public void setStudent(StudentProfile student) {
        this.student = student;
    }

    public Integer getScore() {
        return score;
    }

    public void setScore(Integer score) {
        this.score = score;
    }

    public Integer getTotalQuestions() {
        return totalQuestions;
    }

    public void setTotalQuestions(Integer totalQuestions) {
        this.totalQuestions = totalQuestions;
    }

    public Integer getPointsEarned() {
        return pointsEarned;
    }

    public void setPointsEarned(Integer pointsEarned) {
        this.pointsEarned = pointsEarned;
    }

    public Instant getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(Instant submittedAt) {
        this.submittedAt = submittedAt;
    }
}

