// Static presentation values for the matching route.
import { StyleSheet } from 'react-native';
import { Colors, BorderRadius, Spacing } from '../../constants/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background, // #121211
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: 52,
    paddingBottom: 70,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 9999,
    backgroundColor: Colors.terracottaBg,
  },
  headerBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.terracotta,
    letterSpacing: 1.2,
  },
  addFactQuickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.09)',
  },
  addFactQuickText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
    lineHeight: 20,
  },
  tabToggleRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: BorderRadius.sm,
    padding: 3,
    marginBottom: Spacing.md,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: BorderRadius.xs,
  },
  tabButtonActive: {
    backgroundColor: '#1E1D1B',
  },
  tabButtonPill: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderRadius: BorderRadius.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  tabButtonPillActive: {
    backgroundColor: 'rgba(200, 90, 50, 0.15)',
    borderColor: 'rgba(200, 90, 50, 0.35)',
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  tabButtonTextActive: {
    color: Colors.text,
  },
  categoryScroll: {
    marginBottom: Spacing.md,
  },
  categoryContent: {
    gap: 8,
  },
  categoryChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.035)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  categoryChipActive: {
    backgroundColor: Colors.terracottaBg,
    borderColor: Colors.terracottaBorder,
  },
  categoryChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    letterSpacing: 0.8,
  },
  categoryChipTextActive: {
    color: Colors.terracotta,
  },
  itemsList: {
    gap: 12,
  },
  factCardOuter: {
    width: '100%',
  },
  factCardInner: {
    padding: 14,
    gap: 6,
  },
  factTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  factCategoryBadge: {
    paddingVertical: 2,
    paddingHorizontal: 7,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  factCategoryText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#D5CEC4',
    letterSpacing: 1.0,
  },
  deleteBtn: {
    padding: 4,
  },
  factValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#F5F2EC',
    lineHeight: 22,
  },
  factKey: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  milestoneDepthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  depthTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: Colors.terracottaBg,
  },
  depthText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.terracotta,
    letterSpacing: 1.0,
  },
  milestoneSummary: {
    fontSize: 14,
    lineHeight: 22,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  emptyCard: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#191817',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#191817',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  modalSuperTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.terracotta,
    letterSpacing: 1.6,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalScroll: {
    maxHeight: 400,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    letterSpacing: 1.2,
    marginTop: 12,
    marginBottom: 6,
  },
  inputField: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: Colors.text,
    fontSize: 14,
  },
  archetypeChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  archetypeChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  archetypeChipActive: {
    backgroundColor: Colors.terracotta,
    borderColor: Colors.terracotta,
  },
  archetypeChipText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textSecondary,
    letterSpacing: 0.8,
  },
  archetypeChipTextActive: {
    color: '#FFF',
  },
  modalSubmitWrapper: {
    marginTop: 20,
    marginBottom: 10,
  },
  modalSubmitBtn: {
    width: '100%',
  },
});
