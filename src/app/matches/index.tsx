import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/app-header';
import { MatchStatusBadge } from '@/components/status-badge';
import { colors, radii, shadows } from '@/constants/theme';
import { useAppState } from '@/features/app-state/app-state-context';
import { formatRelativeTime } from '@/utils/date';

export default function MatchesScreen() {
  const { lostReportId } = useLocalSearchParams<{ lostReportId?: string }>();
  const { currentUser, foundPosts, lostReports, markMatchRead, matches } = useAppState();
  const myReports = lostReports.filter((report) => report.ownerId === currentUser.id);
  const visibleReportIds = new Set(
    myReports
      .filter((report) => !lostReportId || report.id === lostReportId)
      .map((report) => report.id),
  );
  const visibleMatches = matches
    .filter((match) => visibleReportIds.has(match.lostReportId))
    .sort((a, b) => {
      if (a.status === 'POSSIBLE' && b.status !== 'POSSIBLE') return -1;
      if (b.status === 'POSSIBLE' && a.status !== 'POSSIBLE') return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  const unreadCount = visibleMatches.filter(
    (match) => match.status === 'POSSIBLE' && !match.isRead,
  ).length;

  return (
    <SafeAreaView edges={['bottom']} style={styles.safeArea}>
      <AppHeader
        showBack
        title="Khớp tiềm năng"
        subtitle={lostReportId ? 'Kết quả cho một báo mất' : 'Thông báo trong ứng dụng'}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.privacyBanner}>
          <Text style={styles.privacyIcon}>◆</Text>
          <View style={styles.flex}>
            <Text style={styles.privacyTitle}>Báo mất của bạn vẫn riêng tư</Text>
            <Text style={styles.privacyText}>
              BKonnect chỉ hiển thị các đồ nhặt được công khai có điểm matching đủ cao.
            </Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.heading}>Thông báo matching</Text>
            <Text style={styles.subheading}>{visibleMatches.length} kết quả trong bản demo</Text>
          </View>
          {unreadCount > 0 && (
            <View style={styles.unreadPill}>
              <Text style={styles.unreadText}>{unreadCount} mới</Text>
            </View>
          )}
        </View>

        {visibleMatches.map((match) => {
          const report = lostReports.find((item) => item.id === match.lostReportId);
          const post = foundPosts.find((item) => item.id === match.foundPostId);
          if (!report || !post) return null;

          return (
            <Pressable
              key={match.id}
              onPress={() => {
                markMatchRead(match.id);
                router.push({
                  pathname: '/found/[id]',
                  params: { id: post.id, matchId: match.id },
                });
              }}
              style={({ pressed }) => [
                styles.card,
                !match.isRead && match.status === 'POSSIBLE' && styles.unreadCard,
                pressed && styles.pressed,
              ]}>
              <View style={styles.cardTopRow}>
                <View style={styles.matchIcon}>
                  <Text style={styles.matchIconText}>↔</Text>
                </View>
                <View style={styles.cardIdentity}>
                  <Text style={styles.notificationText}>
                    Có vật phẩm phù hợp với báo mất của bạn.
                  </Text>
                  <Text style={styles.time}>{formatRelativeTime(match.createdAt)}</Text>
                </View>
                {!match.isRead && match.status === 'POSSIBLE' && <View style={styles.unreadDot} />}
              </View>

              <View style={styles.comparisonBox}>
                <View style={styles.comparisonRow}>
                  <Text style={styles.comparisonLabel}>Bạn báo mất</Text>
                  <Text numberOfLines={1} style={styles.comparisonValue}>
                    {report.itemName}
                  </Text>
                </View>
                <View style={styles.rule} />
                <View style={styles.comparisonRow}>
                  <Text style={styles.comparisonLabel}>Đã nhặt được</Text>
                  <Text numberOfLines={1} style={styles.comparisonValue}>
                    {post.title}
                  </Text>
                </View>
              </View>

              <View style={styles.scoreRow}>
                <View>
                  <Text style={styles.scoreLabel}>ĐIỂM PHÙ HỢP</Text>
                  <Text style={styles.score}>{match.score}/10</Text>
                </View>
                <MatchStatusBadge status={match.status} />
              </View>

              <View style={styles.reasonWrap}>
                {match.reasons.map((reason) => (
                  <View key={reason} style={styles.reasonPill}>
                    <Text style={styles.reasonText}>✓ {reason}</Text>
                  </View>
                ))}
              </View>

              <Text style={styles.openText}>Xem vật phẩm và xác minh ›</Text>
            </Pressable>
          );
        })}

        {visibleMatches.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>◎</Text>
            <Text style={styles.emptyTitle}>Chưa có khớp tiềm năng</Text>
            <Text style={styles.emptyText}>
              Khi có đồ nhặt được phù hợp với báo mất riêng tư, thông báo sẽ xuất hiện tại đây.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  content: { gap: 14, padding: 16, paddingBottom: 40 },
  flex: { flex: 1 },
  privacyBanner: {
    alignItems: 'flex-start',
    backgroundColor: colors.indigoTint,
    borderColor: '#DDE1FF',
    borderRadius: radii.large,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 11,
    padding: 14,
  },
  privacyIcon: { color: colors.indigo, fontSize: 18 },
  privacyTitle: { color: colors.indigo, fontSize: 14, fontWeight: '800' },
  privacyText: { color: '#454653', fontSize: 12, lineHeight: 18, marginTop: 3 },
  sectionHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  heading: { color: colors.text, fontSize: 18, fontWeight: '800' },
  subheading: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  unreadPill: { backgroundColor: colors.dangerSoft, borderRadius: radii.pill, paddingHorizontal: 11, paddingVertical: 6 },
  unreadText: { color: colors.danger, fontSize: 11, fontWeight: '800' },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radii.large,
    borderWidth: 1,
    gap: 13,
    padding: 15,
    ...shadows.card,
  },
  unreadCard: { borderColor: '#93C5FD', borderWidth: 2 },
  pressed: { opacity: 0.78 },
  cardTopRow: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  matchIcon: { alignItems: 'center', backgroundColor: colors.blueSoft, borderRadius: 11, height: 40, justifyContent: 'center', width: 40 },
  matchIconText: { color: colors.blueDark, fontSize: 20, fontWeight: '900' },
  cardIdentity: { flex: 1 },
  notificationText: { color: colors.text, fontSize: 14, fontWeight: '800', lineHeight: 19 },
  time: { color: colors.textMuted, fontSize: 10, marginTop: 3 },
  unreadDot: { backgroundColor: '#EF4444', borderRadius: 5, height: 9, width: 9 },
  comparisonBox: { backgroundColor: colors.backgroundCool, borderRadius: radii.medium, padding: 11 },
  comparisonRow: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  comparisonLabel: { color: colors.textMuted, fontSize: 10, fontWeight: '700', width: 88 },
  comparisonValue: { color: colors.text, flex: 1, fontSize: 13, fontWeight: '700' },
  rule: { backgroundColor: colors.border, height: 1, marginVertical: 8 },
  scoreRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  scoreLabel: { color: colors.textMuted, fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  score: { color: colors.indigo, fontSize: 22, fontWeight: '900', marginTop: 1 },
  reasonWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  reasonPill: { backgroundColor: colors.successSoft, borderRadius: radii.pill, paddingHorizontal: 9, paddingVertical: 5 },
  reasonText: { color: '#047857', fontSize: 10, fontWeight: '700' },
  openText: { color: colors.blueDark, fontSize: 12, fontWeight: '800', textAlign: 'right' },
  empty: { alignItems: 'center', paddingHorizontal: 24, paddingVertical: 70 },
  emptyIcon: { color: colors.textSubtle, fontSize: 42 },
  emptyTitle: { color: colors.text, fontSize: 18, fontWeight: '800', marginTop: 12 },
  emptyText: { color: colors.textMuted, fontSize: 13, lineHeight: 19, marginTop: 6, textAlign: 'center' },
});
