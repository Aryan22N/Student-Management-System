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
import { Input } from '../common/Input';
import { Badge } from '../common/Badge';
import { Icon } from '../common/Icon';
import { useTheme } from '../../context/ThemeContext';
import { quizApi } from '../../api/quizApi';
import { CreateQuizQuestionPayload } from '../../types/quiz';
import { spacing, typography } from '../../theme';

interface CreateQuizModalProps {
  visible: boolean;
  classId: number;
  className: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateQuizModal: React.FC<CreateQuizModalProps> = ({
  visible,
  classId,
  className,
  onClose,
  onSuccess,
}) => {
  const { theme, isDark } = useTheme();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [bonusPoints, setBonusPoints] = useState('10');
  const [questions, setQuestions] = useState<CreateQuizQuestionPayload[]>([
    {
      questionText: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctOption: 'A',
      points: 10,
    },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        questionText: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctOption: 'A',
        points: 10,
      },
    ]);
  };

  const handleRemoveQuestion = (index: number) => {
    if (questions.length <= 1) return;
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateQuestion = (index: number, field: keyof CreateQuizQuestionPayload, value: any) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handlePublish = async () => {
    setErrorMessage(null);
    if (!title.trim()) {
      setErrorMessage('Quiz title is required');
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) {
        setErrorMessage(`Question #${i + 1} text is required`);
        return;
      }
      if (!q.optionA.trim() || !q.optionB.trim() || !q.optionC.trim() || !q.optionD.trim()) {
        setErrorMessage(`Question #${i + 1} must have all 4 options (A, B, C, D) filled`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await quizApi.createQuiz({
        classId,
        title: title.trim(),
        description: description.trim() || undefined,
        pointsReward: parseInt(bonusPoints, 10) || 10,
        questions: questions.map((q) => ({
          ...q,
          questionText: q.questionText.trim(),
          optionA: q.optionA.trim(),
          optionB: q.optionB.trim(),
          optionC: q.optionC.trim(),
          optionD: q.optionD.trim(),
          correctOption: q.correctOption.toUpperCase(),
          points: q.points || 10,
        })),
      });

      // Reset
      setTitle('');
      setDescription('');
      setBonusPoints('10');
      setQuestions([
        {
          questionText: '',
          optionA: '',
          optionB: '',
          optionC: '',
          optionD: '',
          correctOption: 'A',
          points: 10,
        },
      ]);
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to publish quiz. Please check fields and try again.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalDialog, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {/* Header */}
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <View style={styles.headerLeft}>
              <View style={[styles.modalIconBox, { backgroundColor: isDark ? 'rgba(15, 157, 88, 0.2)' : '#E6F4EA' }]}>
                <Icon name="Award" size={20} color="#0F9D58" />
              </View>
              <View>
                <Text style={[styles.modalTitle, { color: theme.text }]}>Create Class Assessment</Text>
                <Text style={styles.modalSub}>{className} • Google Classroom Quiz</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Icon name="Plus" size={20} color="#5F6368" style={{ transform: [{ rotate: '45deg' }] }} />
            </TouchableOpacity>
          </View>

          {/* Form Scroll Content */}
          <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
            {errorMessage && (
              <View style={[styles.errorBanner, { backgroundColor: isDark ? 'rgba(234, 67, 53, 0.2)' : '#FCE8E6' }]}>
                <Icon name="AlertCircle" size={16} color="#EA4335" />
                <Text style={styles.errorBannerText}>{errorMessage}</Text>
              </View>
            )}

            <Input
              label="Quiz Title"
              placeholder="e.g. Unit 3 Pop Quiz: Fundamentals & Mechanics"
              value={title}
              onChangeText={setTitle}
            />

            <Input
              label="Instructions / Description (Optional)"
              placeholder="e.g. Complete this 3-question assessment to earn verified points"
              value={description}
              onChangeText={setDescription}
            />

            <Input
              label="Bonus Merit Points (For 100% Score)"
              placeholder="10"
              keyboardType="numeric"
              value={bonusPoints}
              onChangeText={setBonusPoints}
            />

            {/* Questions Section */}
            <View style={styles.questionsHeaderRow}>
              <Text style={[styles.sectionHeading, { color: theme.text }]}>
                Questions ({questions.length})
              </Text>
              <Button
                title="+ Add Question"
                size="sm"
                variant="outline"
                onPress={handleAddQuestion}
              />
            </View>

            {questions.map((q, qIndex) => (
              <Card key={qIndex} style={styles.questionCard}>
                <View style={styles.questionCardHeader}>
                  <Badge label={`Question #${qIndex + 1}`} variant="primary" size="sm" />
                  {questions.length > 1 && (
                    <TouchableOpacity
                      onPress={() => handleRemoveQuestion(qIndex)}
                      style={styles.deleteQuestionBtn}
                    >
                      <Icon name="Trash2" size={14} color="#EA4335" />
                      <Text style={styles.deleteQuestionText}>Remove</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <Input
                  label="Question Prompt"
                  placeholder="e.g. What is the acceleration due to gravity on Earth?"
                  value={q.questionText}
                  onChangeText={(val) => handleUpdateQuestion(qIndex, 'questionText', val)}
                />

                {/* 4 Options Grid */}
                <View style={styles.optionsGrid}>
                  <View style={styles.optionCol}>
                    <Input
                      label="Option A"
                      placeholder="e.g. 9.8 m/s²"
                      value={q.optionA}
                      onChangeText={(val) => handleUpdateQuestion(qIndex, 'optionA', val)}
                    />
                  </View>
                  <View style={styles.optionCol}>
                    <Input
                      label="Option B"
                      placeholder="e.g. 8.9 m/s²"
                      value={q.optionB}
                      onChangeText={(val) => handleUpdateQuestion(qIndex, 'optionB', val)}
                    />
                  </View>
                </View>

                <View style={styles.optionsGrid}>
                  <View style={styles.optionCol}>
                    <Input
                      label="Option C"
                      placeholder="e.g. 10.5 m/s²"
                      value={q.optionC}
                      onChangeText={(val) => handleUpdateQuestion(qIndex, 'optionC', val)}
                    />
                  </View>
                  <View style={styles.optionCol}>
                    <Input
                      label="Option D"
                      placeholder="e.g. 6.67 m/s²"
                      value={q.optionD}
                      onChangeText={(val) => handleUpdateQuestion(qIndex, 'optionD', val)}
                    />
                  </View>
                </View>

                {/* Correct Answer Selector */}
                <View style={styles.correctOptionRow}>
                  <Text style={styles.correctOptionLabel}>Select Correct Option:</Text>
                  <View style={styles.optionPillsRow}>
                    {(['A', 'B', 'C', 'D'] as const).map((opt) => {
                      const isSelected = q.correctOption === opt;
                      return (
                        <TouchableOpacity
                          key={opt}
                          activeOpacity={0.7}
                          onPress={() => handleUpdateQuestion(qIndex, 'correctOption', opt)}
                          style={[
                            styles.optionPill,
                            isSelected && {
                              backgroundColor: '#0F9D58',
                              borderColor: '#0F9D58',
                            },
                            Platform.select({ web: { cursor: 'pointer' } as any }),
                          ]}
                        >
                          <Text
                            style={[
                              styles.optionPillText,
                              isSelected && { color: '#FFFFFF', fontWeight: '800' },
                            ]}
                          >
                            Option {opt}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              </Card>
            ))}
          </ScrollView>

          {/* Actions */}
          <View style={[styles.modalActions, { borderTopColor: theme.border }]}>
            <Button
              title="Cancel"
              variant="outline"
              onPress={onClose}
              disabled={isSubmitting}
              style={{ flex: 1, marginRight: spacing.sm }}
            />
            <Button
              title="Publish Assessment"
              variant="primary"
              onPress={handlePublish}
              loading={isSubmitting}
              style={{ flex: 2 }}
            />
          </View>
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
  },
  modalIconBox: {
    width: 40,
    height: 40,
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
  formScroll: {
    padding: spacing.md,
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
  questionsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionHeading: {
    fontSize: typography.sizes.sm,
    fontWeight: '800',
  },
  questionCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
    borderRadius: 10,
  },
  questionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  deleteQuestionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deleteQuestionText: {
    fontSize: 11,
    color: '#EA4335',
    fontWeight: '600',
  },
  optionsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  optionCol: {
    flex: 1,
  },
  correctOptionRow: {
    marginTop: spacing.xs,
  },
  correctOptionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#5F6368',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  optionPillsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  optionPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#DADCE0',
  },
  optionPillText: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
    color: '#5F6368',
  },
  modalActions: {
    flexDirection: 'row',
    padding: spacing.md,
    borderTopWidth: 1,
  },
});

