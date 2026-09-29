import * as ImagePicker from 'expo-image-picker';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radii } from '@/constants/theme';

type ImagePickerFieldProps = {
  imageUri?: string;
  onChange: (uri: string) => void;
  title?: string;
  description?: string;
};

export function ImagePickerField({
  imageUri,
  onChange,
  title = 'Chụp ảnh hoặc tải ảnh lên',
  description = 'Hỗ trợ JPG, PNG. Ảnh chỉ được lưu cục bộ trong phiên demo.',
}: ImagePickerFieldProps) {
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Cần quyền truy cập', 'Vui lòng cho phép BKonnect truy cập thư viện ảnh.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      onChange(result.assets[0].uri);
    }
  };

  return (
    <Pressable
      accessibilityRole="button"
      onPress={pickImage}
      style={({ pressed }) => [styles.dropArea, pressed && styles.pressed]}>
      {imageUri ? (
        <Image source={{ uri: imageUri }} resizeMode="cover" style={styles.preview} />
      ) : (
        <View style={styles.iconBox}>
          <Text style={styles.icon}>＋</Text>
        </View>
      )}
      <Text style={styles.title}>{imageUri ? 'Đổi ảnh đã chọn' : title}</Text>
      <Text style={styles.description}>{description}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  dropArea: {
    alignItems: 'center',
    backgroundColor: colors.backgroundCool,
    borderColor: colors.borderStrong,
    borderRadius: radii.medium,
    borderStyle: 'dashed',
    borderWidth: 2,
    gap: 6,
    justifyContent: 'center',
    minHeight: 160,
    padding: 18,
  },
  iconBox: {
    alignItems: 'center',
    backgroundColor: colors.blueSoft,
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  icon: {
    color: colors.blue,
    fontSize: 28,
    fontWeight: '500',
  },
  preview: {
    borderRadius: radii.small,
    height: 132,
    width: '100%',
  },
  title: {
    color: colors.indigo,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  description: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
});
