package com.sms.dto.response;

import java.time.Instant;
import java.util.List;

public class QuizDto {

    private Long id;
    private Long classId;
    private String className;
    private String subject;
    private String teacherName;
    private String title;
    private String description;
    private Integer pointsReward;
    private int questionCount;
    private boolean hasSubmitted;
    private Integer previousScore;
    private Integer previousPointsEarned;
    private Instant createdAt;
    private List<QuizQuestionDto> questions;

    public QuizDto() {
    }

    public QuizDto(Long id, Long classId, String className, String subject, String teacherName, String title,
                   String description, Integer pointsReward, int questionCount, boolean hasSubmitted,
                   Integer previousScore, Integer previousPointsEarned, Instant createdAt, List<QuizQuestionDto> questions) {
        this.id = id;
        this.classId = classId;
        this.className = className;
        this.subject = subject;
        this.teacherName = teacherName;
        this.title = title;
        this.description = description;
        this.pointsReward = pointsReward;
        this.questionCount = questionCount;
        this.hasSubmitted = hasSubmitted;
        this.previousScore = previousScore;
        this.previousPointsEarned = previousPointsEarned;
        this.createdAt = createdAt;
        this.questions = questions;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getClassId() {
        return classId;
    }

    public void setClassId(Long classId) {
        this.classId = classId;
    }

    public String getClassName() {
        return className;
    }

    public void setClassName(String className) {
        this.className = className;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getTeacherName() {
        return teacherName;
    }

    public void setTeacherName(String teacherName) {
        this.teacherName = teacherName;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getPointsReward() {
        return pointsReward;
    }

    public void setPointsReward(Integer pointsReward) {
        this.pointsReward = pointsReward;
    }

    public int getQuestionCount() {
        return questionCount;
    }

    public void setQuestionCount(int questionCount) {
        this.questionCount = questionCount;
    }

    public boolean isHasSubmitted() {
        return hasSubmitted;
    }

    public void setHasSubmitted(boolean hasSubmitted) {
        this.hasSubmitted = hasSubmitted;
    }

    public Integer getPreviousScore() {
        return previousScore;
    }

    public void setPreviousScore(Integer previousScore) {
        this.previousScore = previousScore;
    }

    public Integer getPreviousPointsEarned() {
        return previousPointsEarned;
    }

    public void setPreviousPointsEarned(Integer previousPointsEarned) {
        this.previousPointsEarned = previousPointsEarned;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public List<QuizQuestionDto> getQuestions() {
        return questions;
    }

    public void setQuestions(List<QuizQuestionDto> questions) {
        this.questions = questions;
    }
}

