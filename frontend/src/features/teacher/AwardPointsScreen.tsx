import React, { useCallback, useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { RouteProp, useFocusEffect, useNavigation } from '@react-navigation/native';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Icon, IconName } from '../../components/common/Icon';
import { useTheme } from '../../context/ThemeContext';
import { useAppDispatch } from '../../store/hooks';
import { refreshLeaderboard } from '../../store/slices/leaderboardSlice';
import { studentApi } from '../../api/studentApi';
import { pointApi } from '../../api/pointApi';
import { StudentDetail } from '../../types/student';
import { TransactionType } from '../../types/points';
import { TeacherTabParamList } from '../../types/navigation';
import { spacing, typography } from '../../theme';

type AwardPointsRouteProp = RouteProp<TeacherTabParamList, 'AwardPoints'>;

interface AwardPointsScreenProps {
  route: AwardPointsRouteProp;
}

const TRANSACTION_TYPES: { type: TransactionType; label: string; icon: IconName }[] = [
  { type: 'ACADEMIC', label: 'Academic Excellence', icon: 'Award' },
  { type: 'PARTICIPATION', label: 'Active Participation', icon: 'TrendingUp' },
  { type: 'BEHAVIOR', label: 'Exemplary Conduct', icon: 'CheckCircle' },
  { type: 'PENALTY', label: 'Disciplinary Penalty', icon: 'AlertCircle' },
  { type: 'ADJUSTMENT', label: 'Manual Adjustment', icon: 'Settings' },
];

export const AwardPointsScreen: React.FC<AwardPointsScreenProps> = ({ route }) => {
  const { theme, isDark } = useTheme();
  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>();

  const preselectedId = route.params?.preselectedStudentId;
  const preselectedName = route.params?.preselectedStudentName;

  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(
    preselectedId ?? null
  );
  const [selectedStudentName, setSelectedStudentName] = useState<string>(
    preselectedName ?? ''
  );
  const [pointsInput, setPointsInput] = useState('10');
  const [selectedType, setSelectedType] = useState<TransactionType>('ACADEMIC');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [studentList, setStudentList] = useState<StudentDetail[]>([]);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);

  useEffect(() => {
    if (preselectedId) {
      setSelectedStudentId(preselectedId);
      if (preselectedName) {
        setSelectedStudentName(preselectedName);
      }
    }
  }, [preselectedId, preselectedName]);

  const loadEnrolledStudents = useCallback(async () => {
    try {
      const res = await studentApi.getMyEnrolledStudents();
      setStudentList(res);
      if (preselectedId && !preselectedName) {
        const found = res.find((s: any) => s.id === preselectedId);
        if (found) {
          setSelectedStudentName(`${found.firstName} ${found.lastName} (${found.studentIdNumber})`);
        }
      }
    } catch (e) {
      console.warn('Failed to load enrolled students list', e);
    }
  }, [preselectedId, preselectedName]);

  useFocusEffect(
    useCallback(() => {
      loadEnrolledStudents();
    }, [loadEnrolledStudents])
  );

  const handleOpenConfirm = () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!selectedStudentId) {
      setErrorMessage('Please select a student from your active roster.');
      return;
    }

    const points = parseInt(pointsInput, 10);
    if (isNaN(points) || points === 0) {
      setErrorMessage('Please enter a non-zero integer point value.');
      return;
    }

    if (!reason.trim()) {
      setErrorMessage('Reason is required for auditing transparency.');
      return;
    }

    setIsConfirmModalVisible(true);
  };

  const handleExecuteAllocation = async () => {
    if (!selectedStudentId) return;

    const points = parseInt(pointsInput, 10);
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await pointApi.awardPoints({
        studentId: selectedStudentId,
        points,
        transactionType: selectedType,
        reason: reason.trim(),
      });

      setIsConfirmModalVisible(false);
      setSuccessMessage(
        `Successfully allocated ${points > 0 ? '+' : ''}${points} points to ${selectedStudentName || 'student'}.`
      );
      setReason('');
      dispatch(refreshLeaderboard());
      loadEnrolledStudents();
    } catch (err: any) {
      setIsConfirmModalVisible(false);
      const msg =
        err?.response?.data?.message || 'Failed to award points. Please check inputs and class authorization.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const pointsValue = parseInt(pointsInput, 10) || 0;
  const isDeduction = pointsValue < 0 || selectedType === 'PENALTY';

  return (
    <ScreenContainer
      title="Point Allocation & Adjustment"
      subtitle="Formally recognize academic merit, leadership, or apply documented score adjustments"
      breadcrumbs={[
        { label: 'FACULTY' },
        { label: 'AWARD POINTS' },
      ]}
      activeRoute="AwardPoints"
      maxWidth={780}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, width: '100%' }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {successMessage && (
            <View style={[styles.feedbackBanner, { backgroundColor: isDark ? 'rgba(52, 168, 83, 0.15)' : '#E6F4EA', borderColor: '#34A853' }]}>
              <Icon name="CheckCircle" size={18} color="#34A853" />
              <Text style={[styles.feedbackText, { color: '#34A853' }]}>
                {successMessage}
              </Text>
            </View>
          )}

          {errorMessage && (
            <View style={[styles.feedbackBanner, { backgroundColor: isDark ? 'rgba(234, 67, 53, 0.15)' : '#FCE8E6', borderColor: '#EA4335' }]}>
              <Icon name="AlertCircle" size={18} color="#EA4335" />
              <Text style={[styles.feedbackText, { color: '#EA4335' }]}>
                {errorMessage}
              </Text>
            </View>
          )}

          {/* Student Selector */}
          <Card accentTop>
            <Text style={[styles.cardSectionTitle, { color: theme.text }]}>
              Target Student (Enrolled in Your Classes)
            </Text>

            {selectedStudentName ? (
              <View style={[styles.selectedStudentBox, { backgroundColor: isDark ? '#111C2B' : '#E6F4EA', borderColor: '#0F9D58' }]}>
                <Icon name="CircleUserRound" size={20} color="#0F9D58" />
                <View style={{ flex: 1, marginLeft: spacing.sm }}>
                  <Text style={[styles.selectedStudentText, { color: theme.text }]}>
                    {selectedStudentName}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setSelectedStudentId(null);
                    setSelectedStudentName('');
                  }}
                  style={Platform.select({ web: { cursor: 'pointer' } as any })}
                >
                  <Icon name="Trash2" size={16} color="#EA4335" />
                </TouchableOpacity>
              </View>
            ) : null}

            {studentList.length === 0 ? (
              <View style={[styles.emptyRosterBox, { backgroundColor: isDark ? '#111C2B' : '#F1F3F4', borderColor: theme.border }]}>
                <Icon name="School" size={24} color="#0F9D58" />
                <Text style={styles.emptyRosterText}>
                  No students are enrolled in your classes yet. Create a class from the Faculty Dashboard and share your enrollment key to link students.
                </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('TeacherDashboard')}
                  style={[styles.goToDashBtn, { backgroundColor: '#0F9D58' }]}
                >
                  <Text style={styles.goToDashBtnText}>Go to Classrooms</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <Text style={styles.pickerHint}>
                  Select from active student roster:
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.studentsRow}
                  contentContainerStyle={{ gap: 8 }}
                >
                  {studentList.map((s) => {
                    const isSelected = selectedStudentId === s.id;
                    return (
                      <TouchableOpacity
                        key={s.id}
                        activeOpacity={0.8}
                        onPress={() => {
                          setSelectedStudentId(s.id);
                          setSelectedStudentName(`${s.firstName} ${s.lastName} (${s.studentIdNumber})`);
                        }}
                        style={[
                          styles.studentChip,
                          {
                            backgroundColor: isSelected
                              ? isDark
                                ? 'rgba(15, 157, 88, 0.2)'
                                : '#E6F4EA'
                              : theme.card,
                            borderColor: isSelected ? '#0F9D58' : theme.border,
                          },
                          Platform.select({ web: { cursor: 'pointer' } as any }),
                        ]}
                      >
                        <Text
                          style={[
                            styles.chipName,
                            { color: isSelected ? '#0F9D58' : theme.text },
                            isSelected && { fontWeight: typography.weights.bold },
                          ]}
                        >
                          {s.firstName} {s.lastName}
                        </Text>
                        <Text style={styles.chipPoints}>{s.totalPoints} pts</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </>
            )}
          </Card>

          {/* Points Input & Quick Presets */}
          <Card>
            <Text style={[styles.cardSectionTitle, { color: theme.text }]}>
              Point Value Allocation
            </Text>

            <Input
              label="Points Amount (Positive for reward, negative for deduction)"
              placeholder="e.g. 25, 50, -10"
              keyboardType="numeric"
              value={pointsInput}
              onChangeText={setPointsInput}
            />

            <View style={styles.presetsRow}>
              {[
                { label: '+5', val: '5' },
                { label: '+10', val: '10' },
                { label: '+25', val: '25' },
                { label: '+50', val: '50' },
                { label: '-10', val: '-10' },
                { label: '-25', val: '-25' },
              ].map((p) => {
                const isSelected = pointsInput === p.val;
                return (
                  <TouchableOpacity
                    key={p.label}
                    onPress={() => setPointsInput(p.val)}
                    style={[
                      styles.presetChip,
                      {
                        backgroundColor: isSelected
                          ? '#0F9D58'
                          : isDark
                            ? '#111C2B'
                            : '#F1F3F4',
                        borderColor: isSelected ? '#0F9D58' : theme.border,
                      },
                      Platform.select({ web: { cursor: 'pointer' } as any }),
                    ]}
                  >
                    <Text
                      style={[
                        styles.presetChipText,
                        { color: isSelected ? '#FFFFFF' : theme.text },
                      ]}
                    >
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Card>

          {/* Allocation Category */}
          <Card>
            <Text style={[styles.cardSectionTitle, { color: theme.text }]}>
              Evaluation Category
            </Text>

            <View style={styles.typesGrid}>
              {TRANSACTION_TYPES.map((t) => {
                const isSelected = selectedType === t.type;
                return (
                  <TouchableOpacity
                    key={t.type}
                    activeOpacity={0.8}
                    onPress={() => setSelectedType(t.type)}
                    style={[
                      styles.typeOption,
                      {
                        backgroundColor: isSelected
                          ? isDark
                            ? 'rgba(15, 157, 88, 0.2)'
                            : '#E6F4EA'
                          : theme.card,
                        borderColor: isSelected ? '#0F9D58' : theme.border,
                      },
                      Platform.select({ web: { cursor: 'pointer' } as any }),
                    ]}
                  >
                    <Icon
                      name={t.icon}
                      size={18}
                      color={isSelected ? '#0F9D58' : '#5F6368'}
                    />
                    <Text
                      style={[
                        styles.typeLabel,
                        { color: isSelected ? '#0F9D58' : theme.text },
                        isSelected && { fontWeight: typography.weights.bold },
                      ]}
                    >
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Card>

          {/* Academic Transparency Reason */}
          <Card>
            <Text style={[styles.cardSectionTitle, { color: theme.text }]}>
              Audit & Recognition Notes
            </Text>

            <Input
              label="Official Justification"
              placeholder="e.g. Scored 100% on Physics Midterm Examination; Active leadership in STEM week."
              multiline
              numberOfLines={3}
              value={reason}
              onChangeText={setReason}
            />
          </Card>

          {/* Submit Action */}
          <Button
            title={`Confirm & Record Points(${pointsValue > 0 ? '+' : ''}${pointsValue} pts)`}
            variant="primary"
            onPress={handleOpenConfirm}
            style={styles.submitBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Confirmation Modal Dialog */}
      <Modal
        visible={isConfirmModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsConfirmModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalDialog,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <View style={styles.modalHeader}>
              <View style={[styles.modalIconBox, { backgroundColor: isDeduction ? (isDark ? 'rgba(234, 67, 53, 0.15)' : '#FCE8E6') : (isDark ? 'rgba(15, 157, 88, 0.2)' : '#E6F4EA') }]}>
                <Icon
                  name={isDeduction ? 'AlertCircle' : 'Award'}
                  size={20}
                  color={isDeduction ? '#EA4335' : '#0F9D58'}
                />
              </View>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Confirm Allocation
              </Text>
            </View>

            <Text style={[styles.modalStudentName, { color: theme.text }]}>
              Student: {selectedStudentName}
            </Text>

            <View style={[styles.modalSummaryBox, { backgroundColor: isDark ? '#111C2B' : '#F1F3F4', borderColor: theme.border }]}>
              <View style={styles.modalSummaryRow}>
                <Text style={styles.modalSummaryLabel}>Point Adjustment:</Text>
                <Text
                  style={[
                    styles.modalSummaryValue,
                    { color: isDeduction ? '#EA4335' : '#34A853' },
                  ]}
                >
                  {pointsValue > 0 ? `+ ${pointsValue} ` : pointsValue} points
                </Text>
              </View>

              <View style={styles.modalSummaryRow}>
                <Text style={styles.modalSummaryLabel}>Category:</Text>
                <Badge label={selectedType} variant="primary" size="sm" />
              </View>

              <View style={styles.modalSummaryRow}>
                <Text style={styles.modalSummaryLabel}>Reason:</Text>
                <Text style={[styles.modalReasonText, { color: theme.text }]}>
                  {reason}
                </Text>
              </View>
            </View>

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => setIsConfirmModalVisible(false)}
                disabled={isSubmitting}
                style={{ flex: 1, marginRight: spacing.sm }}
              />
              <Button
                title="Authorize"
                variant={isDeduction ? 'danger' : 'primary'}
                onPress={handleExecuteAllocation}
                loading={isSubmitting}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
    width: '100%',
  },
  feedbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: spacing.borderRadius.sm,
    borderWidth: 1,
    marginBottom: spacing.md,
    gap: 8,
  },
  feedbackText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    flex: 1,
  },
  cardSectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.extrabold,
    marginBottom: spacing.sm,
    letterSpacing: -0.1,
  },
  selectedStudentBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: spacing.borderRadius.sm,
    borderWidth: 1.2,
    marginBottom: spacing.sm,
  },
  selectedStudentText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  emptyRosterBox: {
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: spacing.borderRadius.sm,
    borderWidth: 1,
  },
  emptyRosterText: {
    fontSize: typography.sizes.xs,
    color: '#5F6368',
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
    lineHeight: 18,
  },
  goToDashBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: spacing.borderRadius.sm,
  },
  goToDashBtnText: {
    color: '#FFFFFF',
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  pickerHint: {
    fontSize: 11,
    color: '#5F6368',
    marginBottom: spacing.xs,
  },
  studentsRow: {
    marginBottom: spacing.xs,
  },
  studentChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: spacing.borderRadius.sm,
    borderWidth: 1,
  },
  chipName: {
    fontSize: typography.sizes.xs,
  },
  chipPoints: {
    fontSize: 10,
    color: '#5F6368',
    marginTop: 2,
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: spacing.sm,
  },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: spacing.borderRadius.sm,
    borderWidth: 1,
  },
  presetChipText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  typesGrid: {
    gap: 8,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: spacing.borderRadius.sm,
    borderWidth: 1,
    gap: 10,
  },
  typeLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },
  submitBtn: {
    marginTop: spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(23, 50, 77, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalDialog: {
    width: '100%',
    maxWidth: 420,
    borderRadius: spacing.borderRadius.md,
    borderWidth: 1,
    padding: spacing.lg,
    ...Platform.select({
      web: {
        boxShadow: '0 16px 36px rgba(23, 50, 77, 0.35)',
      } as any,
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.sm,
  },
  modalIconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.extrabold,
  },
  modalStudentName: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.sm,
  },
  modalSummaryBox: {
    padding: spacing.md,
    borderRadius: spacing.borderRadius.sm,
    borderWidth: 1,
    marginBottom: spacing.md,
    gap: 8,
  },
  modalSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalSummaryLabel: {
    fontSize: typography.sizes.xs,
    color: '#5F6368',
  },
  modalSummaryValue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.extrabold,
  },
  modalReasonText: {
    fontSize: typography.sizes.xs,
    maxWidth: 220,
    textAlign: 'right',
  },
  modalActions: {
    flexDirection: 'row',
  },
});
