import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
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
import { apiFetch } from '@/services/apiService';
import type { FoundPost } from '@/types/domain';

const campusOptions = ['Cơ sở 1 (Lý Thường Kiệt)', 'Cơ sở 2 (Dĩ An)'];

const buildingsByCampus: Record<string, string[]> = {
  'Cơ sở 1 (Lý Thường Kiệt)': [
    'Tòa A1',
    'Tòa A4',
    'Hội trường A5',
    'Tòa B1',
    'Tòa B4',
    'Tòa C5',
    'Căn tin C6',
    'Thư viện',
  ],
  'Cơ sở 2 (Dĩ An)': [
    'Tòa H1',
    'Tòa H2',
    'Tòa H3',
    'Tòa H6',
    'Thư viện',
    'Căn tin',
    'Ký túc xá',
  ],
};

const categoryFilters = [
  'Tất cả',
  'Thẻ sinh viên',
  'Thiết bị điện tử',
  'Chìa khóa & Thẻ',
  'Ví & Ba lô',
  'Sách vở & Dụng cụ',
  'Khác',
];

function matchesCampus(postCampus: string, selectedCampus: string) {
  if (selectedCampus.includes('Cơ sở 1')) {
    return !postCampus || postCampus.includes('Cơ sở 1') || postCampus.includes('Lý Thường Kiệt');
  }
  return postCampus?.includes('Cơ sở 2') || postCampus?.includes('Dĩ An');
}

export default function HomeScreen() {
  const { currentUser, matches, lostReports } = useAppState();
  const { width } = useWindowDimensions();

  const [campus, setCampus] = useState(campusOptions[0]);
  const [building, setBuilding] = useState('Tất cả');
  const [category, setCategory] = useState('Tất cả');
  const [sortBy, setSortBy] = useState('Mới nhất');

  const [posts, setPosts] = useState<FoundPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const viewportWidth = width > 0 ? width : 390;
  const contentWidth = Math.min(viewportWidth - 32, 608);
  const contentOffset = (viewportWidth - contentWidth) / 2;

  // Lấy danh sách tòa nhà dựa theo cơ sở đang chọn
  const availableBuildings = useMemo(() => {
    return ['Tất cả', ...(buildingsByCampus[campus] || [])];
  }, [campus]);

  // Đổi cơ sở -> Reset lọc tòa nhà về "Tất cả"
  const handleCampusChange = (selectedCampus: string) => {
    setCampus(selectedCampus);
    setBuilding('Tất cả');
  };

  // Gọi API lấy danh sách bài đăng
  const fetchFeedPosts = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setErrorMsg('');

    try {
      const params = new URLSearchParams();
      if (campus) params.append('campus', campus);
      if (building !== 'Tất cả') params.append('building', building);
      if (category !== 'Tất cả') params.append('category', category);

      const response = await apiFetch<{ items: FoundPost[] }>(`/items/feed?${params.toString()}`);

      if (response.success && response.data?.items) {
        setPosts(response.data.items);
      } else {
        setPosts([]);
        setErrorMsg(response.message || 'Không có dữ liệu.');
      }
    } catch (err) {
      console.error('Fetch feed error:', err);
      setPosts([]);
      setErrorMsg('Không thể kết nối đến máy chủ.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [campus, building, category]);

  useEffect(() => {
    fetchFeedPosts();
  }, [fetchFeedPosts]);

  // Thông báo chưa đọc
  const myLostReportIds = new Set(
    lostReports.filter((report) => report.ownerId === currentUser.id).map((report) => report.id),
  );
  const unreadCount = matches.filter(
    (match) =>
      match.status === 'POSSIBLE' && !match.isRead && myLostReportIds.has(match.lostReportId),
  ).length;

  const filteredPosts = useMemo(() => {
    return posts
      .filter((post) => post.status === 'OPEN')
      .filter((post) => matchesCampus(post.campus, campus))
      .filter((post) => building === 'Tất cả' || post.building === building)
      .filter(
        (post) =>
          category === 'Tất cả' ||
          post.category === category ||
          post.title.toLowerCase().includes(category.toLowerCase()),
      )
      .sort((a, b) => {
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        return sortBy === 'Mới nhất' ? timeB - timeA : timeA - timeB;
      });
  }, [campus, building, category, posts, sortBy]);

  const openPost = (id: string) => router.push({ pathname: '/found/[id]', params: { id } });

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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            colors={[colors.indigo]}
            onRefresh={() => fetchFeedPosts(true)}
            refreshing={isRefreshing}
            tintColor={colors.indigo}
          />
        }>
        <View style={[styles.content, { marginLeft: contentOffset, width: contentWidth }]}>
          {/* Card Báo mất đồ */}
          <View style={styles.lostCard}>
            <Text style={styles.lostCardTitle}>Bạn làm rơi đồ?</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push({ pathname: '/(tabs)/create', params: { type: 'LOST' } })}
              style={({ pressed }) => [styles.reportLostButton, pressed && styles.pressed]}>
              <Text style={styles.reportLostButtonIcon}>＋</Text>
              <Text style={styles.reportLostButtonText}>Báo mất đồ</Text>
            </Pressable>
          </View>

          {/* Campus Segmented Tabs */}
          <View style={styles.campusContainer}>
            {campusOptions.map((item) => {
              const active = campus === item;
              return (
                <Pressable
                  key={item}
                  onPress={() => handleCampusChange(item)}
                  style={[styles.campusTab, active && styles.campusTabActive]}>
                  {item.includes('Cơ sở 1') && (
                    <Text style={[styles.campusPin, active && styles.campusPinActive]}></Text>
                  )}
                  <Text style={[styles.campusTabText, active && styles.campusTabTextActive]}>
                    {item}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Dynamic Building Filter Chips */}
          <ScrollView contentContainerStyle={styles.chipsRow} horizontal showsHorizontalScrollIndicator={false}>
            {availableBuildings.map((item) => {
              const active = building === item;
              return (
                <Pressable
                  key={item}
                  onPress={() => setBuilding(item)}
                  style={[styles.chip, active && styles.chipActive]}>
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{item}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Category Filter Chips */}
          <ScrollView contentContainerStyle={styles.chipsRow} horizontal showsHorizontalScrollIndicator={false}>
            {categoryFilters.map((item) => {
              const active = category === item;
              return (
                <Pressable
                  key={item}
                  onPress={() => setCategory(item)}
                  style={[styles.categoryChip, active && styles.categoryChipActive]}>
                  <Text style={[styles.categoryChipText, active && styles.categoryChipTextActive]}>
                    {item}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Feed Header with count & sort */}
          <View style={styles.feedHeader}>
            <View>
              <View style={styles.feedTitleRow}>
                <Text style={styles.feedTitle}>Đồ nhặt được gần đây</Text>
                <View style={styles.blueDot} />
              </View>
              <Text style={styles.feedSubtitle}>
                {filteredPosts.length} đồ vật đã xác minh hôm nay
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => setSortBy(sortBy === 'Mới nhất' ? 'Cũ nhất' : 'Mới nhất')}
              style={styles.sortButton}>
              <Text style={styles.sortButtonText}>≡ {sortBy} ▾</Text>
            </Pressable>
          </View>

          {/* Posts List */}
          {isLoading && !isRefreshing ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator color={colors.indigo} size="large" />
              <Text style={styles.loadingText}>Đang tải vật phẩm...</Text>
            </View>
          ) : (
            <View style={styles.list}>
              {filteredPosts.map((post) => (
                <View key={post.id} style={styles.postWrap}>
                  <FoundPostCard post={post} onPress={() => openPost(post.id)} />
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => openPost(post.id)}
                    style={({ pressed }) => [styles.claimButton, pressed && styles.pressed]}>
                    <Text style={styles.claimText}>Nhận lại</Text>
                  </Pressable>
                </View>
              ))}

              {filteredPosts.length === 0 && (
                <View style={styles.empty}>
                  <Text style={styles.emptyTitle}>Chưa có vật phẩm phù hợp</Text>
                  <Text style={styles.emptyText}>{errorMsg || 'Không tìm thấy dữ liệu.'}</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.background, flex: 1 },
  scrollContent: { paddingBottom: 48 },
  content: { gap: 14, marginTop: 16 },
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
    minWidth: 17,
    position: 'absolute',
    right: -5,
    top: -5,
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

  /* Lost Card */
  lostCard: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radii.large,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    ...shadows.card,
  },
  lostCardTitle: { color: colors.indigo, fontSize: 17, fontWeight: '900' },
  reportLostButton: {
    alignItems: 'center',
    backgroundColor: colors.indigo,
    borderRadius: radii.medium,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  reportLostButtonIcon: { color: colors.white, fontSize: 15, fontWeight: '900' },
  reportLostButtonText: { color: colors.white, fontSize: 13, fontWeight: '800' },

  /* Campus Selector */
  campusContainer: {
    backgroundColor: '#E2E8F0',
    borderRadius: radii.medium,
    flexDirection: 'row',
    padding: 4,
    gap: 4,
  },
  campusTab: {
    alignItems: 'center',
    borderRadius: radii.small,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  campusTabActive: {
    backgroundColor: colors.indigo,
    ...shadows.card,
  },
  campusPin: { color: colors.textMuted, fontSize: 12 },
  campusPinActive: { color: colors.white },
  campusTabText: { color: colors.textMuted, fontSize: 13, fontWeight: '700', textAlign: 'center' },
  campusTabTextActive: { color: colors.white, fontWeight: '800' },

  /* Chips */
  chipsRow: { gap: 8, paddingRight: 16 },
  chip: {
    backgroundColor: colors.indigoSoft,
    borderRadius: radii.pill,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  chipActive: { backgroundColor: colors.indigo },
  chipText: { color: colors.text, fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: colors.white, fontWeight: '800' },

  categoryChip: {
    backgroundColor: '#EFF6FF',
    borderColor: colors.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  categoryChipActive: { backgroundColor: '#DBEAFE', borderColor: colors.blue },
  categoryChipText: { color: colors.text, fontSize: 13, fontWeight: '600' },
  categoryChipTextActive: { color: colors.blueDark, fontWeight: '800' },

  /* Feed Header */
  feedHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  feedTitleRow: { alignItems: 'center', flexDirection: 'row', gap: 6 },
  feedTitle: { color: colors.text, fontSize: 17, fontWeight: '900' },
  blueDot: { backgroundColor: colors.blue, borderRadius: 4, height: 8, width: 8 },
  feedSubtitle: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  sortButton: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    ...shadows.card,
  },
  sortButtonText: { color: colors.text, fontSize: 12, fontWeight: '700' },

  /* List & Cards */
  list: { gap: 12 },
  postWrap: { gap: 6 },
  claimButton: {
    alignItems: 'center',
    backgroundColor: colors.indigo,
    borderRadius: radii.medium,
    minHeight: 40,
    justifyContent: 'center',
  },
  claimText: { color: colors.white, fontSize: 13, fontWeight: '800' },

  loadingBox: {
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
    paddingVertical: 32,
  },
  loadingText: { color: colors.textMuted, fontSize: 12 },
  empty: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radii.medium,
    borderWidth: 1,
    gap: 5,
    padding: 28,
  },
  emptyTitle: { color: colors.text, fontSize: 15, fontWeight: '800' },
  emptyText: { color: colors.textMuted, fontSize: 12 },
  pressed: { opacity: 0.8 },
});