// Static presentation values for the matching route.
import { Dimensions, StyleSheet, Platform } from 'react-native';
import { Colors, BorderRadius, Spacing } from '../../constants/theme';

const { width, height } = Dimensions.get('window');
const COLUMN_WIDTH = (width - Spacing.md * 2 - 12) / 2;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121211',
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: 52,
    paddingBottom: 80,
  },
  header: {
    marginBottom: Spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerSuperTitle: {
    fontSize: 10,
    letterSpacing: 2.0,
    color: Colors.terracotta,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FAF8F5',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#A8A298',
    marginTop: 4,
    lineHeight: 18,
  },
  requestPoseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.terracotta,
  },
  requestPoseText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FAF8F5',
  },
  studioCard: {
    backgroundColor: '#1A1918',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: BorderRadius.md,
    padding: 14,
    marginBottom: Spacing.md,
  },
  studioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  studioTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.terracotta,
    textTransform: 'uppercase',
    letterSpacing: 1.0,
  },
  studioSubtitle: {
    fontSize: 12,
    color: '#A8A298',
    marginBottom: 10,
  },
  presetsRow: {
    gap: 8,
  },
  presetChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  presetChipText: {
    fontSize: 12,
    color: '#E5E0D8',
  },
  filterRow: {
    gap: 8,
    paddingBottom: Spacing.md,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  filterChipActive: {
    backgroundColor: Colors.terracotta,
    borderColor: Colors.terracotta,
  },
  filterChipText: {
    fontSize: 12,
    color: '#A8A298',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#FAF8F5',
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  cardWrapper: {
    width: COLUMN_WIDTH,
  },
  photoContainer: {
    backgroundColor: '#191817',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  photoImage: {
    width: '100%',
    height: 220,
  },
  heartBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartBtnActive: {
    backgroundColor: '#F43F5E',
  },
  tagBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  tagBadgeText: {
    fontSize: 9,
    textTransform: 'uppercase',
    color: '#FAF8F5',
    fontWeight: '600',
    letterSpacing: 0.8,
  },
  photoMeta: {
    padding: 10,
  },
  photoCaption: {
    fontSize: 12,
    color: '#FAF8F5',
    fontWeight: '500',
    lineHeight: 16,
    fontStyle: 'italic',
  },
  photoDate: {
    fontSize: 10,
    letterSpacing: 0.8,
    color: '#A8A298',
    marginTop: 4,
  },
  lightboxContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'space-between',
  },
  lightboxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  lightboxSuperTitle: {
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: Colors.terracotta,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  lightboxCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lightboxImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  lightboxImage: {
    width: width - 20,
    height: height * 0.55,
  },
  lightboxDetails: {
    padding: 20,
    backgroundColor: '#171615',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  lightboxCaption: {
    fontSize: 15,
    fontStyle: 'italic',
    color: '#FAF8F5',
    lineHeight: 22,
    marginBottom: 12,
  },
  promptBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 12,
    padding: 10,
    marginBottom: 16,
  },
  promptLabel: {
    fontSize: 10,
    color: '#A8A298',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  promptText: {
    fontSize: 11,
    color: '#DCD6CD',
    lineHeight: 16,
  },
  lightboxActions: {
    flexDirection: 'row',
    gap: 10,
  },
  favActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  favActionBtnActive: {
    backgroundColor: '#F43F5E',
  },
  favActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#A8A298',
  },
});
