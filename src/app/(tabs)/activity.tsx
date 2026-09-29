import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/app-header';
import { FoundPostCard } from '@/components/found-post-card';
import {
  LostReportStatusBadge,
  MatchStatusBadge,
} from '@/components/status-badge';
import { colors, radii, shadows } from '@/constants/theme';
import { useAppState } from '@/features/app-state/app-state-context';
import { formatDateTime } from '@/utils/date';

type ActivityMode = 'LOST' | 'FOUND' | 'MATCH';

export default function ActivityScreen() {
  const { currentUser, foundPosts, lostReports, markMatchRead, matches } = useAppState();
  const [mode, setMode] = useState<ActivityMode>('LOST');
  const myLostReports = lostReports.filter((report) => report.ownerId === currentUser.id);
  const myFoundPosts = foundPosts.filter((post) => post.finderId === currentUser.id);
  const myLostIds = new Set(myLostReports.map((report) => report.id));
  const myMatches = matches.filter((match) => myLostIds.has(match.lostReportId));

  return (
    <SafeAreaView edges={['bottom']} style={styles.safeArea}>
      <AppHeader title="Hoạt động của tôi" subtitle="Báo mất · Đồ đã nhặt · Matching" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryRow}>
          <SummaryCard label="Báo mất" value={myLostReports.length} />
          <SummaryCard label="Đã nhặt" value={myFoundPosts.length} />
          <SummaryCard label="Khớp" value={myMatches.length} />
        </View>

        <View style={styles.segment}>
          {(['LOST', 'FOUND', 'MATCH'] as ActivityMode[]).map((item) => {
            const active = mode === item;
            const labels: Record<ActivityMode, string> = {
              LOST: 'Báo mất',
              FOUND: 'Đã nhặt',
              MATCH: 'Khớp',
            };
            return (
              <Pressable
                key={item}
                onPress={() => setMode(item)}
                style={[styles.segmentButton, active && styles.segmentButtonActive]}>
                <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                  {labels[item]}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {mode === 'LOST' && (
          <View style={styles.list}>
            <View style={styles.sectionHeading}>
              <View>
                <Text style={styles.heading}>Báo mất của tôi</Text>
                <Text style={styles.sectionHint}>Riêng tư — không hiển thị trên Home</Text>
              </View>
              <Text style={styles.count}>{myLostReports.length}</Text>
            </View>

            {myLostReports.map((report) => {
              const reportMatches = myMatches.filter(
                (match) => match.lostReportId === report.id,
              );
              return (
                <Pressable
                  key={report.id}
                  onPress={() =>
                    router.push({ pathname: '/matches', params: { lostReportId: report.id } })
                  }
                  style={({ pressed }) => [styles.activityCard, pressed && styles.pressed]}>
                  <View style={styles.cardTopRow}>
                    <View style={styles.privateIcon}>
                      <Text style={styles.privateIconText}>◆</Text>
                    </View>
                    <View style={styles.cardCopy}>
                      <Text style={styles.cardTitle}>{report.itemName}</Text>
                      <Text style={styles.cardMeta}>
                        {report.category} · {report.color}
                      </Text>
                    </View>
                    <LostReportStatusBadge status={report.status} />
                  </View>
                  <Text style={styles.locationText}>
                    ⌖ {report.possibleLocations.join(' · ')}
                  </Text>
                  <Text style={styles.dateText}>Mất lúc {formatDateTime(report.lostAt)}</Text>
                  <View style={styles.activityFooter}>
                    <Text style={styles.matchCount}>{reportMatches.length} khớp tiềm năng</Text>
                    <Text style={styles.openText}>Xem kết quả ›</Text>
                  </View>
                </Pressable>
              );
            })}

            {myLostReports.length === 0 && <EmptyState text="Bạn chưa tạo báo mất riêng tư." />}
          </View>
        )}

        {mode === 'FOUND' && (
          <View style={styles.list}>
            <View style={styles.sectionHeading}>
              <View>
                <Text style={styles.heading}>Đồ tôi đã nhặt</Text>
                <Text style={styles.sectionHint}>Bài công khai trên Home</Text>
              </View>
              <Text style={styles.count}>{myFoundPosts.length}</Text>
            </View>
            {myFoundPosts.map((post) => (
              <FoundPostCard
                key={post.id}
                post={post}
                onPress={() =>
                  router.push({ pathname: '/found/[id]', params: { id: post.id } })
                }
              />
            ))}
            {myFoundPosts.length === 0 && <EmptyState text="Bạn chưa đăng món đồ nhặt được nào." />}
          </View>
        )}

        {mode === 'MATCH' && (
          <View style={styles.list}>
            <View style={styles.sectionHeading}>
              <View>
                <Text style={styles.heading}>Khớp tiềm năng</Text>
                <Text style={styles.sectionHint}>POSSIBLE · DISMISSED · COMPLETED</Text>
              </View>
              <Text style={styles.count}>{myMatches.length}</Text>
            </View>
            {myMatches.map((match) => {
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
                  style={({ pressed }) => [styles.activityCard, pressed && styles.pressed]}>
                  <View style={styles.cardTopRow}>
                    <View style={styles.scoreCircle}>
                      <Text style={styles.scoreText}>{match.score}</Text>
                    </View>
                    <View style={styles.cardCopy}>
                      <Text numberOfLines={1} style={styles.cardTitle}>{post.title}</Text>
                      <Text numberOfLines={1} style={styles.cardMeta}>Khớp với: {report.itemName}</Text>
                    </View>
                  </View>
                  <View style={styles.activityFooter}>
                    <MatchStatusBadge status={match.status} />
                    <Text style={styles.openText}>Mở chi tiết ›</Text>
                  </View>
                </Pressable>
              );
            })}
            {myMatches.length === 0 && <EmptyState text="Chưa có kết quả matching cho báo mất của bạn." />}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text numberOfLines={1} style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyIcon}>◎</Text>
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  content: { gap: 14, padding: 16, paddingBottom: 32 },
  summaryRow: { flexDirection: 'row', gap: 8 },
  summaryCard: { backgroundColor: colors.indigoSoft, borderRadius: radii.large, flex: 1, padding: 13 },
  summaryValue: { color: colors.indigo, fontSize: 24, fontWeight: '900' },
  summaryLabel: { color: colors.textMuted, fontSize: 11, marginTop: 3 },
  segment: { backgroundColor: '#E2E7FF', borderRadius: radii.small, flexDirection: 'row', padding: 4 },
  segmentButton: { alignItems: 'center', borderRadius: radii.small, flex: 1, paddingVertical: 9 },
  segmentButtonActive: { backgroundColor: colors.indigo },
  segmentText: { color: colors.textMuted, fontSize: 12, fontWeight: '700' },
  segmentTextActive: { color: colors.white },
  list: { gap: 11 },
  sectionHeading: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  heading: { color: colors.text, fontSize: 18, fontWeight: '800' },
  sectionHint: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
  count: { color: colors.textMuted, fontSize: 13 },
  activityCard: { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radii.large, borderWidth: 1, gap: 10, padding: 13, ...shadows.card },
  pressed: { opacity: 0.76 },
  cardTopRow: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  privateIcon: { alignItems: 'center', backgroundColor: colors.indigoTint, borderRadius: 10, height: 40, justifyContent: 'center', width: 40 },
  privateIconText: { color: colors.indigo, fontSize: 17 },
  cardCopy: { flex: 1, minWidth: 0 },
  cardTitle: { color: colors.text, fontSize: 15, fontWeight: '800' },
  cardMeta: { color: colors.textMuted, fontSize: 11, marginTop: 3 },
  locationText: { color: '#475569', fontSize: 12 },
  dateText: { color: colors.textMuted, fontSize: 11 },
  activityFooter: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  matchCount: { color: colors.warning, fontSize: 11, fontWeight: '800' },
  openText: { color: colors.blueDark, fontSize: 11, fontWeight: '800' },
  scoreCircle: { alignItems: 'center', backgroundColor: colors.warningSoft, borderRadius: 20, height: 40, justifyContent: 'center', width: 40 },
  scoreText: { color: colors.warning, fontSize: 17, fontWeight: '900' },
  empty: { alignItems: 'center', backgroundColor: colors.card, borderRadius: radii.large, padding: 36 },
  emptyIcon: { color: colors.textSubtle, fontSize: 36 },
  emptyText: { color: colors.textMuted, fontSize: 13, marginTop: 8, textAlign: 'center' },
});
