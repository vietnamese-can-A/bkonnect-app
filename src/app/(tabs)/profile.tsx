import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/app-header';
import { colors, radii, shadows } from '@/constants/theme';
import { useAppState } from '@/features/app-state/app-state-context';

export default function ProfileScreen() {
  const { currentUser, foundPosts, lostReports, matches, switchUser, users } = useAppState();
  const myLostReports = lostReports.filter((report) => report.ownerId === currentUser.id);
  const myLostIds = new Set(myLostReports.map((report) => report.id));
  const myMatches = matches.filter((match) => myLostIds.has(match.lostReportId));
  const myFoundPosts = foundPosts.filter((post) => post.finderId === currentUser.id);

  return (
    <SafeAreaView edges={['bottom']} style={styles.safeArea}>
      <AppHeader title="Tài khoản" subtitle="Hồ sơ sinh viên HCMUT" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{currentUser.initials}</Text>
          </View>
          <Text style={styles.name}>{currentUser.name}</Text>
          <Text style={styles.studentId}>{currentUser.studentId}</Text>
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>✓ Sinh viên HCMUT mock đã xác minh</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <Stat value={myLostReports.length} label="Báo mất" />
          <View style={styles.divider} />
          <Stat value={myFoundPosts.length} label="Đã nhặt" />
          <View style={styles.divider} />
          <Stat value={myMatches.length} label="Khớp" />
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Thông tin sinh viên</Text>
          <InfoRow label="Họ và tên" value={currentUser.name} />
          <InfoRow label="Email HCMUT" value={currentUser.email} />
          <InfoRow label="Mã số sinh viên" value={currentUser.studentId} />
          <InfoRow label="Khoa" value={currentUser.faculty} last />
        </View>

        <View style={styles.safetyCard}>
          <Text style={styles.safetyTitle}>BKonnect an toàn</Text>
          <Text style={styles.safetyText}>
            Báo mất luôn riêng tư. Khi bàn giao, hãy gặp tại nơi công cộng trong HCMUT và không chia
            sẻ mật khẩu hoặc mã xác thực.
          </Text>
        </View>

        <View style={styles.accountCard}>
          <View style={styles.demoTitleRow}>
            <Text style={styles.sectionTitle}>Chuyển vai trò</Text>
            <View style={styles.demoBadge}>
              <Text style={styles.demoBadgeText}>DEMO ONLY</Text>
            </View>
          </View>
          <Text style={styles.accountHint}>
            Tiện ích trình diễn hai phía người mất và người nhặt. Không cần dùng cho luồng bình thường.
          </Text>
          <View style={styles.accountList}>
            {users.map((user) => {
              const active = user.id === currentUser.id;
              return (
                <Pressable
                  key={user.id}
                  onPress={() => switchUser(user.id)}
                  style={({ pressed }) => [
                    styles.accountRow,
                    active && styles.accountRowActive,
                    pressed && styles.accountRowPressed,
                  ]}>
                  <View style={[styles.smallAvatar, active && styles.smallAvatarActive]}>
                    <Text style={[styles.smallAvatarText, active && styles.smallAvatarTextActive]}>
                      {user.initials}
                    </Text>
                  </View>
                  <View style={styles.accountCopy}>
                    <Text style={styles.accountName}>{user.name}</Text>
                    <Text style={styles.accountMeta}>{user.email}</Text>
                  </View>
                  <Text style={[styles.accountAction, active && styles.accountActionActive]}>
                    {active ? 'Đang dùng' : 'Chuyển'}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function InfoRow({ label, value, last = false }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.infoRow, last && styles.infoRowLast]}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  content: { gap: 16, padding: 16, paddingBottom: 34 },
  profileCard: { alignItems: 'center', backgroundColor: colors.card, borderColor: colors.border, borderRadius: radii.large, borderWidth: 1, padding: 24, ...shadows.card },
  avatar: { alignItems: 'center', backgroundColor: colors.indigo, borderColor: colors.indigoSoft, borderRadius: radii.pill, borderWidth: 5, height: 84, justifyContent: 'center', width: 84 },
  avatarText: { color: colors.white, fontSize: 24, fontWeight: '900' },
  name: { color: colors.text, fontSize: 21, fontWeight: '800', marginTop: 14 },
  studentId: { color: colors.textMuted, fontSize: 14, marginTop: 4 },
  verifiedBadge: { backgroundColor: colors.successSoft, borderRadius: radii.pill, marginTop: 12, paddingHorizontal: 12, paddingVertical: 6 },
  verifiedText: { color: '#047857', fontSize: 12, fontWeight: '700' },
  statsRow: { alignItems: 'center', backgroundColor: colors.card, borderColor: colors.border, borderRadius: radii.large, borderWidth: 1, flexDirection: 'row', paddingVertical: 16 },
  stat: { alignItems: 'center', flex: 1 },
  statValue: { color: colors.indigo, fontSize: 21, fontWeight: '900' },
  statLabel: { color: colors.textMuted, fontSize: 11, marginTop: 3 },
  divider: { backgroundColor: colors.border, height: 34, width: 1 },
  infoCard: { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radii.large, borderWidth: 1, paddingHorizontal: 16 },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: '800', paddingVertical: 16 },
  infoRow: { borderTopColor: colors.border, borderTopWidth: 1, gap: 5, paddingVertical: 13 },
  infoRowLast: { paddingBottom: 16 },
  infoLabel: { color: colors.textMuted, fontSize: 11, fontWeight: '700' },
  infoValue: { color: colors.text, fontSize: 14, fontWeight: '600' },
  safetyCard: { backgroundColor: colors.warningSoft, borderRadius: radii.large, padding: 15 },
  safetyTitle: { color: colors.warning, fontSize: 14, fontWeight: '800' },
  safetyText: { color: '#78350F', fontSize: 12, lineHeight: 18, marginTop: 5 },
  accountCard: { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radii.large, borderWidth: 1, paddingHorizontal: 16, paddingBottom: 8 },
  demoTitleRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  demoBadge: { backgroundColor: colors.dangerSoft, borderRadius: radii.pill, paddingHorizontal: 8, paddingVertical: 4 },
  demoBadgeText: { color: colors.danger, fontSize: 9, fontWeight: '900', letterSpacing: 0.4 },
  accountHint: { color: colors.textMuted, fontSize: 12, lineHeight: 18, marginTop: -10 },
  accountList: { marginTop: 8 },
  accountRow: { alignItems: 'center', borderTopColor: colors.border, borderTopWidth: 1, flexDirection: 'row', gap: 10, paddingVertical: 11 },
  accountRowActive: { backgroundColor: colors.indigoTint },
  accountRowPressed: { opacity: 0.72 },
  smallAvatar: { alignItems: 'center', backgroundColor: colors.indigoSoft, borderRadius: radii.pill, height: 36, justifyContent: 'center', width: 36 },
  smallAvatarActive: { backgroundColor: colors.indigo },
  smallAvatarText: { color: colors.indigo, fontSize: 11, fontWeight: '800' },
  smallAvatarTextActive: { color: colors.white },
  accountCopy: { flex: 1 },
  accountName: { color: colors.text, fontSize: 13, fontWeight: '700' },
  accountMeta: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
  accountAction: { color: colors.blueDark, fontSize: 12, fontWeight: '700' },
  accountActionActive: { color: colors.success },
});
