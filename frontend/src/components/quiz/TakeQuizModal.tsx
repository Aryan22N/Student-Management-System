import React, { useState } from 'react';
import {
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Icon } from '../common/Icon';
import { useTheme } from '../../context/ThemeContext';
import { quizApi } from '../../api/quizApi';
import { Quiz, QuizSubmissionResponse } from '../../types/quiz';
import { spacing, typography } from '../../theme';

interface TakeQuizModalProps {
  visible: boolean;
  quiz: Quiz | null;
  onClose: () => void;
  onSubmitted: (res: QuizSubmissionResponse) => void;
}

export const TakeQuizModal: React.FC<TakeQuizModalProps> = ({
  visible,
  quiz,
  onClose,
  onSubmitted,
}) => {
  const { theme, isDark } = useTheme();

  const [selectedAnswers, setSelectedAnswers] = useState<{ [qId: number]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submissionResult, setSubmissionResult] = useState<QuizSubmissionResponse | null>(null);

  if (!quiz) return null;

  const handleSelectOption = (questionId: number, optionLetter: string) => {
    if (submissionResult) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionLetter,
    }));
  };

  const handleSubmit = async () => {
    setErrorMsg(null);
    const questions = quiz.questions || [];
    for (const q of questions) {
      if (!selectedAnswers[q.id]) {
        setErrorMsg('Please answer all questions before submitting your assessment');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const res = await quizApi.submitQuiz(quiz.id, { answers: selectedAnswers });
      setSubmissionResult(res);
      onSubmitted(res);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to submit quiz. Please try again.';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedAnswers({});
    setErrorMsg(null);
    setSubmissionResult(null);
    onClose();
  };

  const questions = quiz.questions || [];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalDialog, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {/* Header */}
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <View style={styles.headerLeft}>
              <View style={[styles.modalIconBox, { backgroundColor: isDark ? 'rgba(15, 157, 88, 0.2)' : '#E6F4EA' }]}>
                <Icon name="Award" size={20} color="#0F9D58" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.modalTitle, { color: theme.text }]} numberOfLines={1}>
                  {quiz.title}
                </Text>
                <Text style={styles.modalSub}>
                  {quiz.className} ({quiz.subject}) • Instructor: {quiz.teacherName}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <Icon name="Plus" size={20} color="#5F6368" style={{ transform: [{ rotate: '45deg' }] }} />
            </TouchableOpacity>
          </View>

          {/* Submission Success View */}
          {submissionResult ? (
            <View style={styles.resultContainer}>
              <View style={[styles.resultIconCircle, { backgroundColor: '#E6F4EA' }]}>
                <Icon name="CheckCircle" size={44} color="#0F9D58" />
              </View>
              <Text style={[styles.resultTitle, { color: theme.text }]}>Assessment Completed!</Text>
              <Text style={styles.resultSub}>
                Your responses have been verified by the institutional academic engine.
              </Text>

              <View style={[styles.scoreSummaryCard, { backgroundColor: isDark ? '#1C2128' : '#F8FAF9', borderColor: theme.border }]}>
                <View style={styles.scoreRow}>
                  <Text style={styles.scoreLabel}>Correct Answers</Text>
                  <Text style={[styles.scoreValue, { color: theme.text }]}>
                    {submissionResult.score} / {submissionResult.totalQuestions}
                  </Text>
                </View>
                <View style={[styles.scoreRow, { borderTopWidth: 1, borderTopColor: theme.border, paddingTop: 8, marginTop: 8 }]}>
                  <Text style={styles.scoreLabel}>Merit Points Awarded</Text>
                  <Badge label={`+${submissionResult.pointsEarned} pts`} variant="primary" size="md" />
                </View>
                <View style={[styles.scoreRow, { borderTopWidth: 1, borderTopColor: theme.border, paddingTop: 8, marginTop: 8 }]}>
                  <Text style={styles.scoreLabel}>New Total Score</Text>
                  <Text style={[styles.scoreValue, { color: '#0F9D58' }]}>
                    {submissionResult.newTotalPoints} pts
                  </Text>
                </View>
              </View>

              <Text style={styles.leaderboardHint}>
                Your academic ranking on the institutional leaderboard has been automatically updated!
              </Text>

              <Button
                title="Return to Dashboard"
                variant="primary"
                onPress={handleClose}
                style={{ width: '100%', marginTop: spacing.md }}
              />
            </View>
          ) : (
            <>
              {/* Question Scroll */}
              <ScrollView style={styles.questionsScroll} showsVerticalScrollIndicator={false}>
                {quiz.description ? (
                  <View style={[styles.descBox, { backgroundColor: isDark ? '#1C2128' : '#F1F3F4' }]}>
                    <Icon name="BookOpen" size={15} color="#0F9D58" style={{ marginRight: 6 }} />
                    <Text style={styles.descText}>{quiz.description}</Text>
                  </View>
                ) : null}

                {errorMsg && (
                  <View style={[styles.errorBanner, { backgroundColor: isDark ? 'rgba(234, 67, 53, 0.2)' : '#FCE8E6' }]}>
                    <Icon name="AlertCircle" size={16} color="#EA4335" />
                    <Text style={styles.errorBannerText}>{errorMsg}</Text>
                  </View>
                )}

                {questions.map((q, idx) => {
                  const selected = selectedAnswers[q.id];
                  const options = [
                    { key: 'A', text: q.optionA },
                    { key: 'B', text: q.optionB },
                    { key: 'C', text: q.optionC },
                    { key: 'D', text: q.optionD },
                  ];

                  return (
                    <Card key={q.id} style={styles.questionCard}>
                      <View style={styles.questionCardTop}>
                        <Badge label={`Question ${idx + 1} of ${questions.length}`} variant="primary" size="sm" />
                        <Text style={styles.questionPointsText}>+{q.points} pts</Text>
                      </View>

                      <Text style={[styles.questionPrompt, { color: theme.text }]}>
                        {q.questionText}
                      </Text>

                      <View style={styles.optionsList}>
                        {options.map((opt) => {
                          const isOptionSelected = selected === opt.key;
                          return (
                            <TouchableOpacity
                              key={opt.key}
                              activeOpacity={0.7}
                              onPress={() => handleSelectOption(q.id, opt.key)}
                              style={[
                                styles.optionRow,
                                {
                                  borderColor: isOptionSelected ? '#0F9D58' : theme.border,
                                  backgroundColor: isOptionSelected
                                    ? isDark ? 'rgba(15, 157, 88, 0.15)' : '#E6F4EA'
                                    : theme.card,
                                },
                                Platform.select({ web: { cursor: 'pointer' } as any }),
                              ]}
                            >
                              <View
                                style={[
                                  styles.optionBadge,
                                  isOptionSelected && {
                                    backgroundColor: '#0F9D58',
                                    borderColor: '#0F9D58',
                                  },
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.optionBadgeText,
                                    isOptionSelected && { color: '#FFFFFF' },
                                  ]}
                                >
                                  {opt.key}
                                </Text>
                              </View>
                              <Text
                                style={[
                                  styles.optionText,
                                  { color: theme.text },
                                  isOptionSelected && { fontWeight: '700', color: '#0F9D58' },
                                ]}
                              >
                                {opt.text}
                              </Text>
                              {isOptionSelected && (
                                <Icon name="CheckCircle" size={16} color="#0F9D58" style={{ marginLeft: 'auto' }} />
                              )}
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </Card>
                  );
                })}
              </ScrollView>

              {/* Actions Footer */}
              <View style={[styles.modalActions, { borderTopColor: theme.border }]}>
                <Button
                  title="Cancel"
                  variant="outline"
                  onPress={handleClose}
                  disabled={isSubmitting}
                  style={{ flex: 1, marginRight: spacing.sm }}
                />
                <Button
                  title="Submit Assessment"
                  variant="primary"
                  onPress={handleSubmit}
                  loading={isSubmitting}
                  icon={<Icon name="Check" size={15} color="#FFFFFF" />}
                  style={{ flex: 2 }}
                />
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalDialog: {
    width: '100%',
    maxWidth: 620,
    maxHeight: '90%',
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  modalIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '800',
  },
  modalSub: {
    fontSize: typography.sizes.xs,
    color: '#5F6368',
    marginTop: 1,
  },
  closeBtn: {
    padding: 6,
  },
  questionsScroll: {
    padding: spacing.md,
  },
  descBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  descText: {
    fontSize: typography.sizes.xs,
    color: '#5F6368',
    flex: 1,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.md,
    gap: 8,
  },
  errorBannerText: {
    color: '#EA4335',
    fontSize: typography.sizes.xs,
    fontWeight: '600',
    flex: 1,
  },
  questionCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
    borderRadius: 10,
  },
  questionCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  questionPointsText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F9D58',
  },
  questionPrompt: {
    fontSize: typography.sizes.sm,
    fontWeight: '700',
    marginVertical: spacing.xs,
    lineHeight: 20,
  },
  optionsList: {
    gap: 8,
    marginTop: spacing.xs,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1.2,
    gap: 10,
  },
  optionBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#DADCE0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#5F6368',
  },
  optionText: {
    fontSize: typography.sizes.xs,
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    padding: spacing.md,
    borderTopWidth: 1,
  },
  resultContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  resultIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  resultTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4,
  },
  resultSub: {
    fontSize: typography.sizes.xs,
    color: '#5F6368',
    textAlign: 'center',
    maxWidth: 360,
    lineHeight: 18,
    marginBottom: spacing.lg,
  },
  scoreSummaryCard: {
    width: '100%',
    padding: spacing.md,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: typography.sizes.xs,
    color: '#5F6368',
    fontWeight: '600',
  },
  scoreValue: {
    fontSize: typography.sizes.md,
    fontWeight: '800',
  },
  leaderboardHint: {
    fontSize: 11,
    color: '#0F9D58',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});

