package com.sms.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

public class CreateQuizRequest {

    @NotNull(message = "Classroom ID is required")
    private Long classId;

    @NotBlank(message = "Quiz title is required")
    @Size(max = 150, message = "Quiz title must not exceed 150 characters")
    private String title;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;

    @NotNull(message = "Points reward is required")
    private Integer pointsReward = 10;

    @NotEmpty(message = "Quiz must have at least one question")
    @Valid
    private List<CreateQuizQuestionRequest> questions;

    public CreateQuizRequest() {
    }

    public Long getClassId() {
        return classId;
    }

    public void setClassId(Long classId) {
        this.classId = classId;
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

    public List<CreateQuizQuestionRequest> getQuestions() {
        return questions;
    }

    public void setQuestions(List<CreateQuizQuestionRequest> questions) {
        this.questions = questions;
    }
}

