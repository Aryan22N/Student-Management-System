package com.sms.service.impl;

import com.sms.common.exception.BadRequestException;
import com.sms.common.exception.ForbiddenException;
import com.sms.common.exception.ResourceNotFoundException;
import com.sms.dto.request.CreateQuizQuestionRequest;
import com.sms.dto.request.CreateQuizRequest;
import com.sms.dto.request.SubmitQuizRequest;
import com.sms.dto.response.QuizDto;
import com.sms.dto.response.QuizQuestionDto;
import com.sms.dto.response.QuizSubmissionResponse;
import com.sms.model.entity.*;
import com.sms.model.enums.Role;
import com.sms.model.enums.TransactionType;
import com.sms.repository.*;
import com.sms.security.UserPrincipal;
import com.sms.service.QuizService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class QuizServiceImpl implements QuizService {

    private final QuizRepository quizRepository;
    private final QuizSubmissionRepository quizSubmissionRepository;
    private final ClassRoomRepository classRoomRepository;
    private final ClassEnrollmentRepository classEnrollmentRepository;
    private final TeacherProfileRepository teacherProfileRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final PointTransactionRepository pointTransactionRepository;

    public QuizServiceImpl(QuizRepository quizRepository,
                           QuizSubmissionRepository quizSubmissionRepository,
                           ClassRoomRepository classRoomRepository,
                           ClassEnrollmentRepository classEnrollmentRepository,
                           TeacherProfileRepository teacherProfileRepository,
                           StudentProfileRepository studentProfileRepository,
                           PointTransactionRepository pointTransactionRepository) {
        this.quizRepository = quizRepository;
        this.quizSubmissionRepository = quizSubmissionRepository;
        this.classRoomRepository = classRoomRepository;
        this.classEnrollmentRepository = classEnrollmentRepository;
        this.teacherProfileRepository = teacherProfileRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.pointTransactionRepository = pointTransactionRepository;
    }

    @Override
    @Transactional
    public QuizDto createQuiz(Long teacherProfileId, CreateQuizRequest request) {
        ClassRoom classRoom = classRoomRepository.findById(request.getClassId())
                .orElseThrow(() -> new ResourceNotFoundException("ClassRoom", "id", request.getClassId()));

        if (!classRoom.getTeacher().getId().equals(teacherProfileId)) {
            throw new ForbiddenException("Access Denied: You can only create quizzes for classrooms you teach.");
        }

        TeacherProfile teacher = teacherProfileRepository.findById(teacherProfileId)
                .orElseThrow(() -> new ResourceNotFoundException("TeacherProfile", "id", teacherProfileId));

        Quiz quiz = new Quiz(
                classRoom,
                teacher,
                request.getTitle().trim(),
                request.getDescription() != null ? request.getDescription().trim() : null,
                request.getPointsReward() != null ? request.getPointsReward() : 10
        );

        int order = 1;
        for (CreateQuizQuestionRequest qReq : request.getQuestions()) {
            QuizQuestion question = new QuizQuestion(
                    qReq.getQuestionText().trim(),
                    qReq.getOptionA().trim(),
                    qReq.getOptionB().trim(),
                    qReq.getOptionC().trim(),
                    qReq.getOptionD().trim(),
                    qReq.getCorrectOption().trim().toUpperCase(),
                    qReq.getPoints() != null ? qReq.getPoints() : 5,
                    order++
            );
            quiz.addQuestion(question);
        }

        Quiz savedQuiz = quizRepository.save(quiz);
        return mapToDto(savedQuiz, true, null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuizDto> getQuizzesByClass(Long classId, UserPrincipal principal) {
        ClassRoom classRoom = classRoomRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("ClassRoom", "id", classId));

        boolean isTeacher = principal.getRole() == Role.TEACHER;
        Long studentProfileId = !isTeacher ? principal.getProfileId() : null;

        if (isTeacher) {
            if (!classRoom.getTeacher().getId().equals(principal.getProfileId())) {
                throw new ForbiddenException("Access Denied: You are not the instructor of this class.");
            }
        } else {
            boolean isEnrolled = classEnrollmentRepository.existsByClassRoomIdAndStudentId(classId, studentProfileId);
            if (!isEnrolled) {
                throw new ForbiddenException("Access Denied: You are not enrolled in this class.");
            }
        }

        List<Quiz> quizzes = quizRepository.findByClassRoomIdOrderByCreatedAtDesc(classId);

        Map<Long, QuizSubmission> submissionMap = new HashMap<>();
        if (!isTeacher && studentProfileId != null) {
            List<QuizSubmission> submissions = quizSubmissionRepository.findByStudentId(studentProfileId);
            for (QuizSubmission sub : submissions) {
                submissionMap.put(sub.getQuiz().getId(), sub);
            }
        }

        return quizzes.stream()
                .map(q -> mapToDto(q, isTeacher, submissionMap.get(q.getId())))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuizDto> getQuizzesForStudent(Long studentProfileId) {
        List<Quiz> quizzes = quizRepository.findQuizzesForStudent(studentProfileId);
        List<QuizSubmission> submissions = quizSubmissionRepository.findByStudentId(studentProfileId);

        Map<Long, QuizSubmission> submissionMap = submissions.stream()
                .collect(Collectors.toMap(s -> s.getQuiz().getId(), s -> s, (s1, s2) -> s1));

        return quizzes.stream()
                .map(q -> mapToDto(q, false, submissionMap.get(q.getId())))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public QuizSubmissionResponse submitQuiz(Long studentProfileId, Long quizId, SubmitQuizRequest request) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz", "id", quizId));

        // Check if student is enrolled in the quiz's class
        boolean isEnrolled = classEnrollmentRepository.existsByClassRoomIdAndStudentId(quiz.getClassRoom().getId(), studentProfileId);
        if (!isEnrolled) {
            throw new ForbiddenException("Access Denied: You must be enrolled in this class to take this quiz.");
        }

        // Check if student has already submitted this quiz
        if (quizSubmissionRepository.existsByQuizIdAndStudentId(quizId, studentProfileId)) {
            throw new BadRequestException("You have already submitted this quiz. Only one attempt is permitted.");
        }

        StudentProfile student = studentProfileRepository.findByIdWithLock(studentProfileId)
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "id", studentProfileId));

        Map<Long, String> userAnswers = request.getAnswers() != null ? request.getAnswers() : Collections.emptyMap();

        int correctCount = 0;
        int totalQuestions = quiz.getQuestions().size();
        int pointsEarned = 0;

        for (QuizQuestion question : quiz.getQuestions()) {
            String chosen = userAnswers.get(question.getId());
            if (chosen != null && chosen.trim().equalsIgnoreCase(question.getCorrectOption())) {
                correctCount++;
                pointsEarned += question.getPoints();
            }
        }

        // Also add the quiz reward bonus if perfect score or at least 1 correct
        if (correctCount == totalQuestions && totalQuestions > 0 && quiz.getPointsReward() > 0) {
            pointsEarned += quiz.getPointsReward();
        }

        // Save submission record
        QuizSubmission submission = new QuizSubmission(
                quiz,
                student,
                correctCount,
                totalQuestions,
                pointsEarned
        );
        QuizSubmission savedSubmission = quizSubmissionRepository.save(submission);

        // If points were earned, record PointTransaction and update student totalPoints atomically
        if (pointsEarned > 0) {
            PointTransaction transaction = new PointTransaction(
                    student,
                    quiz.getTeacher(),
                    pointsEarned,
                    TransactionType.ACADEMIC,
                    String.format("Quiz Completed: %s (Score: %d/%d, +%d pts)", quiz.getTitle(), correctCount, totalQuestions, pointsEarned)
            );
            pointTransactionRepository.save(transaction);

            student.setTotalPoints(student.getTotalPoints() + pointsEarned);
            studentProfileRepository.save(student);
        }

        return new QuizSubmissionResponse(
                savedSubmission.getId(),
                quiz.getId(),
                quiz.getTitle(),
                correctCount,
                totalQuestions,
                pointsEarned,
                student.getTotalPoints(),
                savedSubmission.getSubmittedAt()
        );
    }

    private QuizDto mapToDto(Quiz quiz, boolean includeAnswerKey, QuizSubmission submission) {
        String teacherName = quiz.getTeacher().getUser().getFirstName() + " " + quiz.getTeacher().getUser().getLastName();

        List<QuizQuestionDto> questionDtos = quiz.getQuestions().stream()
                .map(q -> new QuizQuestionDto(
                        q.getId(),
                        q.getQuestionText(),
                        q.getOptionA(),
                        q.getOptionB(),
                        q.getOptionC(),
                        q.getOptionD(),
                        q.getPoints(),
                        includeAnswerKey ? q.getCorrectOption() : null
                ))
                .collect(Collectors.toList());

        boolean hasSubmitted = submission != null;
        Integer prevScore = submission != null ? submission.getScore() : null;
        Integer prevPoints = submission != null ? submission.getPointsEarned() : null;

        return new QuizDto(
                quiz.getId(),
                quiz.getClassRoom().getId(),
                quiz.getClassRoom().getClassName(),
                quiz.getClassRoom().getSubject(),
                teacherName,
                quiz.getTitle(),
                quiz.getDescription(),
                quiz.getPointsReward(),
                quiz.getQuestions().size(),
                hasSubmitted,
                prevScore,
                prevPoints,
                quiz.getCreatedAt(),
                questionDtos
        );
    }
}

