import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
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
import { FormTextInput } from '@/components/form-field';
import { ImagePickerField } from '@/components/image-picker-field';
import { PrimaryButton } from '@/components/primary-button';
import { SelectField } from '@/components/select-field';
import { radii } from '@/constants/theme';
import { useAppState } from '@/features/app-state/app-state-context';
import { apiFetch } from '@/services/apiService';

// BỘ MÃ MÀU CHUẨN HCMUT / BKONNECT
const BRAND_COLORS = {
  primary: '#003B7A',      // Xanh Navy Bách Khoa
  primaryDark: '#002B5B',  // Xanh Navy đậm
  primaryLight: '#EBF3FC', // Xanh nhạt nền Banner
  textMain: '#0F172A',     // Màu chữ chính
  textSub: '#64748B',      // Màu chữ phụ
  bgScreen: '#F5F7FA',     // Màu nền màn hình
  border: '#CBD5E1',       // Viền input/card
  danger: '#DC2626',       // Màu cảnh báo/lỗi
};

const categories = [
  'Điện tử',
  'Ví & Ba lô',
  'Giấy tờ / Thẻ',
  'Chìa khóa',
  'Sách & Ghi chú',
];

const categoryCodeMap: Record<string, string> = {
  'Điện tử': 'EQUIPMENT',
  'Ví & Ba lô': 'WALLET_BAG',
  'Giấy tờ / Thẻ': 'DOCUMENT',
  'Chìa khóa': 'OTHER',
  'Sách & Ghi chú': 'OTHER',
};

const campuses = ['Cơ sở 1 (Lý Thường Kiệt)', 'Cơ sở 2 (Dĩ An)'];

const campusCodeMap: Record<string, string> = {
  [campuses[0]]: 'LTK',
  [campuses[1]]: 'DA',
};

const buildingsByCampus: Record<string, string[]> = {
  [campuses[0]]: [
    'Tòa H6 (Khoa KH&KT Máy tính)',
    'Tòa A1',
    'Tòa A4',
    'Hội trường A5',
    'Tòa B1',
    'Tòa B4',
    'Tòa C5',
    'Căn tin C6',
    'Thư viện',
  ],
  [campuses[1]]: ['Tòa H1', 'Tòa H2', 'Tòa H3', 'Tòa H6', 'Thư viện', 'Căn tin', 'Ký túc xá'],
};

const custodyOptions = [
  {
    title: 'Tôi đang tự giữ',
    subtitle: 'Trao đổi nhận đồ trực tiếp qua trò chuyện sinh viên đã xác minh trong ứng dụng.',
    code: 'KEEPING_BY_SELF',
  },
  {
    title: 'Đã gửi tại Bàn Bảo vệ',
    subtitle: 'Đã gửi tại phòng bảo vệ tòa nhà để sinh viên nhận lại an toàn, có giám sát.',
    code: 'KEEPING_BY_SECURITY',
  },
  {
    title: 'Đã nộp Văn phòng Đoàn - Hội',
    subtitle: 'Văn phòng Đoàn Thanh niên / Hội Sinh viên Bách Khoa.',
    code: 'KEEPING_BY_YOUTH_UNION',
  },
];

const WORD_LIMIT = 250;

function countWords(str: string) {
  const trimmed = str.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

export default function CreateScreen() {
  const { createFoundPost } = useAppState();
  const { width } = useWindowDimensions();

  const viewportWidth = width > 0 ? width : 390;
  const contentWidth = Math.min(viewportWidth - 32, 608);
  const contentOffset = (viewportWidth - contentWidth) / 2;

  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('Điện tử');
  const [campus, setCampus] = useState(campuses[0]);
  const [building, setBuilding] = useState('Tòa H6 (Khoa KH&KT Máy tính)');
  const buildingOptions = buildingsByCampus[campus] ?? [];
  const [specificLocation, setSpecificLocation] = useState('');
  const [custody, setCustody] = useState(custodyOptions[1].title);
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState<string>();

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const wordCount = countWords(description);

  const resetForm = () => {
    setItemName('');
    setCampus(campuses[0]);
    setBuilding(buildingsByCampus[campuses[0]][0] || '');
    setSpecificLocation('');
    setCustody(custodyOptions[1].title);
    setDescription('');
    setImageUri(undefined);
    setError('');
  };

  const uploadImageToServer = async (uri: string): Promise<string | null> => {
    try {
      const filename = uri.split('/').pop() || 'photo.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      const formData = new FormData();
      formData.append('file', {
        uri,
        name: filename,
        type,
      } as any);

      // Gọi API qua apiFetch đồng bộ toàn dự án
      const response = await apiFetch<{ imageUrl: string }>('/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.success && response.data?.imageUrl) {
        return response.data.imageUrl;
      }
      return null;
    } catch (err) {
      console.error('Image upload failed:', err);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!imageUri) {
      setError('Vui lòng thêm ảnh đồ vật trước khi đăng.');
      return;
    }

    if (!itemName.trim() || !category) {
      setError('Vui lòng điền tên đồ vật và chọn danh mục.');
      return;
    }

    if (!campus.trim() || !building.trim() || !specificLocation.trim() || !custody.trim()) {
      setError('Vui lòng điền đầy đủ vị trí và nơi giữ đồ hiện tại.');
      return;
    }

    setIsLoading(true);
    setError('');

    const eventTime = new Date().toISOString();

    try {
      let uploadedServerImageUrl: string | undefined = undefined;

      if (imageUri && !imageUri.startsWith('http')) {
        const uploadedUrl = await uploadImageToServer(imageUri);

        if (!uploadedUrl) {
          setError('Tải ảnh lên máy chủ thất bại. Vui lòng kiểm tra kết nối mạng hoặc thử lại.');
          setIsLoading(false);
          return;
        }

        uploadedServerImageUrl = uploadedUrl;
      } else if (imageUri?.startsWith('http')) {
        uploadedServerImageUrl = imageUri;
      }

      const selectedCustody = custodyOptions.find((item) => item.title === custody);

      const payload = {
        title: itemName.trim(),
        imageUrl: uploadedServerImageUrl || '',
        categoryCode: categoryCodeMap[category] || 'OTHER',
        campusCode: campusCodeMap[campus] || 'LTK',
        buildingId: building.trim(),
        room: specificLocation.trim(),
        holdingStatus: selectedCustody?.code || 'KEEPING_BY_SECURITY',
        description: description.trim(),
        color: 'Nhiều màu',
        foundAt: eventTime,
      };

      const response = await apiFetch('/items', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (!response.success) {
        setError(response.message || 'Gửi bài đăng thất bại. Vui lòng thử lại.');
        setIsLoading(false);
        return;
      }

      createFoundPost({
        title: itemName.trim(),
        category,
        color: 'Nhiều màu',
        campus,
        building: building.trim(),
        specificLocation: specificLocation.trim(),
        foundAt: eventTime,
        custody: custody.trim(),
        description: description.trim(),
        imageUri: uploadedServerImageUrl || imageUri,
      });

      resetForm();
      router.navigate('/(tabs)');
    } catch (err) {
      console.error('Create item submit error:', err);
      setError('Đã xảy ra lỗi hệ thống khi đăng bài. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <AppHeader title="Báo nhặt được đồ" subtitle="BKonnect HCMUT" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={[styles.content, { marginLeft: contentOffset, width: contentWidth }]}>
            
            {/* Banner Bảo mật */}
            <View style={styles.securityBanner}>
              <View style={styles.securityIconBox}>
              </View>
              <View style={styles.securityTextWrap}>
                <Text style={styles.securityTitle}>Giữ kín đặc điểm nhận dạng</Text>
                <Text style={styles.securityDesc}>
                  Không công khai mật khẩu hoặc chữ khắc riêng. Các chi tiết này dùng để xác minh chủ
                  sở hữu.
                </Text>
              </View>
            </View>

            {/* Error Banner */}
            {Boolean(error) && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* 1. Ảnh đồ vật */}
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>
                Ảnh đồ vật <Text style={styles.asterisk}>*</Text>
              </Text>
              <ImagePickerField imageUri={imageUri} onChange={setImageUri} />
              {!imageUri && (
                <Text style={styles.imageWarning}>Vui lòng thêm ảnh đồ vật trước khi đăng.</Text>
              )}
            </View>

            {/* 2. Tên đồ vật */}
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>
                Tên đồ vật <Text style={styles.asterisk}>*</Text>
              </Text>
              <FormTextInput
                editable={!isLoading}
                maxLength={80}
                onChangeText={setItemName}
                placeholder="VD: Ví da màu đen"
                value={itemName}
              />
            </View>

            {/* 3. Danh mục */}
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>
                Danh mục <Text style={styles.asterisk}>*</Text>
              </Text>
              <View style={styles.categoryChipWrap}>
                {categories.map((item) => {
                  const active = category === item;
                  return (
                    <Pressable
                      disabled={isLoading}
                      key={item}
                      onPress={() => setCategory(item)}
                      style={[
                        styles.categoryChip,
                        active && styles.categoryChipActive,
                      ]}>
                      <Text
                        style={[
                          styles.categoryChipText,
                          active && styles.categoryChipTextActive,
                        ]}>
                        {item}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* 4. Vị trí nhặt được đồ */}
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>
                Vị trí nhặt được đồ <Text style={styles.asterisk}>*</Text>
              </Text>

              <View style={styles.subField}>
                <Text style={styles.subLabel}>Vị trí cơ sở</Text>
                <SelectField
                  onChange={(selected) => {
                    setCampus(selected);
                    setBuilding(buildingsByCampus[selected]?.[0] || '');
                  }}
                  options={campuses}
                  placeholder="Chọn cơ sở"
                  title="Chọn cơ sở"
                  value={campus}
                />
              </View>

              <View style={styles.subField}>
                <Text style={styles.subLabel}>Tòa nhà</Text>
                <SelectField
                  onChange={setBuilding}
                  options={buildingOptions}
                  placeholder="Chọn tòa nhà"
                  title="Chọn tòa nhà"
                  value={building}
                />
              </View>

              <View style={styles.subField}>
                <Text style={styles.subLabel}>Phòng / Khu vực cụ thể</Text>
                <FormTextInput
                  editable={!isLoading}
                  onChangeText={setSpecificLocation}
                  placeholder="VD: Bàn phòng 302, gần cửa sổ"
                  value={specificLocation}
                />
              </View>
            </View>

            {/* 5. Nơi giữ đồ hiện tại */}
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>
                Nơi giữ đồ hiện tại <Text style={styles.asterisk}>*</Text>
              </Text>

              <View style={styles.custodyList}>
                {custodyOptions.map((item) => {
                  const active = custody === item.title;
                  return (
                    <Pressable
                      accessibilityRole="radio"
                      accessibilityState={{ selected: active }}
                      disabled={isLoading}
                      key={item.title}
                      onPress={() => setCustody(item.title)}
                      style={[
                        styles.custodyCard,
                        active && styles.custodyCardActive,
                      ]}>
                      <View style={[styles.radioDot, active && styles.radioDotActive]}>
                        {active && <View style={styles.radioDotInner} />}
                      </View>
                      <View style={styles.custodyTextWrap}>
                        <Text style={[styles.custodyTitle, active && styles.custodyTitleActive]}>
                          {item.title}
                        </Text>
                        <Text style={styles.custodySubtitle}>{item.subtitle}</Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* 6. Mô tả (không bắt buộc) */}
            <View style={styles.fieldBlock}>
              <View style={styles.labelHeaderRow}>
                <Text style={styles.fieldLabel}>Mô tả (không bắt buộc)</Text>
                <Text style={styles.wordCounter}>
                  {wordCount} / {WORD_LIMIT} từ
                </Text>
              </View>
              <FormTextInput
                editable={!isLoading}
                maxLength={1000}
                multiline
                numberOfLines={3}
                onChangeText={setDescription}
                placeholder="Nhập mô tả đặc điểm nhận dạng chung (không tiết lộ chi tiết bí mật)..."
                value={description}
              />
            </View>

            {/* Nút gửi form */}
            <View style={styles.submitSection}>
              <PrimaryButton
                disabled={isLoading}
                icon={
                  isLoading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : null
                }
                label={isLoading ? 'Đang xử lý...' : 'Đăng bài nhặt đồ'}
                onPress={handleSubmit}
                style={styles.submitBtn}
              />
              <Text style={styles.honorNotice}>
                Khi đăng bài, bạn đồng ý với Quy tắc Danh dự Sinh viên HCMUT
              </Text>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { backgroundColor: BRAND_COLORS.bgScreen, flex: 1 },
  content: {
    gap: 18,
    marginTop: 12,
    marginBottom: 32,
  },
  securityBanner: {
    backgroundColor: BRAND_COLORS.primaryLight,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  securityIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: BRAND_COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  securityIconInner: {
    width: 14,
    height: 14,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  securityTextWrap: {
    flex: 1,
    gap: 2,
  },
  securityTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: BRAND_COLORS.primary,
  },
  securityDesc: {
    fontSize: 12,
    color: BRAND_COLORS.textSub,
    lineHeight: 17,
  },
  errorBanner: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECDD3',
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
  },
  errorText: {
    color: BRAND_COLORS.danger,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
  fieldBlock: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 13.5,
    fontWeight: '700',
    color: BRAND_COLORS.textMain,
  },
  asterisk: {
    color: BRAND_COLORS.danger,
  },
  imageWarning: {
    color: BRAND_COLORS.danger,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  categoryChipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    backgroundColor: '#FFFFFF',
    borderColor: BRAND_COLORS.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  categoryChipActive: {
    backgroundColor: BRAND_COLORS.primary,
    borderColor: BRAND_COLORS.primary,
  },
  categoryChipText: {
    color: '#334155',
    fontSize: 12.5,
    fontWeight: '600',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  sectionBlock: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: BRAND_COLORS.textMain,
  },
  subField: {
    gap: 4,
  },
  subLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    color: BRAND_COLORS.textSub,
  },
  custodyList: {
    gap: 8,
  },
  custodyCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    padding: 12,
    gap: 12,
    alignItems: 'flex-start',
  },
  custodyCardActive: {
    borderColor: BRAND_COLORS.primary,
    backgroundColor: BRAND_COLORS.primaryLight,
  },
  radioDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  radioDotActive: {
    borderColor: BRAND_COLORS.primary,
  },
  radioDotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: BRAND_COLORS.primary,
  },
  custodyTextWrap: {
    flex: 1,
    gap: 2,
  },
  custodyTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1E293B',
  },
  custodyTitleActive: {
    color: BRAND_COLORS.primary,
  },
  custodySubtitle: {
    fontSize: 11.5,
    color: BRAND_COLORS.textSub,
    lineHeight: 16,
  },
  labelHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  wordCounter: {
    fontSize: 11.5,
    color: '#94A3B8',
  },
  submitSection: {
    gap: 8,
    marginTop: 10,
  },
  submitBtn: {
    backgroundColor: BRAND_COLORS.primary,
    borderRadius: 8,
    height: 46,
  },
  honorNotice: {
    fontSize: 11,
    color: BRAND_COLORS.textSub,
    textAlign: 'center',
  },
});