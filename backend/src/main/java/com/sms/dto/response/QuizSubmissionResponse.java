package com.sms.dto.response;

import java.time.Instant;

public class QuizSubmissionResponse {

    private Long submissionId;
    private Long quizId;
    private String quizTitle;
    private int score;
    private int totalQuestions;
    private int pointsEarned;
    private int newTotalPoints;
    private Instant submittedAt;

    public QuizSubmissionResponse() {
    }

    public QuizSubmissionResponse(Long submissionId, Long quizId, String quizTitle, int score,
                                  int totalQuestions, int pointsEarned, int newTotalPoints, Instant submittedAt) {
        this.submissionId = submissionId;
        this.quizId = quizId;
        this.quizTitle = quizTitle;
        this.score = score;
        this.totalQuestions = totalQuestions;
        this.pointsEarned = pointsEarned;
        this.newTotalPoints = newTotalPoints;
        this.submittedAt = submittedAt;
    }

    public Long getSubmissionId() {
        return submissionId;
    }

    public void setSubmissionId(Long submissionId) {
        this.submissionId = submissionId;
    }

    public Long getQuizId() {
        return quizId;
    }

    public void setQuizId(Long quizId) {
        this.quizId = quizId;
    }

    public String getQuizTitle() {
        return quizTitle;
    }

    public void setQuizTitle(String quizTitle) {
        this.quizTitle = quizTitle;
    }

    public int getScore() {
        return score;
    }

    public void setScore(int score) {
        this.score = score;
    }

    public int getTotalQuestions() {
        return totalQuestions;
    }

    public void setTotalQuestions(int totalQuestions) {
        this.totalQuestions = totalQuestions;
    }

    public int getPointsEarned() {
        return pointsEarned;
    }

    public void setPointsEarned(int pointsEarned) {
        this.pointsEarned = pointsEarned;
    }

    public int getNewTotalPoints() {
        return newTotalPoints;
    }

    public void setNewTotalPoints(int newTotalPoints) {
        this.newTotalPoints = newTotalPoints;
    }

    public Instant getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(Instant submittedAt) {
        this.submittedAt = submittedAt;
    }
}

