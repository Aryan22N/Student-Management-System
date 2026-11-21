package com.sms.controller;

import com.sms.common.response.ApiResponse;
import com.sms.dto.request.CreateQuizRequest;
import com.sms.dto.request.SubmitQuizRequest;
import com.sms.dto.response.QuizDto;
import com.sms.dto.response.QuizSubmissionResponse;
import com.sms.security.UserPrincipal;
import com.sms.service.QuizService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/quizzes")
public class QuizController {

    private final QuizService quizService;

    public QuizController(QuizService quizService) {
        this.quizService = quizService;
    }

    @PostMapping
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<QuizDto>> createQuiz(
            @Valid @RequestBody CreateQuizRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        QuizDto quiz = quizService.createQuiz(principal.getProfileId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Quiz created successfully", quiz));
    }

    @GetMapping("/class/{classId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<QuizDto>>> getQuizzesByClass(
            @PathVariable Long classId,
            @AuthenticationPrincipal UserPrincipal principal) {
        List<QuizDto> quizzes = quizService.getQuizzesByClass(classId, principal);
        return ResponseEntity.ok(ApiResponse.success(quizzes));
    }

    @GetMapping("/student/pending")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<List<QuizDto>>> getQuizzesForStudent(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<QuizDto> quizzes = quizService.getQuizzesForStudent(principal.getProfileId());
        return ResponseEntity.ok(ApiResponse.success(quizzes));
    }

    @PostMapping("/{quizId}/submit")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<QuizSubmissionResponse>> submitQuiz(
            @PathVariable Long quizId,
            @Valid @RequestBody SubmitQuizRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        QuizSubmissionResponse response = quizService.submitQuiz(principal.getProfileId(), quizId, request);
        return ResponseEntity.ok(ApiResponse.success("Quiz submitted successfully", response));
    }
}

