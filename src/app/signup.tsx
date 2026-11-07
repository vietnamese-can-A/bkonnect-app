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
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';

import { apiFetch } from '@/services/apiService';
import { PrimaryButton } from '@/components/primary-button';
import { colors, radii, shadows } from '@/constants/theme';
import { useAppState } from '@/features/app-state/app-state-context';

export default function SignupScreen() {
  const router = useRouter();
  const { login } = useAppState();

  const [fullName, setFullName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async () => {
    const trimmedFullName = fullName.trim();
    const trimmedIdentifier = identifier.trim();
    const trimmedEmail = email.trim();

    if (!trimmedFullName || !trimmedIdentifier || !trimmedEmail || !password || !confirmPassword) {
      setError('Vui lòng điền đầy đủ tất cả thông tin.');
      return;
    }

    if (!trimmedEmail.toLowerCase().endsWith('@hcmut.edu.vn')) {
      setError('Vui lòng sử dụng Email sinh viên Bách Khoa (@hcmut.edu.vn).');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không trùng khớp.');
      return;
    }

    if (password.length < 6) {
      setError('Mật khẩu phải chứa ít nhất 6 ký tự.');
      return;
    }

    if (!agreeTerms) {
      setError('Bạn cần đồng ý với Điều khoản & Chính sách bảo mật.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // 1. TRƯỜNG HỢP TEST DEV VỚI MSSV 2411589
      if (__DEV__ && trimmedIdentifier === '2411589') {
        await SecureStore.setItemAsync('accessToken', 'mock_access_token_2411589');
        if (login) {
          login('2210001', '123456');
        }
        router.replace('/(tabs)');
        return;
      }

      // 2. GỌI API ĐĂNG KÝ QUA apiFetch
      const response = await apiFetch('/auth/register', {
        method: 'POST',
        requiresAuth: false,
        body: JSON.stringify({
          fullName: trimmedFullName,
          studentId: trimmedIdentifier,
          email: trimmedEmail,
          password,
        }),
      });

      if (!response.success || !response.data) {
        setError(response.message || 'Đăng ký không thành công. Vui lòng thử lại.');
        return;
      }

      const { accessToken, refreshToken } = response.data;

      // Lưu Token an toàn
      await SecureStore.setItemAsync('accessToken', accessToken);
      if (refreshToken) {
        await SecureStore.setItemAsync('refreshToken', refreshToken);
      }

      // Cập nhật State Đăng nhập trong AppStateContext
      const isLogged = login(trimmedIdentifier, password);
      if (!isLogged) {
        login('2210001', '123456');
      }

      router.replace('/(tabs)');
    } catch (err) {
      console.error('Signup error:', err);
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
            {/* Header Brand */}
            <View style={styles.brand}>
              <Image
                resizeMode="contain"
                source={require('@/assets/images/demo/hcmut-logo-home.png')}
                style={styles.logo}
              />
              <Text style={styles.title}>Đăng ký BKonnect</Text>
              <Text style={styles.subtitle}>Tạo tài khoản cộng đồng Bách Khoa</Text>
            </View>

            {/* Họ và tên */}
            <View style={styles.field}>
              <Text style={styles.label}>Họ và tên</Text>
              <View style={styles.inputWrap}>
                <TextInput
                  autoCapitalize="words"
                  autoCorrect={false}
                  editable={!isLoading}
                  onChangeText={setFullName}
                  placeholder="Nhập họ và tên đầy đủ"
                  placeholderTextColor={colors.textSubtle}
                  returnKeyType="next"
                  style={styles.input}
                  value={fullName}
                />
              </View>
            </View>

            {/* Tên đăng nhập / MSSV */}
            <View style={styles.field}>
              <Text style={styles.label}>MSSV / Tên đăng nhập</Text>
              <View style={styles.inputWrap}>
                <TextInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                  onChangeText={setIdentifier}
                  placeholder="Nhập MSSV (ví dụ: 2210001)"
                  placeholderTextColor={colors.textSubtle}
                  returnKeyType="next"
                  style={styles.input}
                  value={identifier}
                />
              </View>
            </View>

            {/* Email sinh viên */}
            <View style={styles.field}>
              <Text style={styles.label}>Email Bách Khoa</Text>
              <View style={styles.inputWrap}>
                <TextInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                  keyboardType="email-address"
                  onChangeText={setEmail}
                  placeholder="name@hcmut.edu.vn"
                  placeholderTextColor={colors.textSubtle}
                  returnKeyType="next"
                  style={styles.input}
                  value={email}
                />
              </View>
            </View>

            {/* Mật khẩu */}
            <View style={styles.field}>
              <Text style={styles.label}>Mật khẩu</Text>
              <View style={styles.inputWrap}>
                <TextInput
                  autoCapitalize="none"
                  editable={!isLoading}
                  onChangeText={setPassword}
                  placeholder="Tạo mật khẩu"
                  placeholderTextColor={colors.textSubtle}
                  returnKeyType="next"
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
            </View>

            {/* Xác nhận mật khẩu */}
            <View style={styles.field}>
              <Text style={styles.label}>Xác nhận mật khẩu</Text>
              <View style={styles.inputWrap}>
                <TextInput
                  autoCapitalize="none"
                  editable={!isLoading}
                  onChangeText={setConfirmPassword}
                  onSubmitEditing={handleSignup}
                  placeholder="Nhập lại mật khẩu"
                  placeholderTextColor={colors.textSubtle}
                  returnKeyType="done"
                  secureTextEntry={!showPassword}
                  style={styles.input}
                  value={confirmPassword}
                />
              </View>
            </View>

            {/* Đồng ý điều khoản */}
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: agreeTerms }}
              onPress={() => setAgreeTerms((value) => !value)}
              style={styles.rememberRow}>
              <View style={[styles.checkbox, agreeTerms && styles.checkboxActive]}>
                {agreeTerms && <Text style={styles.checkMark}>✓</Text>}
              </View>
              <Text style={styles.rememberText}>
                Tôi đồng ý với <Text style={styles.linkText}>Điều khoản & Chính sách</Text>
              </Text>
            </Pressable>

            {/* Thông báo lỗi */}
            {error ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Nút Đăng ký */}
            <PrimaryButton
              disabled={isLoading}
              icon={
                isLoading ? (
                  <ActivityIndicator color={colors.white} size="small" />
                ) : null
              }
              label={isLoading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
              onPress={handleSignup}
              style={styles.loginButton}
            />

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>hoặc</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Chuyển sang màn hình Đăng nhập */}
            <Pressable style={styles.helpButton} onPress={() => router.push('/login')}>
              <Text style={styles.helpText}>
                Đã có tài khoản? <Text style={{ fontWeight: '900' }}>Đăng nhập</Text>
              </Text>
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
    gap: 14,
    maxWidth: 440,
    padding: 22,
    width: '100%',
    marginVertical: 16,
    ...shadows.card,
  },
  brand: { alignItems: 'center', gap: 4, marginBottom: 4 },
  logo: { height: 90, width: 130 },
  title: { color: colors.indigo, fontSize: 22, fontWeight: '900', marginTop: 6 },
  subtitle: { color: colors.textMuted, fontSize: 13 },
  field: { gap: 4 },
  label: { color: colors.text, fontSize: 13, fontWeight: '700' },
  inputWrap: {
    alignItems: 'center',
    backgroundColor: colors.backgroundCool,
    borderColor: colors.border,
    borderRadius: radii.small,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    minHeight: 46,
    paddingHorizontal: 12,
  },
  input: { color: colors.text, flex: 1, fontSize: 14, paddingVertical: 10 },
  toggleText: { color: colors.blueDark, fontSize: 12, fontWeight: '700' },
  rememberRow: { alignItems: 'center', flexDirection: 'row', gap: 9, marginTop: 4 },
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
  rememberText: { color: colors.text, fontSize: 12, flex: 1 },
  linkText: { color: colors.indigo, fontWeight: '700' },
  errorBanner: {
    backgroundColor: colors.dangerSoft,
    borderColor: '#FECDD3',
    borderRadius: radii.medium,
    borderWidth: 1,
    padding: 11,
  },
  errorText: { color: colors.danger, fontSize: 12, fontWeight: '700', lineHeight: 18 },
  loginButton: { backgroundColor: colors.indigo, marginTop: 4 },
  dividerRow: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  dividerLine: { backgroundColor: colors.border, flex: 1, height: 1 },
  dividerText: { color: colors.textMuted, fontSize: 12 },
  helpButton: { alignItems: 'center', flexDirection: 'row', gap: 6, justifyContent: 'center', padding: 4 },
  helpText: { color: colors.indigo, fontSize: 13 },
});