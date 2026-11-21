package com.sms.dto.request;

import jakarta.validation.constraints.NotEmpty;
import java.util.Map;

public class SubmitQuizRequest {

    @NotEmpty(message = "Quiz submission must include answers")
    private Map<Long, String> answers; // questionId -> selectedOption ("A", "B", "C", "D")

    public SubmitQuizRequest() {
    }

    public Map<Long, String> getAnswers() {
        return answers;
    }

    public void setAnswers(Map<Long, String> answers) {
        this.answers = answers;
    }
}

