import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/primary-button';
import { colors, radii, shadows } from '@/constants/theme';
import { useAppState } from '@/features/app-state/app-state-context';
import { apiFetch } from '@/services/apiService';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAppState();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    const inputIdentifier = identifier.trim();

    if (!inputIdentifier || !password) {
      setError('Vui lòng nhập tên đăng nhập / MSSV và mật khẩu.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // 1. TRƯỜNG HỢP TEST DEV VỚI MSSV 2411589
      if (__DEV__ && inputIdentifier === '2411589') {
        await SecureStore.setItemAsync('accessToken', 'mock_access_token_2411589');
        
        const success = login(inputIdentifier, password) || login('2210001', '123456');
        
        if (success) {
          router.replace('/(tabs)');
        } else {
          setError('Không tìm thấy thông tin tài khoản demo.');
        }
        return;
      }

      // 2. TRƯỜNG HỢP GỌI API QUA apiFetch
      const response = await apiFetch('/auth/login', {
        method: 'POST',
        requiresAuth: false,
        body: JSON.stringify({ identifier: inputIdentifier, password }),
      });

      if (!response.success || !response.data) {
        setError(response.message || 'Tài khoản hoặc mật khẩu không chính xác.');
        return;
      }

      const { accessToken, refreshToken } = response.data;

      // Lưu Token an toàn
      await SecureStore.setItemAsync('accessToken', accessToken);
      if (remember && refreshToken) {
        await SecureStore.setItemAsync('refreshToken', refreshToken);
      } else {
        // Nếu không ghi nhớ -> Xóa Refresh Token cũ (nếu có)
        await SecureStore.deleteItemAsync('refreshToken');
      }

      // Cập nhật State Đăng nhập trong AppStateContext
      const isLogged = login(inputIdentifier, password);
      if (!isLogged) {
        login('2210001', '123456');
      }

      router.replace('/(tabs)');
    } catch (err) {
      console.error('Login error:', err);
      setError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối mạng.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Image
        resizeMode="cover"
        source={require('@/assets/images/demo/campus-hero.png')}
        style={styles.campus}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <View style={styles.brand}>
              <Image
                resizeMode="contain"
                source={require('@/assets/images/demo/hcmut-logo-home.png')}
                style={styles.logo}
              />
              <Text style={styles.title}>Đăng nhập BKonnect</Text>
              <Text style={styles.subtitle}>Kết nối cộng đồng Bách Khoa</Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Tên đăng nhập / MSSV</Text>
              <View style={styles.inputWrap}>
                <TextInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                  onChangeText={setIdentifier}
                  placeholder="Nhập MSSV hoặc tên đăng nhập"
                  placeholderTextColor={colors.textSubtle}
                  returnKeyType="next"
                  style={styles.input}
                  value={identifier}
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Mật khẩu</Text>
              <View style={styles.inputWrap}>
                <TextInput
                  autoCapitalize="none"
                  editable={!isLoading}
                  onChangeText={setPassword}
                  onSubmitEditing={handleLogin}
                  placeholder="Nhập mật khẩu"
                  placeholderTextColor={colors.textSubtle}
                  returnKeyType="done"
                  secureTextEntry={!showPassword}
                  style={styles.input}
                  value={password}
                />
                <Pressable
                  accessibilityLabel={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  hitSlop={8}
                  onPress={() => setShowPassword((value) => !value)}>
                  <Text style={styles.toggleText}>{showPassword ? 'Ẩn' : 'Hiện'}</Text>
                </Pressable>
              </View>
              <Pressable style={styles.forgot}>
                <Text style={styles.forgotText}>Quên mật khẩu?</Text>
              </Pressable>
            </View>

            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: remember }}
              onPress={() => setRemember((value) => !value)}
              style={styles.rememberRow}>
              <View style={[styles.checkbox, remember && styles.checkboxActive]}>
                {remember && <Text style={styles.checkMark}>✓</Text>}
              </View>
              <Text style={styles.rememberText}>Ghi nhớ đăng nhập</Text>
            </Pressable>

            {error ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <PrimaryButton
              disabled={isLoading}
              icon={
                isLoading ? (
                  <ActivityIndicator color={colors.white} size="small" />
                ) : null
              }
              label={isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
              onPress={handleLogin}
              style={styles.loginButton}
            />

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>hoặc</Text>
              <View style={styles.dividerLine} />
            </View>

            <Pressable
              style={styles.helpButton}
              onPress={() => router.push('/signup')}>
              <Text style={styles.helpText}>Tạo tài khoản mới</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { backgroundColor: colors.background, flex: 1 },
  campus: {
    bottom: 0,
    height: 190,
    left: 0,
    opacity: 0.14,
    position: 'absolute',
    right: 0,
  },
  content: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  card: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderColor: colors.border,
    borderRadius: radii.large,
    borderWidth: 1,
    gap: 16,
    maxWidth: 440,
    padding: 22,
    width: '100%',
    ...shadows.card,
  },
  brand: { alignItems: 'center', gap: 4, marginBottom: 6 },
  logo: { height: 104, width: 150 },
  title: { color: colors.indigo, fontSize: 22, fontWeight: '900', marginTop: 8 },
  subtitle: { color: colors.textMuted, fontSize: 13 },
  field: { gap: 6 },
  label: { color: colors.text, fontSize: 13, fontWeight: '700' },
  inputWrap: {
    alignItems: 'center',
    backgroundColor: colors.backgroundCool,
    borderColor: colors.border,
    borderRadius: radii.small,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    minHeight: 48,
    paddingHorizontal: 12,
  },
  input: { color: colors.text, flex: 1, fontSize: 14, paddingVertical: 11 },
  toggleText: { color: colors.blueDark, fontSize: 12, fontWeight: '700' },
  forgot: { alignSelf: 'flex-end', paddingVertical: 2 },
  forgotText: { color: colors.blueDark, fontSize: 12, fontWeight: '700' },
  rememberRow: { alignItems: 'center', flexDirection: 'row', gap: 9 },
  checkbox: {
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.borderStrong,
    borderRadius: 4,
    borderWidth: 1.5,
    height: 20,
    width: 20,
  },
  checkboxActive: { backgroundColor: colors.indigo, borderColor: colors.indigo },
  checkMark: { color: colors.white, fontSize: 13, fontWeight: '900' },
  rememberText: { color: colors.text, fontSize: 13 },
  errorBanner: {
    backgroundColor: colors.dangerSoft,
    borderColor: '#FECDD3',
    borderRadius: radii.medium,
    borderWidth: 1,
    padding: 11,
  },
  errorText: { color: colors.danger, fontSize: 12, fontWeight: '700', lineHeight: 18 },
  loginButton: { backgroundColor: colors.indigo },
  dividerRow: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  dividerLine: { backgroundColor: colors.border, flex: 1, height: 1 },
  dividerText: { color: colors.textMuted, fontSize: 12 },
  helpButton: { alignItems: 'center', flexDirection: 'row', gap: 6, justifyContent: 'center', padding: 4 },
  helpText: { color: colors.indigo, fontSize: 13, fontWeight: '700' },
});