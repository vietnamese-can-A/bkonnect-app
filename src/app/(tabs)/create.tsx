import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { AppHeader } from '@/components/app-header';
import { FormField, FormTextInput } from '@/components/form-field';
import { ImagePickerField } from '@/components/image-picker-field';
import { PrimaryButton } from '@/components/primary-button';
import { colors, radii, shadows } from '@/constants/theme';
import { useAppState } from '@/features/app-state/app-state-context';

type CreateMode = 'LOST' | 'FOUND';

const categories = [
  'Máy tính',
  'Điện tử',
  'Giấy tờ / Thẻ',
  'Ví & Ba lô',
  'Chìa khóa',
  'Sách vở',
  'Khác',
];
const campuses = ['Cơ sở 1 (Lý Thường Kiệt)', 'Cơ sở 2 (Dĩ An)'];

function initialDateTime() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 16);
}

function parseDateTime(value: string) {
  const timestamp = new Date(value.trim().replace(' ', 'T'));
  return Number.isNaN(timestamp.getTime()) ? undefined : timestamp.toISOString();
}

export default function CreateScreen() {
  const params = useLocalSearchParams<{ type?: string }>();
  const { createFoundPost, createLostReport } = useAppState();
  const { width } = useWindowDimensions();
  const viewportWidth = width > 0 ? width : 390;
  const contentWidth = Math.min(viewportWidth - 32, 608);
  const contentOffset = (viewportWidth - contentWidth) / 2;
  const successWidth = Math.min(viewportWidth - 40, 520);
  const [mode, setMode] = useState<CreateMode>(() =>
    params.type === 'FOUND' ? 'FOUND' : 'LOST',
  );
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('Máy tính');
  const [color, setColor] = useState('');
  const [occurredAt, setOccurredAt] = useState(initialDateTime);
  const [possibleLocations, setPossibleLocations] = useState('');
  const [privateDescription, setPrivateDescription] = useState('');
  const [campus, setCampus] = useState(campuses[0]);
  const [building, setBuilding] = useState('');
  const [specificLocation, setSpecificLocation] = useState('');
  const [custody, setCustody] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState<string>();
  const [error, setError] = useState('');
  const [lostSuccess, setLostSuccess] = useState<{ id: string; matchCount: number }>();

  const resetForm = () => {
    setItemName('');
    setColor('');
    setOccurredAt(initialDateTime());
    setPossibleLocations('');
    setPrivateDescription('');
    setBuilding('');
    setSpecificLocation('');
    setCustody('');
    setDescription('');
    setImageUri(undefined);
    setError('');
  };

  const changeMode = (nextMode: CreateMode) => {
    setMode(nextMode);
    setLostSuccess(undefined);
    setError('');
  };

  const handleSubmit = () => {
    const eventTime = parseDateTime(occurredAt);
    if (!itemName.trim() || !category || !color.trim() || !eventTime) {
      setError('Vui lòng nhập tên, danh mục, màu sắc và ngày giờ hợp lệ.');
      return;
    }

    if (mode === 'LOST') {
      const locations = possibleLocations
        .split(',')
        .map((location) => location.trim())
        .filter(Boolean);

      if (locations.length === 0 || !privateDescription.trim()) {
        setError('Báo mất cần ít nhất một vị trí có thể làm rơi và mô tả nhận dạng riêng tư.');
        return;
      }

      const result = createLostReport({
        itemName: itemName.trim(),
        category,
        color: color.trim(),
        privateDescription: privateDescription.trim(),
        possibleLocations: locations,
        lostAt: eventTime,
      });
      resetForm();
      setLostSuccess(result);
      return;
    }

    if (
      !campus.trim() ||
      !building.trim() ||
      !specificLocation.trim() ||
      !custody.trim() ||
      !description.trim()
    ) {
      setError('Vui lòng điền đầy đủ vị trí, nơi giữ đồ và mô tả công khai.');
      return;
    }

    createFoundPost({
      title: itemName.trim(),
      category,
      color: color.trim(),
      campus,
      building: building.trim(),
      specificLocation: specificLocation.trim(),
      foundAt: eventTime,
      custody: custody.trim(),
      description: description.trim(),
      imageUri,
    });
    resetForm();
    router.navigate('/(tabs)');
  };

  if (lostSuccess) {
    return (
      <View style={styles.screen}>
        <AppHeader title="Báo mất riêng tư" subtitle="BKonnect HCMUT" />
        <ScrollView contentContainerStyle={styles.successContent}>
          <View style={[styles.successCard, { width: successWidth }]}>
            <View style={styles.successIcon}>
              <Text style={styles.successIconText}>✓</Text>
            </View>
            <Text style={styles.successTitle}>Đã lưu báo mất riêng tư</Text>
            <Text style={styles.successText}>
              Báo mất không xuất hiện trên Home và chỉ được dùng để đối chiếu với các món đồ nhặt
              được.
            </Text>
            <View style={styles.matchResult}>
              <Text style={styles.matchResultValue}>{lostSuccess.matchCount}</Text>
              <View style={styles.matchResultCopy}>
                <Text style={styles.matchResultTitle}>khớp tiềm năng được tìm thấy</Text>
                <Text style={styles.matchResultText}>
                  {lostSuccess.matchCount > 0
                    ? 'Bạn có thông báo mới trong Trung tâm khớp.'
                    : 'BKonnect sẽ tiếp tục đối chiếu khi có đồ mới được đăng.'}
                </Text>
              </View>
            </View>
            {lostSuccess.matchCount > 0 && (
              <PrimaryButton label="Xem khớp tiềm năng" onPress={() => router.push('/matches')} />
            )}
            <PrimaryButton
              label="Về trang chủ"
              onPress={() => router.navigate('/(tabs)')}
              tone="secondary"
            />
            <Pressable onPress={() => setLostSuccess(undefined)}>
              <Text style={styles.createAnother}>Tạo báo cáo khác</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <AppHeader title="Kết nối đồ thất lạc" subtitle="BKonnect HCMUT" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={[styles.content, { marginLeft: contentOffset, width: contentWidth }]}>
          <View style={styles.choiceIntro}>
            <Text style={styles.choiceTitle}>Bạn muốn làm gì?</Text>
            <Text style={styles.choiceText}>Chọn đúng tình huống để bảo vệ thông tin và tìm đồ nhanh hơn.</Text>
          </View>

          <View style={styles.typePicker}>
            {(['LOST', 'FOUND'] as CreateMode[]).map((item) => {
              const active = item === mode;
              return (
                <Pressable
                  key={item}
                  onPress={() => changeMode(item)}
                  style={[styles.typeButton, active && styles.typeButtonActive]}>
                  <Text style={[styles.typeLabel, active && styles.typeLabelActive]}>
                    {item === 'LOST' ? 'Tôi làm mất đồ' : 'Tôi nhặt được đồ'}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={[styles.banner, mode === 'LOST' ? styles.lostBanner : styles.foundBanner]}>
            <View style={styles.bannerIcon}>
              <Text style={styles.bannerIconText}>{mode === 'LOST' ? '◆' : '✓'}</Text>
            </View>
            <View style={styles.bannerCopy}>
              <Text style={styles.bannerTitle}>
                {mode === 'LOST' ? 'Báo mất được giữ riêng tư' : 'Bài nhặt đồ được đăng công khai'}
              </Text>
              <Text style={styles.bannerText}>
                {mode === 'LOST'
                  ? 'Chỉ hệ thống matching sử dụng thông tin này. Báo mất không xuất hiện trên Home.'
                  : 'Không đăng chi tiết bí mật; hãy giữ chúng để xác minh đúng chủ sở hữu.'}
              </Text>
            </View>
          </View>

          {error ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {mode === 'FOUND' && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>
                Ảnh món đồ <Text style={styles.optional}>(không bắt buộc)</Text>
              </Text>
              <ImagePickerField imageUri={imageUri} onChange={setImageUri} />
            </View>
          )}

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Thông tin nhận dạng</Text>
            <FormField label="Tên món đồ" required>
              <FormTextInput
                maxLength={80}
                onChangeText={setItemName}
                placeholder="Ví dụ: Máy tính Casio fx-580VN X"
                value={itemName}
              />
            </FormField>

            <FormField label="Danh mục" required>
              <View style={styles.chipWrap}>
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
              </View>
            </FormField>

            <FormField label="Màu sắc" required>
              <FormTextInput
                maxLength={40}
                onChangeText={setColor}
                placeholder="Ví dụ: Xanh dương"
                value={color}
              />
            </FormField>

            <FormField
              label={mode === 'LOST' ? 'Ngày giờ làm mất' : 'Ngày giờ nhặt được'}
              required
              hint="Định dạng: YYYY-MM-DDTHH:mm">
              <FormTextInput
                autoCapitalize="none"
                onChangeText={setOccurredAt}
                placeholder="2026-09-29T09:30"
                value={occurredAt}
              />
            </FormField>
          </View>

          {mode === 'LOST' ? (
            <>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Vị trí có thể làm rơi</Text>
                <FormField
                  label="Các khu vực có thể"
                  required
                  hint="Phân cách nhiều vị trí bằng dấu phẩy.">
                  <FormTextInput
                    onChangeText={setPossibleLocations}
                    placeholder="Ví dụ: Tòa H6, Cơ sở 2, tuyến xe buýt 50"
                    value={possibleLocations}
                  />
                </FormField>
              </View>

              <View style={styles.card}>
                <FormField
                  label="Mô tả riêng tư / đặc điểm phân biệt"
                  required
                  hint="Thông tin này không công khai và chỉ dùng để xác minh.">
                  <FormTextInput
                    maxLength={600}
                    multiline
                    onChangeText={setPrivateDescription}
                    placeholder="Nhãn tên, vết xước, vật bên trong hoặc đặc điểm chỉ bạn biết..."
                    value={privateDescription}
                  />
                </FormField>
              </View>
            </>
          ) : (
            <>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>⌖ Vị trí nhặt được</Text>
                <FormField label="Cơ sở" required>
                  <View style={styles.campusOptions}>
                    {campuses.map((item) => {
                      const active = campus === item;
                      return (
                        <Pressable
                          key={item}
                          onPress={() => setCampus(item)}
                          style={[styles.campusButton, active && styles.campusButtonActive]}>
                          <Text style={[styles.campusText, active && styles.campusTextActive]}>
                            {item}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </FormField>
                <FormField label="Tòa nhà" required>
                  <FormTextInput
                    onChangeText={setBuilding}
                    placeholder="Ví dụ: Tòa H6"
                    value={building}
                  />
                </FormField>
                <FormField label="Vị trí cụ thể" required>
                  <FormTextInput
                    onChangeText={setSpecificLocation}
                    placeholder="Ví dụ: Phòng 106, gần cửa sổ"
                    value={specificLocation}
                  />
                </FormField>
              </View>

              <View style={styles.card}>
                <FormField label="Hiện món đồ đang được giữ ở đâu?" required>
                  <FormTextInput
                    onChangeText={setCustody}
                    placeholder="Ví dụ: Quầy bảo vệ cổng chính"
                    value={custody}
                  />
                </FormField>
                <FormField
                  label="Mô tả công khai"
                  required
                  hint="Không nêu chi tiết bí mật dùng để xác minh chủ sở hữu.">
                  <FormTextInput
                    maxLength={600}
                    multiline
                    onChangeText={setDescription}
                    placeholder="Mô tả tình trạng và hoàn cảnh nhặt được..."
                    value={description}
                  />
                </FormField>
              </View>
            </>
          )}

          <PrimaryButton
            label={mode === 'LOST' ? 'Lưu báo mất riêng tư' : 'Đăng đồ nhặt được'}
            onPress={handleSubmit}
          />
          <Text style={styles.honorCode}>
            Bằng việc gửi thông tin, bạn đồng ý với Quy tắc Danh dự HCMUT.
          </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { backgroundColor: colors.backgroundCool, flex: 1 },
  content: {
    gap: 14,
    marginTop: 16,
    marginBottom: 32,
  },
  choiceIntro: { gap: 3 },
  choiceTitle: { color: colors.text, fontSize: 19, fontWeight: '800' },
  choiceText: { color: colors.textMuted, fontSize: 12, lineHeight: 18 },
  typePicker: { backgroundColor: '#E2E7FF', borderRadius: radii.small, flexDirection: 'row', padding: 4 },
  typeButton: { alignItems: 'center', borderRadius: radii.small, flex: 1, padding: 10 },
  typeButtonActive: { backgroundColor: colors.indigo },
  typeLabel: { color: colors.textMuted, fontSize: 13, fontWeight: '700' },
  typeLabelActive: { color: colors.white },
  banner: { borderRadius: radii.medium, borderWidth: 1, flexDirection: 'row', gap: 10, padding: 13 },
  lostBanner: { backgroundColor: '#F0F5FF', borderColor: '#BFDBFE' },
  foundBanner: { backgroundColor: colors.blueSoft, borderColor: '#BFDBFE' },
  bannerIcon: { alignItems: 'center', backgroundColor: colors.indigo, borderRadius: 12, height: 32, justifyContent: 'center', width: 32 },
  bannerIconText: { color: colors.white, fontWeight: '900' },
  bannerCopy: { flex: 1, gap: 3 },
  bannerTitle: { color: colors.indigo, fontSize: 14, fontWeight: '800' },
  bannerText: { color: '#475569', fontSize: 12, lineHeight: 18 },
  errorBanner: { backgroundColor: colors.dangerSoft, borderColor: '#FECDD3', borderRadius: radii.medium, borderWidth: 1, padding: 12 },
  errorText: { color: colors.danger, fontSize: 12, fontWeight: '700', lineHeight: 18 },
  card: { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radii.medium, borderWidth: 1, gap: 14, padding: 16, ...shadows.card },
  cardTitle: { color: colors.text, fontSize: 16, fontWeight: '800' },
  optional: { color: colors.textMuted, fontSize: 12, fontWeight: '500' },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { backgroundColor: '#F1F5F9', borderRadius: radii.pill, paddingHorizontal: 12, paddingVertical: 7 },
  chipActive: { backgroundColor: colors.indigo },
  chipText: { color: '#334155', fontSize: 12 },
  chipTextActive: { color: colors.white, fontWeight: '700' },
  campusOptions: { backgroundColor: '#F1F5F9', borderRadius: radii.small, flexDirection: 'row', padding: 4 },
  campusButton: { alignItems: 'center', borderRadius: 4, flex: 1, justifyContent: 'center', minHeight: 54, padding: 8 },
  campusButtonActive: { backgroundColor: colors.white, ...shadows.card },
  campusText: { color: colors.textMuted, fontSize: 11, textAlign: 'center' },
  campusTextActive: { color: colors.indigo, fontWeight: '800' },
  honorCode: { color: colors.textMuted, fontSize: 10, textAlign: 'center' },
  successContent: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  successCard: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radii.large,
    borderWidth: 1,
    gap: 14,
    padding: 24,
    ...shadows.floating,
  },
  successIcon: { alignItems: 'center', backgroundColor: colors.success, borderRadius: 34, height: 68, justifyContent: 'center', width: 68 },
  successIconText: { color: colors.white, fontSize: 28, fontWeight: '900' },
  successTitle: { color: colors.text, fontSize: 21, fontWeight: '900', textAlign: 'center' },
  successText: { color: colors.textMuted, fontSize: 13, lineHeight: 20, textAlign: 'center' },
  matchResult: { alignItems: 'center', backgroundColor: colors.indigoTint, borderRadius: radii.medium, flexDirection: 'row', gap: 12, padding: 14, width: '100%' },
  matchResultValue: { color: colors.indigo, fontSize: 31, fontWeight: '900' },
  matchResultCopy: { flex: 1 },
  matchResultTitle: { color: colors.text, fontSize: 13, fontWeight: '800' },
  matchResultText: { color: colors.textMuted, fontSize: 11, lineHeight: 16, marginTop: 2 },
  createAnother: { color: colors.blueDark, fontSize: 13, fontWeight: '700', padding: 8 },
});
