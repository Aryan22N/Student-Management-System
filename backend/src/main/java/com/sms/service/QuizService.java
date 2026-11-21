package com.sms.service;

import com.sms.dto.request.CreateQuizRequest;
import com.sms.dto.request.SubmitQuizRequest;
import com.sms.dto.response.QuizDto;
import com.sms.dto.response.QuizSubmissionResponse;
import com.sms.security.UserPrincipal;

import java.util.List;

public interface QuizService {

    QuizDto createQuiz(Long teacherProfileId, CreateQuizRequest request);

    List<QuizDto> getQuizzesByClass(Long classId, UserPrincipal principal);

    List<QuizDto> getQuizzesForStudent(Long studentProfileId);

    QuizSubmissionResponse submitQuiz(Long studentProfileId, Long quizId, SubmitQuizRequest request);
}

