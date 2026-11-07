import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';

import { AppHeader } from '@/components/app-header';
import { FoundPostCard } from '@/components/found-post-card';
import { colors, radii, shadows } from '@/constants/theme';
import { useAppState } from '@/features/app-state/app-state-context';
import { apiFetch } from '@/services/apiService';
import type { FoundPost } from '@/types/domain';

const campusFilters = ['Tất cả cơ sở', 'Cơ sở 1', 'Cơ sở 2'];
const typeFilters = ['Tất cả', 'Máy tính', 'Điện tử', 'Giấy tờ / Thẻ', 'Ví & Ba lô', 'Chìa khóa', 'Sách vở'];
const RECENT_LIMIT = 5;

function matchesCampus(postCampus: string, filter: string) {
  if (filter === 'Tất cả cơ sở') return true;
  return postCampus?.startsWith(filter);
}

export default function HomeScreen() {
  const { foundPosts } = useAppState();

  return <HomeFeed key={foundPosts[0]?.id ?? 'empty-feed'} />;
}

function HomeFeed() {
  const { currentUser, foundPosts: localFoundPosts, lostReports, matches } = useAppState();
  const { width } = useWindowDimensions();

  // State tìm kiếm & bộ lọc
  const [query, setQuery] = useState('');
  const [campus, setCampus] = useState(campusFilters[0]);
  const [type, setType] = useState(typeFilters[0]);
  const [showAll, setShowAll] = useState(false);

  // State API
  const [apiPosts, setApiPosts] = useState<FoundPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const viewportWidth = width > 0 ? width : 390;
  const contentWidth = Math.min(viewportWidth - 32, 608);
  const contentOffset = (viewportWidth - contentWidth) / 2;

  // 1. GỌI API LẤY DANH SÁCH VẬT PHẨM TỪ SERVER
  const fetchFeedPosts = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      // Build query params
      const params = new URLSearchParams();
      if (campus !== 'Tất cả cơ sở') params.append('campus', campus);
      if (type !== 'Tất cả') params.append('category', type);
      if (query.trim()) params.append('search', query.trim());

      const response = await apiFetch<{ items: FoundPost[] }>(`/items/feed?${params.toString()}`);

      if (response.success && response.data?.items) {
        setApiPosts(response.data.items);
      } else {
        // Nếu API chưa có dữ liệu hoặc fail, dùng fallback dữ liệu local từ AppState
        setApiPosts(localFoundPosts);
      }
    } catch (err) {
      console.error('Fetch feed error:', err);
      setApiPosts(localFoundPosts);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [campus, type, query, localFoundPosts]);

  // Gọi API mỗi khi thay đổi Filter / Search
  useEffect(() => {
    fetchFeedPosts();
  }, [fetchFeedPosts]);

  // Tính số lượng thông báo chưa đọc
  const myLostReportIds = new Set(
    lostReports.filter((report) => report.ownerId === currentUser.id).map((report) => report.id),
  );
  const unreadCount = matches.filter(
    (match) =>
      match.status === 'POSSIBLE' && !match.isRead && myLostReportIds.has(match.lostReportId),
  ).length;

  // 2. TỐI ƯU BỘ LỌC VÀ SẮP XẾP VẬT PHẨM (Client-side Fallback & Realtime Filter)
  const displayPosts = apiPosts.length > 0 ? apiPosts : localFoundPosts;

  const filteredPosts = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return displayPosts
      .filter((post) => post.status === 'OPEN')
      .filter((post) => matchesCampus(post.campus, campus))
      .filter((post) => type === 'Tất cả' || post.category === type)
      .filter(
        (post) =>
          !keyword ||
          [post.title, post.building, post.specificLocation, post.category, post.color]
            .join(' ')
            .toLowerCase()
            .includes(keyword),
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [campus, displayPosts, query, type]);

  const visiblePosts = showAll ? filteredPosts : filteredPosts.slice(0, RECENT_LIMIT);

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
          <View style={styles.intro}>
            <Text style={styles.title}>Tìm lại đồ thất lạc</Text>
            <Text style={styles.subtitle}>
              Duyệt đồ nhặt được trong trường. Báo mất của bạn luôn được giữ riêng tư.
            </Text>
          </View>

          {/* Thanh tìm kiếm */}
          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>⌕</Text>
            <TextInput
              autoCapitalize="none"
              onChangeText={setQuery}
              placeholder="Tìm theo tên đồ, tòa nhà, màu sắc..."
              placeholderTextColor={colors.textSubtle}
              returnKeyType="search"
              style={styles.searchInput}
              value={query}
            />
            {query ? (
              <Pressable accessibilityLabel="Xóa tìm kiếm" hitSlop={8} onPress={() => setQuery('')}>
                <Text style={styles.clear}>✕</Text>
              </Pressable>
            ) : null}
          </View>

          {/* Chips lọc cơ sở */}
          <ScrollView
            contentContainerStyle={styles.chips}
            horizontal
            showsHorizontalScrollIndicator={false}>
            {campusFilters.map((item) => {
              const active = campus === item;
              return (
                <Pressable
                  key={item}
                  onPress={() => setCampus(item)}
                  style={[styles.campusChip, active && styles.campusChipActive]}>
                  <Text style={[styles.campusChipText, active && styles.chipTextActive]}>
                    {item === 'Tất cả cơ sở' ? '⌖ ' : ''}
                    {item}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Chips lọc loại đồ */}
          <ScrollView
            contentContainerStyle={styles.chips}
            horizontal
            showsHorizontalScrollIndicator={false}>
            {typeFilters.map((item) => {
              const active = type === item;
              return (
                <Pressable
                  key={item}
                  onPress={() => setType(item)}
                  style={[styles.chip, active && styles.chipActive]}>
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{item}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Header danh sách */}
          <View style={styles.feedHeader}>
            <Text style={styles.feedTitle}>Vật phẩm gần đây</Text>
            {filteredPosts.length > RECENT_LIMIT && (
              <Pressable hitSlop={8} onPress={() => setShowAll((value) => !value)}>
                <Text style={styles.seeAll}>{showAll ? 'Thu gọn' : 'Xem tất cả'}</Text>
              </Pressable>
            )}
          </View>

          {/* Danh sách bài đăng & Loading Indicator */}
          {isLoading && !isRefreshing ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator color={colors.indigo} size="large" />
              <Text style={styles.loadingText}>Đang tải vật phẩm mới nhất...</Text>
            </View>
          ) : (
            <View style={styles.list}>
              {visiblePosts.map((post) => (
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

              {visiblePosts.length === 0 && (
                <View style={styles.empty}>
                  <Text style={styles.emptyTitle}>Chưa có vật phẩm phù hợp</Text>
                  <Text style={styles.emptyText}>Hãy đổi bộ lọc hoặc quay lại sau.</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Nút FAB Báo nhặt đồ */}
      <Pressable
        accessibilityRole="button"
        onPress={() => router.push({ pathname: '/(tabs)/create', params: { type: 'FOUND' } })}
        style={({ pressed }) => [styles.fab, pressed && styles.pressed]}>
        <Text style={styles.fabIcon}>＋</Text>
        <Text style={styles.fabText}>Báo nhặt được đồ</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.background, flex: 1 },
  scrollContent: { paddingBottom: 96 },
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
  intro: { gap: 4 },
  title: { color: colors.indigo, fontSize: 24, fontWeight: '900' },
  subtitle: { color: colors.textMuted, fontSize: 12, lineHeight: 18 },
  searchBox: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radii.medium,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    minHeight: 48,
    paddingHorizontal: 13,
    ...shadows.card,
  },
  searchIcon: { color: colors.textMuted, fontSize: 20 },
  searchInput: { color: colors.text, flex: 1, fontSize: 14, paddingVertical: 10 },
  clear: { color: colors.textMuted, fontSize: 14 },
  chips: { gap: 8, paddingRight: 16 },
  campusChip: {
    backgroundColor: colors.card,
    borderColor: colors.borderStrong,
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  campusChipActive: { backgroundColor: colors.indigo, borderColor: colors.indigo },
  campusChipText: { color: colors.text, fontSize: 12, fontWeight: '600' },
  chip: {
    backgroundColor: colors.indigoSoft,
    borderRadius: radii.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipActive: { backgroundColor: colors.blue },
  chipText: { color: colors.text, fontSize: 12 },
  chipTextActive: { color: colors.white, fontWeight: '800' },
  feedHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  feedTitle: { color: colors.text, fontSize: 17, fontWeight: '800' },
  seeAll: { color: colors.blueDark, fontSize: 13, fontWeight: '700' },
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
  fab: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.blue,
    borderRadius: radii.pill,
    bottom: 16,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 22,
    paddingVertical: 14,
    position: 'absolute',
    ...shadows.floating,
  },
  fabIcon: { color: colors.white, fontSize: 18, fontWeight: '800' },
  fabText: { color: colors.white, fontSize: 14, fontWeight: '800' },
  pressed: { opacity: 0.8 },
});