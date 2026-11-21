package com.sms.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class CreateQuizQuestionRequest {

    @NotBlank(message = "Question text is required")
    @Size(max = 500, message = "Question text must not exceed 500 characters")
    private String questionText;

    @NotBlank(message = "Option A is required")
    @Size(max = 200, message = "Option A must not exceed 200 characters")
    private String optionA;

    @NotBlank(message = "Option B is required")
    @Size(max = 200, message = "Option B must not exceed 200 characters")
    private String optionB;

    @NotBlank(message = "Option C is required")
    @Size(max = 200, message = "Option C must not exceed 200 characters")
    private String optionC;

    @NotBlank(message = "Option D is required")
    @Size(max = 200, message = "Option D must not exceed 200 characters")
    private String optionD;

    @NotBlank(message = "Correct option is required")
    @Pattern(regexp = "^[ABCDabcd]$", message = "Correct option must be A, B, C, or D")
    private String correctOption;

    @NotNull(message = "Points value is required")
    private Integer points = 5;

    public CreateQuizQuestionRequest() {
    }

    public String getQuestionText() {
        return questionText;
    }

    public void setQuestionText(String questionText) {
        this.questionText = questionText;
    }

    public String getOptionA() {
        return optionA;
    }

    public void setOptionA(String optionA) {
        this.optionA = optionA;
    }

    public String getOptionB() {
        return optionB;
    }

    public void setOptionB(String optionB) {
        this.optionB = optionB;
    }

    public String getOptionC() {
        return optionC;
    }

    public void setOptionC(String optionC) {
        this.optionC = optionC;
    }

    public String getOptionD() {
        return optionD;
    }

    public void setOptionD(String optionD) {
        this.optionD = optionD;
    }

    public String getCorrectOption() {
        return correctOption;
    }

    public void setCorrectOption(String correctOption) {
        this.correctOption = correctOption;
    }

    public Integer getPoints() {
        return points;
    }

    public void setPoints(Integer points) {
        this.points = points;
    }
}

