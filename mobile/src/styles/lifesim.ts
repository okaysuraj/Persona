// Static presentation values for the matching route.
import { StyleSheet } from 'react-native';
import { Colors, Spacing } from '../constants/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: 52,
    paddingBottom: 12,
    backgroundColor: '#161514',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backBtnText: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: '600',
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(200, 90, 50, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(200, 90, 50, 0.3)',
  },
  refreshText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.terracotta,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: 60,
  },
  heroSection: {
    marginBottom: Spacing.md,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#10B981',
    letterSpacing: 1.0,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  loadingContainer: {
    paddingVertical: 50,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  cardsContainer: {
    gap: 14,
  },
  identityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#181716',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  companionName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  localTime: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
  },
  cardOuter: {
    width: '100%',
  },
  cardInner: {
    padding: 16,
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  cardBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.terracotta,
    letterSpacing: 0.8,
  },
  timeRange: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  phaseActivity: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    lineHeight: 20,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  metersRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  meterLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  meterTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  meterFill: {
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.terracotta,
  },
  thoughtQuote: {
    fontSize: 14,
    color: Colors.text,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  sensoryGrid: {
    gap: 8,
    marginTop: 4,
  },
  sensoryItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 8,
    padding: 8,
  },
  sensoryLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  sensoryVal: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
