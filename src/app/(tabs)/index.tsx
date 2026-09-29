import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { AppHeader } from '@/components/app-header';
import { FoundPostCard } from '@/components/found-post-card';
import { colors, radii, shadows } from '@/constants/theme';
import { useAppState } from '@/features/app-state/app-state-context';
import type { FoundPostStatus } from '@/types/domain';

const categories = [
  'Tất cả',
  'Máy tính',
  'Điện tử',
  'Giấy tờ / Thẻ',
  'Ví & Ba lô',
  'Chìa khóa',
  'Sách vở',
];

export default function HomeScreen() {
  const { foundPosts } = useAppState();

  return <HomeFeed key={foundPosts[0]?.id ?? 'empty-feed'} />;
}

function HomeFeed() {
  const { currentUser, foundPosts, lostReports, matches } = useAppState();
  const { width } = useWindowDimensions();
  const [category, setCategory] = useState('Tất cả');
  const [status, setStatus] = useState<FoundPostStatus>('OPEN');
  const viewportWidth = width > 0 ? width : 390;
  const contentWidth = Math.min(viewportWidth - 32, 608);
  const contentOffset = (viewportWidth - contentWidth) / 2;
  const myLostReportIds = new Set(
    lostReports.filter((report) => report.ownerId === currentUser.id).map((report) => report.id),
  );
  const unreadCount = matches.filter(
    (match) =>
      match.status === 'POSSIBLE' &&
      !match.isRead &&
      myLostReportIds.has(match.lostReportId),
  ).length;

  const filteredPosts = useMemo(
    () =>
      foundPosts
        .filter((post) => post.status === status)
        .filter((post) => category === 'Tất cả' || post.category === category)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [category, foundPosts, status],
  );

  const headerRight = (
    <View style={styles.headerActions}>
      <Pressable
        accessibilityLabel="Mở trung tâm khớp tiềm năng"
        onPress={() => router.push('/matches')}
        style={({ pressed }) => [styles.notificationButton, pressed && styles.pressed]}>
        <Text style={styles.notificationIcon}>●</Text>
        {unreadCount > 0 && (
          <View style={styles.notificationCount}>
            <Text style={styles.notificationCountText}>{unreadCount}</Text>
          </View>
        )}
      </Pressable>
      <View style={styles.headerAvatar}>
        <Text style={styles.headerAvatarText}>{currentUser.initials}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.screen}>
      <AppHeader right={headerRight} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.content, { marginLeft: contentOffset, width: contentWidth }]}>
        <ImageBackground
          source={require('@/assets/images/demo/campus-hero.png')}
          imageStyle={styles.heroImage}
          style={styles.hero}>
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            <View style={styles.networkPill}>
              <View style={styles.networkDot} />
              <Text style={styles.networkText}>BKONNECT SAFE CAMPUS</Text>
            </View>
            <Text style={styles.heroTitle}>Bạn làm rơi đồ trong trường?</Text>
            <Text style={styles.heroSubtitle}>Tạo báo mất riêng tư để BKonnect tự tìm vật phẩm phù hợp.</Text>
            <Pressable
              onPress={() =>
                router.push({ pathname: '/(tabs)/create', params: { type: 'LOST' } })
              }
              style={styles.heroButton}>
              <Text style={styles.heroButtonText}>＋ Báo mất đồ ngay</Text>
            </Pressable>
          </View>
        </ImageBackground>

        <View style={styles.privacyNote}>
          <Text style={styles.privacyIcon}>◆</Text>
          <Text style={styles.privacyText}>
            Home chỉ hiển thị đồ nhặt được công khai. Báo mất của bạn luôn được giữ riêng tư.
          </Text>
        </View>

        <View style={styles.segment}>
          {(['OPEN', 'RETURNED'] as FoundPostStatus[]).map((item) => {
            const active = status === item;
            return (
              <Pressable
                key={item}
                onPress={() => setStatus(item)}
                style={[styles.segmentButton, active && styles.segmentButtonActive]}>
                <Text style={[styles.segmentLabel, active && styles.segmentLabelActive]}>
                  {item === 'OPEN' ? 'Đang chờ chủ' : 'Đã trao trả'}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <ScrollView
          contentContainerStyle={styles.chips}
          horizontal
          showsHorizontalScrollIndicator={false}>
          {categories.map((item) => {
            const active = category === item;
            return (
              <Pressable
                key={item}
                onPress={() => setCategory(item)}
                style={[styles.chip, active && styles.chipActive]}>
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{item}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.feedHeader}>
          <View>
            <View style={styles.feedTitleRow}>
              <Text style={styles.feedTitle}>
                {status === 'OPEN' ? 'Đồ nhặt được gần đây' : 'Vật phẩm đã trao trả'}
              </Text>
              <View style={styles.feedDot} />
            </View>
            <Text style={styles.feedSubtitle}>{filteredPosts.length} vật phẩm công khai</Text>
          </View>
          <View style={styles.sortPill}>
            <Text style={styles.sortText}>Mới nhất</Text>
          </View>
        </View>

        <View style={styles.list}>
          {filteredPosts.map((post) => (
            <FoundPostCard
              key={post.id}
              post={post}
              onPress={() =>
                router.push({ pathname: '/found/[id]', params: { id: post.id } })
              }
            />
          ))}

          {filteredPosts.length === 0 && (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>Chưa có vật phẩm phù hợp</Text>
              <Text style={styles.emptyText}>Hãy đổi bộ lọc hoặc quay lại sau.</Text>
            </View>
          )}
        </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.background, flex: 1 },
  content: {
    gap: 14,
    marginTop: 16,
    marginBottom: 28,
  },
  headerActions: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  notificationButton: {
    alignItems: 'center',
    borderColor: 'rgba(255,255,255,0.28)',
    borderRadius: 16,
    borderWidth: 1,
    height: 34,
    justifyContent: 'center',
    position: 'relative',
    width: 34,
  },
  notificationIcon: { color: colors.white, fontSize: 13 },
  notificationCount: {
    alignItems: 'center',
    backgroundColor: '#EF4444',
    borderColor: colors.indigo,
    borderRadius: 8,
    borderWidth: 2,
    height: 17,
    justifyContent: 'center',
    position: 'absolute',
    right: -5,
    top: -5,
    minWidth: 17,
  },
  notificationCountText: { color: colors.white, fontSize: 9, fontWeight: '900' },
  headerAvatar: {
    alignItems: 'center',
    backgroundColor: colors.indigoDark,
    borderRadius: 16,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  headerAvatarText: { color: colors.white, fontSize: 11, fontWeight: '800' },
  hero: {
    borderRadius: radii.medium,
    height: 178,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    ...shadows.floating,
  },
  heroImage: { borderRadius: radii.medium },
  heroOverlay: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,86,0.65)' },
  heroContent: { alignItems: 'flex-start', gap: 7, padding: 14 },
  networkPill: {
    alignItems: 'center',
    backgroundColor: 'rgba(77,171,254,0.24)',
    borderRadius: radii.pill,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  networkDot: { backgroundColor: '#4DABFE', borderRadius: 4, height: 6, width: 6 },
  networkText: { color: colors.white, fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  heroTitle: { color: colors.white, fontSize: 18, fontWeight: '800' },
  heroSubtitle: { color: '#E0E7FF', fontSize: 11, lineHeight: 16, maxWidth: 300 },
  heroButton: {
    backgroundColor: '#4DABFE',
    borderRadius: radii.small,
    marginTop: 2,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  heroButtonText: { color: colors.white, fontSize: 14, fontWeight: '800' },
  privacyNote: {
    alignItems: 'center',
    backgroundColor: colors.indigoTint,
    borderRadius: radii.medium,
    flexDirection: 'row',
    gap: 9,
    padding: 11,
  },
  privacyIcon: { color: colors.indigo, fontSize: 13 },
  privacyText: { color: '#454653', flex: 1, fontSize: 11, lineHeight: 16 },
  segment: { backgroundColor: '#E2E7FF', borderRadius: radii.small, flexDirection: 'row', padding: 4 },
  segmentButton: { alignItems: 'center', borderRadius: radii.small, flex: 1, paddingVertical: 9 },
  segmentButtonActive: { backgroundColor: colors.indigo, ...shadows.card },
  segmentLabel: { color: '#454653', fontSize: 13, fontWeight: '700' },
  segmentLabelActive: { color: colors.white },
  chips: { gap: 8, paddingRight: 16 },
  chip: { backgroundColor: colors.indigoSoft, borderRadius: radii.pill, paddingHorizontal: 14, paddingVertical: 8 },
  chipActive: { backgroundColor: colors.indigo },
  chipText: { color: colors.text, fontSize: 12 },
  chipTextActive: { color: colors.white, fontWeight: '800' },
  feedHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 },
  feedTitleRow: { alignItems: 'center', flexDirection: 'row', gap: 6 },
  feedTitle: { color: colors.text, fontSize: 17, fontWeight: '800' },
  feedDot: { backgroundColor: '#4DABFE', borderRadius: 5, height: 8, width: 8 },
  feedSubtitle: { color: '#454653', fontSize: 11, marginTop: 2 },
  sortPill: { backgroundColor: colors.indigoTint, borderRadius: radii.small, paddingHorizontal: 10, paddingVertical: 6 },
  sortText: { color: colors.text, fontSize: 11, fontWeight: '700' },
  list: { gap: 10 },
  empty: { alignItems: 'center', backgroundColor: colors.card, borderColor: colors.border, borderRadius: radii.medium, borderWidth: 1, gap: 5, padding: 28 },
  emptyTitle: { color: colors.text, fontSize: 15, fontWeight: '800' },
  emptyText: { color: colors.textMuted, fontSize: 12 },
  pressed: { opacity: 0.72 },
});
