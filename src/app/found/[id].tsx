import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/app-header';
import { FormField, FormTextInput } from '@/components/form-field';
import { ImagePickerField } from '@/components/image-picker-field';
import { PrimaryButton } from '@/components/primary-button';
import {
  FoundBadge,
  FoundPostStatusBadge,
  MatchStatusBadge,
} from '@/components/status-badge';
import { colors, radii, shadows } from '@/constants/theme';
import { useAppState } from '@/features/app-state/app-state-context';
import { getFoundPostImageSource } from '@/features/posts/found-post-images';
import { formatDateTime, formatRelativeTime } from '@/utils/date';

export default function FoundItemDetailScreen() {
  const { id, matchId } = useLocalSearchParams<{ id: string; matchId?: string }>();
  const {
    completeMatch,
    currentUser,
    dismissMatch,
    foundPosts,
    getUser,
    lostReports,
    matches,
  } = useAppState();
  const [verificationOpen, setVerificationOpen] = useState(false);
  const [verificationText, setVerificationText] = useState('');
  const [proofImageUri, setProofImageUri] = useState<string>();
  const [confirmVisible, setConfirmVisible] = useState(false);

  const post = foundPosts.find((item) => item.id === id);
  const myReportIds = new Set(
    lostReports.filter((report) => report.ownerId === currentUser.id).map((report) => report.id),
  );
  const matchedRecord = matches.find(
    (item) =>
      item.foundPostId === id &&
      myReportIds.has(item.lostReportId) &&
      (!matchId || item.id === matchId),
  );

  if (!post) {
    return (
      <View style={styles.screen}>
        <AppHeader title="Chi tiết đồ nhặt được" showBack />
        <View style={styles.notFound}>
          <Text style={styles.notFoundTitle}>Không tìm thấy vật phẩm</Text>
          <PrimaryButton label="Quay về trang chủ" onPress={() => router.replace('/(tabs)')} />
        </View>
      </View>
    );
  }

  const finder = getUser(post.finderId);
  const imageSource = getFoundPostImageSource(post);
  const lostReport = matchedRecord
    ? lostReports.find((report) => report.id === matchedRecord.lostReportId)
    : undefined;

  const handleComplete = () => {
    if (!matchedRecord || matchedRecord.status !== 'POSSIBLE') return;
    completeMatch(matchedRecord.id);
    setConfirmVisible(false);
    setVerificationOpen(false);
  };

  return (
    <View style={styles.screen}>
      <AppHeader title="Chi tiết đồ nhặt được" subtitle="BKonnect HCMUT" showBack />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.imageWrap}>
          {imageSource ? (
            <Image source={imageSource} resizeMode="cover" style={styles.heroImage} />
          ) : (
            <View style={[styles.heroImage, styles.heroPlaceholder]}>
              <Text style={styles.heroPlaceholderText}>ĐỒ NHẶT ĐƯỢC</Text>
            </View>
          )}
          <View style={styles.imageScrim} />
          <View style={styles.imageBadges}>
            <FoundBadge />
            <View style={styles.idPill}>
              <Text style={styles.idPillText}>#{post.id.slice(-10).toUpperCase()}</Text>
            </View>
          </View>
          <Text style={styles.imageTime}>{formatRelativeTime(post.createdAt)}</Text>
        </View>

        <View style={styles.body}>
          <View style={styles.titleBlock}>
            <Text style={styles.title}>{post.title}</Text>
            <Text style={styles.location}>
              ⌖ {post.campus} · {post.building} · {post.specificLocation}
            </Text>
            <View style={styles.badgeRow}>
              <FoundPostStatusBadge status={post.status} />
              <View style={styles.categoryPill}>
                <Text style={styles.categoryText}>{post.category}</Text>
              </View>
              <View style={styles.categoryPill}>
                <Text style={styles.categoryText}>{post.color}</Text>
              </View>
            </View>
          </View>

          {matchedRecord?.status === 'COMPLETED' && (
            <View style={styles.completedBanner}>
              <View style={styles.completedIcon}>
                <Text style={styles.completedIconText}>✓</Text>
              </View>
              <View style={styles.flex}>
                <Text style={styles.completedTitle}>Đã hoàn tất</Text>
                <Text style={styles.completedText}>
                  Món đồ đã được trả lại cho chủ sở hữu.
                </Text>
              </View>
            </View>
          )}

          {matchedRecord?.status === 'DISMISSED' && (
            <View style={styles.dismissedBanner}>
              <Text style={styles.dismissedTitle}>Đã đánh dấu không trùng khớp</Text>
              <Text style={styles.dismissedText}>
                Kết quả này đã được bỏ qua và không còn là thông báo đang hoạt động.
              </Text>
            </View>
          )}

          {matchedRecord && lostReport && matchedRecord.status === 'POSSIBLE' && (
            <View style={styles.matchCard}>
              <View style={styles.matchHeader}>
                <View style={styles.matchTitleWrap}>
                  <Text style={styles.matchEyebrow}>MATCHING THEO QUY TẮC</Text>
                  <Text style={styles.matchTitle}>Vật phẩm có thể trùng khớp</Text>
                </View>
                <Text style={styles.matchScore}>{matchedRecord.score}/10</Text>
              </View>
              <Text style={styles.matchReport}>Báo mất: {lostReport.itemName}</Text>
              <View style={styles.reasonWrap}>
                {matchedRecord.reasons.map((reason) => (
                  <View key={reason} style={styles.reasonPill}>
                    <Text style={styles.reasonText}>✓ {reason}</Text>
                  </View>
                ))}
              </View>
              <MatchStatusBadge status={matchedRecord.status} />
            </View>
          )}

          <View style={styles.infoGrid}>
            <View style={styles.compactInfoCard}>
              <Text style={styles.infoLabel}>THỜI GIAN NHẶT</Text>
              <Text style={styles.infoValue}>{formatDateTime(post.foundAt)}</Text>
            </View>
            <View style={styles.compactInfoCard}>
              <Text style={styles.infoLabel}>HIỆN ĐANG GIỮ TẠI</Text>
              <Text style={styles.infoValue}>{post.custody}</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.eyebrow}>NGƯỜI NHẶT</Text>
            <View style={styles.profileRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{finder?.initials ?? '?'}</Text>
              </View>
              <View style={styles.flex}>
                <Text style={styles.finderName}>{finder?.name ?? 'Sinh viên HCMUT'}</Text>
                <Text style={styles.finderFaculty}>{finder?.faculty ?? 'Tài khoản HCMUT'}</Text>
              </View>
              <Text style={styles.verified}>✓ Đã xác minh</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.sectionTitle}>Mô tả công khai</Text>
            <Text style={styles.description}>{post.description}</Text>
          </View>

          <View style={styles.locationCard}>
            <View style={styles.locationIcon}>
              <Text style={styles.locationIconText}>⌖</Text>
            </View>
            <View style={styles.flex}>
              <Text style={styles.locationCardTitle}>{post.building}</Text>
              <Text style={styles.locationCardText}>{post.specificLocation}</Text>
            </View>
          </View>

          {matchedRecord?.status === 'POSSIBLE' && !verificationOpen && (
            <View style={styles.matchActions}>
              <PrimaryButton
                label="Không phải đồ của tôi"
                onPress={() => dismissMatch(matchedRecord.id)}
                style={styles.actionButton}
                tone="secondary"
              />
              <PrimaryButton
                label="Tiến hành xác minh"
                onPress={() => setVerificationOpen(true)}
                style={styles.actionButton}
              />
            </View>
          )}

          {matchedRecord?.status === 'POSSIBLE' && verificationOpen && (
            <View style={styles.verificationCard}>
              <View style={styles.verificationHeader}>
                <View style={styles.verificationIcon}>
                  <Text style={styles.verificationIconText}>✓</Text>
                </View>
                <View style={styles.flex}>
                  <Text style={styles.verificationTitle}>Xác minh & kết nối an toàn</Text>
                  <Text style={styles.verificationSubtitle}>
                    Đối chiếu đặc điểm riêng tư trước khi hẹn bàn giao.
                  </Text>
                </View>
              </View>

              <View style={styles.contactBox}>
                <Text style={styles.contactLabel}>LIÊN HỆ NGƯỜI NHẶT</Text>
                <Text style={styles.contactName}>{finder?.name ?? 'Sinh viên HCMUT'}</Text>
                <Text style={styles.contactEmail}>{finder?.email ?? 'Email HCMUT chưa có'}</Text>
              </View>

              <View style={styles.safetyBox}>
                <Text style={styles.safetyTitle}>Bàn giao an toàn</Text>
                <Text style={styles.safetyText}>
                  Gặp tại nơi công cộng trong khuôn viên HCMUT. Không chia sẻ mật khẩu hoặc mã xác
                  thực. Hãy kiểm tra lại đặc điểm món đồ trước khi xác nhận.
                </Text>
              </View>

              <FormField
                label="Ghi chú xác minh"
                hint="Không bắt buộc trong bản demo; chỉ dùng khi trao đổi trực tiếp với người nhặt.">
                <FormTextInput
                  maxLength={500}
                  multiline
                  onChangeText={setVerificationText}
                  placeholder="Mô tả đặc điểm riêng tư hoặc nội dung đã đối chiếu..."
                  value={verificationText}
                />
              </FormField>

              <FormField label="Ảnh chứng minh (không bắt buộc)">
                <ImagePickerField
                  description="Ảnh cũ của món đồ hoặc giấy tờ chứng minh liên quan."
                  imageUri={proofImageUri}
                  onChange={setProofImageUri}
                />
              </FormField>

              <PrimaryButton
                label="Đã nhận lại đồ"
                onPress={() => setConfirmVisible(true)}
                tone="success"
              />
              <Pressable onPress={() => setVerificationOpen(false)} style={styles.cancelButton}>
                <Text style={styles.cancelText}>Thu gọn phần xác minh</Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>

      <Modal
        animationType="fade"
        onRequestClose={() => setConfirmVisible(false)}
        transparent
        visible={confirmVisible}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalRoot}>
          <Pressable style={styles.scrim} onPress={() => setConfirmVisible(false)} />
          <SafeAreaView edges={['bottom']} style={styles.confirmSheet}>
            <View style={styles.handle} />
            <Text style={styles.confirmTitle}>Xác nhận đã nhận lại đồ?</Text>
            <Text style={styles.confirmText}>
              Thao tác này sẽ đánh dấu báo mất là ĐÃ TÌM LẠI, bài nhặt đồ là ĐÃ TRẢ và hoàn tất
              matching.
            </Text>
            <PrimaryButton label="Xác nhận đã nhận lại đồ" onPress={handleComplete} tone="success" />
            <PrimaryButton
              label="Chưa, quay lại kiểm tra"
              onPress={() => setConfirmVisible(false)}
              tone="secondary"
            />
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { backgroundColor: colors.background, flex: 1 },
  content: { alignSelf: 'center', maxWidth: 640, paddingBottom: 32, width: '100%' },
  imageWrap: { backgroundColor: colors.indigoSoft, height: 294, overflow: 'hidden', position: 'relative' },
  heroImage: { height: '100%', width: '100%' },
  heroPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  heroPlaceholderText: { color: colors.indigo, fontSize: 18, fontWeight: '900' },
  imageScrim: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.12)' },
  imageBadges: { flexDirection: 'row', gap: 6, left: 14, position: 'absolute', top: 14 },
  idPill: { backgroundColor: 'rgba(0,0,86,0.84)', borderRadius: radii.pill, paddingHorizontal: 10, paddingVertical: 4 },
  idPillText: { color: colors.white, fontSize: 10, fontWeight: '800' },
  imageTime: { backgroundColor: 'rgba(0,0,0,0.58)', borderRadius: radii.pill, bottom: 14, color: colors.white, fontSize: 11, fontWeight: '700', paddingHorizontal: 10, paddingVertical: 5, position: 'absolute', right: 14 },
  body: { gap: 14, padding: 16 },
  titleBlock: { gap: 7 },
  title: { color: colors.text, fontSize: 22, fontWeight: '800', lineHeight: 29 },
  location: { color: '#454653', fontSize: 12, lineHeight: 18 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  categoryPill: { backgroundColor: colors.indigoSoft, borderRadius: radii.pill, paddingHorizontal: 9, paddingVertical: 4 },
  categoryText: { color: colors.indigo, fontSize: 10, fontWeight: '800' },
  completedBanner: { alignItems: 'center', backgroundColor: colors.successSoft, borderColor: '#A7F3D0', borderRadius: radii.medium, borderWidth: 1, flexDirection: 'row', gap: 10, padding: 12 },
  completedIcon: { alignItems: 'center', backgroundColor: colors.success, borderRadius: 14, height: 34, justifyContent: 'center', width: 34 },
  completedIconText: { color: colors.white, fontWeight: '900' },
  completedTitle: { color: '#047857', fontSize: 15, fontWeight: '800' },
  completedText: { color: '#065F46', fontSize: 12, lineHeight: 17, marginTop: 2 },
  dismissedBanner: { backgroundColor: colors.dangerSoft, borderColor: '#FECDD3', borderRadius: radii.medium, borderWidth: 1, padding: 12 },
  dismissedTitle: { color: colors.danger, fontSize: 13, fontWeight: '800' },
  dismissedText: { color: '#881337', fontSize: 11, lineHeight: 17, marginTop: 3 },
  matchCard: { backgroundColor: colors.warningSoft, borderColor: '#FDE68A', borderRadius: radii.large, borderWidth: 1, gap: 11, padding: 14 },
  matchHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  matchTitleWrap: { flex: 1 },
  matchEyebrow: { color: colors.warning, fontSize: 9, fontWeight: '900', letterSpacing: 0.6 },
  matchTitle: { color: '#78350F', fontSize: 16, fontWeight: '900', marginTop: 2 },
  matchScore: { color: colors.warning, fontSize: 24, fontWeight: '900' },
  matchReport: { color: '#78350F', fontSize: 12, fontWeight: '700' },
  reasonWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  reasonPill: { backgroundColor: '#FEF3C7', borderRadius: radii.pill, paddingHorizontal: 9, paddingVertical: 5 },
  reasonText: { color: '#92400E', fontSize: 10, fontWeight: '700' },
  infoGrid: { flexDirection: 'row', gap: 10 },
  compactInfoCard: { backgroundColor: colors.indigoTint, borderRadius: radii.medium, flex: 1, gap: 4, padding: 11 },
  infoLabel: { color: colors.textMuted, fontSize: 9, fontWeight: '800', letterSpacing: 0.4 },
  infoValue: { color: colors.text, fontSize: 12, fontWeight: '700', lineHeight: 17 },
  infoCard: { backgroundColor: colors.card, borderRadius: radii.medium, gap: 8, padding: 14, ...shadows.card },
  eyebrow: { color: '#454653', fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  profileRow: { alignItems: 'center', flexDirection: 'row', gap: 9 },
  avatar: { alignItems: 'center', backgroundColor: '#E0E0FF', borderRadius: 14, height: 42, justifyContent: 'center', width: 42 },
  avatarText: { color: colors.indigoDark, fontSize: 14, fontWeight: '800' },
  finderName: { color: colors.text, fontSize: 15, fontWeight: '800' },
  finderFaculty: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
  verified: { color: colors.blueDark, fontSize: 10, fontWeight: '800' },
  sectionTitle: { color: colors.text, fontSize: 14, fontWeight: '800' },
  description: { color: '#454653', fontSize: 14, lineHeight: 22 },
  locationCard: { alignItems: 'center', backgroundColor: colors.indigoTint, borderRadius: radii.medium, flexDirection: 'row', gap: 10, padding: 10 },
  locationIcon: { alignItems: 'center', backgroundColor: 'rgba(0,98,159,0.1)', borderRadius: radii.small, height: 38, justifyContent: 'center', width: 38 },
  locationIconText: { color: colors.blueDark, fontSize: 20, fontWeight: '800' },
  locationCardTitle: { color: colors.text, fontSize: 13, fontWeight: '800' },
  locationCardText: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  matchActions: { flexDirection: 'row', gap: 10 },
  actionButton: { flex: 1, minHeight: 50 },
  verificationCard: { backgroundColor: colors.card, borderColor: '#BFDBFE', borderRadius: radii.large, borderWidth: 1, gap: 14, padding: 15, ...shadows.floating },
  verificationHeader: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  verificationIcon: { alignItems: 'center', backgroundColor: colors.blueSoft, borderRadius: radii.medium, height: 42, justifyContent: 'center', width: 42 },
  verificationIconText: { color: colors.blue, fontSize: 19, fontWeight: '900' },
  verificationTitle: { color: colors.text, fontSize: 16, fontWeight: '900' },
  verificationSubtitle: { color: colors.textMuted, fontSize: 11, marginTop: 3 },
  contactBox: { backgroundColor: colors.indigoTint, borderRadius: radii.medium, padding: 12 },
  contactLabel: { color: colors.textMuted, fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  contactName: { color: colors.text, fontSize: 14, fontWeight: '800', marginTop: 5 },
  contactEmail: { color: colors.blueDark, fontSize: 12, marginTop: 2 },
  safetyBox: { backgroundColor: colors.warningSoft, borderRadius: radii.medium, padding: 12 },
  safetyTitle: { color: colors.warning, fontSize: 13, fontWeight: '800' },
  safetyText: { color: '#78350F', fontSize: 11, lineHeight: 17, marginTop: 4 },
  cancelButton: { alignItems: 'center', padding: 8 },
  cancelText: { color: colors.textMuted, fontSize: 12, fontWeight: '700' },
  notFound: { alignItems: 'center', flex: 1, gap: 18, justifyContent: 'center', padding: 24 },
  notFoundTitle: { color: colors.text, fontSize: 20, fontWeight: '800' },
  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  scrim: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(19,27,46,0.64)' },
  confirmSheet: { backgroundColor: colors.card, borderTopLeftRadius: 22, borderTopRightRadius: 22, gap: 13, padding: 18, paddingTop: 10 },
  handle: { alignSelf: 'center', backgroundColor: colors.borderStrong, borderRadius: 2, height: 4, marginBottom: 6, width: 42 },
  confirmTitle: { color: colors.text, fontSize: 19, fontWeight: '900', textAlign: 'center' },
  confirmText: { color: colors.textMuted, fontSize: 13, lineHeight: 20, textAlign: 'center' },
});
