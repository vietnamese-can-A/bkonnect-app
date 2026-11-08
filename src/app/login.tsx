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
import Svg, { Path } from 'react-native-svg';

import { useAppState } from '@/features/app-state/app-state-context';
import { apiFetch } from '@/services/apiService';

// Component SVG Icon Mắt Mở (Giống SVG gốc)
function EyeOpenIcon({ color = '#475467' }: { color?: string }) {
  return (
    <Svg fill="none" height={13} viewBox="0 0 19 13" width={19}>
      <Path
        d="M9.16667 10C10.2083 10 11.0938 9.63542 11.8229 8.90625C12.5521 8.17708 12.9167 7.29167 12.9167 6.25C12.9167 5.20833 12.5521 4.32292 11.8229 3.59375C11.0938 2.86458 10.2083 2.5 9.16667 2.5C8.125 2.5 7.23958 2.86458 6.51042 3.59375C5.78125 4.32292 5.41667 5.20833 5.41667 6.25C5.41667 7.29167 5.78125 8.17708 6.51042 8.90625C7.23958 9.63542 8.125 10 9.16667 10ZM9.16667 8.5C8.54167 8.5 8.01042 8.28125 7.57292 7.84375C7.13542 7.40625 6.91667 6.875 6.91667 6.25C6.91667 5.625 7.13542 5.09375 7.57292 4.65625C8.01042 4.21875 8.54167 4 9.16667 4C9.79167 4 10.3229 4.21875 10.7604 4.65625C11.1979 5.09375 11.4167 5.625 11.4167 6.25C11.4167 6.875 11.1979 7.40625 10.7604 7.84375C10.3229 8.28125 9.79167 8.5 9.16667 8.5ZM9.16667 12.5C7.13889 12.5 5.29167 11.934 3.625 10.8021C1.95833 9.67014 0.75 8.15278 0 6.25C0.75 4.34722 1.95833 2.82986 3.625 1.69792C5.29167 0.565972 7.13889 0 9.16667 0C11.1944 0 13.0417 0.565972 14.7083 1.69792C16.375 2.82986 17.5833 4.34722 18.3333 6.25C17.5833 8.15278 16.375 9.67014 14.7083 10.8021C13.0417 11.934 11.1944 12.5 9.16667 12.5ZM9.16667 10.8333C10.7361 10.8333 12.1771 10.4201 13.4896 9.59375C14.8021 8.76736 15.8056 7.65278 16.5 6.25C15.8056 4.84722 14.8021 3.73264 13.4896 2.90625C12.1771 2.07986 10.7361 1.66667 9.16667 1.66667C7.59722 1.66667 6.15625 2.07986 4.84375 2.90625C3.53125 3.73264 2.52778 4.84722 1.83333 6.25C2.52778 7.65278 3.53125 8.76736 4.84375 9.59375C6.15625 10.4201 7.59722 10.8333 9.16667 10.8333Z"
        fill={color}
      />
    </Svg>
  );
}

// Component SVG Icon Mắt Nhắm (Đã tạo gạch chéo đồng bộ)
function EyeClosedIcon({ color = '#475467' }: { color?: string }) {
  return (
    <Svg fill="none" height={13} viewBox="0 0 19 13" width={19}>
      <Path d="M1.35 0.5L17.65 12.5" stroke={color} strokeLinecap="round" strokeWidth={1.3} />
      <Path
        d="M7.15 2.15C7.8 1.95 8.48 1.85 9.17 1.85C10.74 1.85 12.18 2.26 13.49 3.09C14.8 3.91 15.81 5.03 16.5 6.43C16 7.45 15.26 8.32 14.3 9.02M4.03 3.89C2.94 4.6 2.05 5.46 1.35 6.43C2.05 7.83 3.05 8.95 4.36 9.77C5.67 10.6 7.11 11.01 8.68 11.01C9.65 11.01 10.59 10.85 11.48 10.53"
        stroke={color}
        strokeLinecap="round"
        strokeWidth={1.3}
      />
      <Path
        d="M7.8 4.88C7.52 5.29 7.35 5.79 7.35 6.33C7.35 7.34 8.16 8.15 9.17 8.15C9.71 8.15 10.21 7.98 10.62 7.7"
        stroke={color}
        strokeLinecap="round"
        strokeWidth={1.3}
      />
    </Svg>
  );
}

// 1. TỪ ĐIỂN ĐA NGÔN NGỮ (DICTIONARY)
const TRANSLATIONS = {
  VI: {
    university: 'Đại học Bách khoa',
    subCampus: 'ĐHQG-HCM · TP.HCM',
    casTitle: 'Hệ thống Xác thực Tập trung (CAS)',
    casSubtitle: 'Cổng dịch vụ đăng nhập một lần (SSO)',
    cardTitle: 'Đăng nhập tài khoản CAS',
    cardDesc: 'Sử dụng tài khoản cán bộ, sinh viên trường ĐH Bách Khoa để đăng nhập dịch vụ.',
    labelUsername: 'Tên đăng nhập / MSSV',
    placeholderUsername: 'Tên đăng nhập hoặc MSSV',
    labelPassword: 'Mật khẩu',
    placeholderPassword: 'Nhập mật khẩu CAS',
    forgotPassword: 'Đổi mật khẩu?',
    warnCheckbox: 'Cảnh báo trước khi đăng nhập vào các trang khác',
    loginBtn: 'Đăng nhập',
    resetBtn: 'Nhập lại',
    ssoTitle: 'Đăng nhập một lần (SSO) HCMUT',
    ssoText1: 'Xác thực truy cập đồng bộ đến ',
    ssoText2: ' và ',
    techSupport: 'Hỗ trợ kỹ thuật',
    phone: 'ĐT',
    securityNotice: 'Vì lý do bảo mật, vui lòng Đăng xuất và đóng trình duyệt khi kết thúc phiên làm việc!',
    errorRequired: 'Vui lòng nhập tên đăng nhập / MSSV và mật khẩu CAS.',
    errorInvalid: 'Tài khoản hoặc mật khẩu CAS không chính xác.',
    errorNetwork: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối mạng.',
    errorDemoNotFound: 'Không tìm thấy thông tin tài khoản demo.',
  },
  EN: {
    university: 'HCMUT University',
    subCampus: 'VNU-HCM · HCMC',
    casTitle: 'Central Authentication Service (CAS)',
    casSubtitle: 'Single Sign-On Service Gateway (SSO)',
    cardTitle: 'CAS Account Login',
    cardDesc: 'Use HCMUT staff or student account to log into services.',
    labelUsername: 'Username / Student ID',
    placeholderUsername: 'Enter username or Student ID',
    labelPassword: 'Password',
    placeholderPassword: 'Enter CAS password',
    forgotPassword: 'Change password?',
    warnCheckbox: 'Warn me before logging into other sites',
    loginBtn: 'Login',
    resetBtn: 'Reset',
    ssoTitle: 'HCMUT Single Sign-On (SSO)',
    ssoText1: 'Synchronized authentication access to ',
    ssoText2: ' and ',
    techSupport: 'Technical Support',
    phone: 'Tel',
    securityNotice: 'For security reasons, please Log Out and exit your web browser when you are done!',
    errorRequired: 'Please enter your username / Student ID and CAS password.',
    errorInvalid: 'Incorrect CAS username or password.',
    errorNetwork: 'Cannot connect to server. Please check your network connection.',
    errorDemoNotFound: 'Demo account information not found.',
  },
};

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAppState();

  const [lang, setLang] = useState<'VI' | 'EN'>('VI');
  const t = TRANSLATIONS[lang];

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [warnBeforeLogin, setWarnBeforeLogin] = useState(false);

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = () => {
    setIdentifier('');
    setPassword('');
    setError('');
  };

  const handleLogin = async () => {
    const inputIdentifier = identifier.trim();

    if (!inputIdentifier || !password) {
      setError(t.errorRequired);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // 1. Dev Mock Login
      if (__DEV__ && inputIdentifier === '2411589') {
        await SecureStore.setItemAsync('accessToken', 'mock_access_token_2411589');
        const success = (await login(inputIdentifier, password)) || (await login('2210001', '123456'));

        if (success) {
          router.replace('/(tabs)');
        } else {
          setError(t.errorDemoNotFound);
        }
        return;
      }

      // 2. Production API Login
      const response = await apiFetch('/auth/login', {
        method: 'POST',
        requiresAuth: false,
        body: JSON.stringify({ identifier: inputIdentifier, password }),
      });

      if (!response?.success || !response?.data) {
        setError(response?.message || t.errorInvalid);
        return;
      }

      const { accessToken, refreshToken } = response.data;

      await SecureStore.setItemAsync('accessToken', accessToken);
      if (refreshToken) {
        await SecureStore.setItemAsync('refreshToken', refreshToken);
      } else {
        await SecureStore.deleteItemAsync('refreshToken');
      }

      const isLogged = await login(inputIdentifier, password);
      if (!isLogged) {
        await login('2210001', '123456');
      }

      router.replace('/(tabs)');
    } catch (err) {
      console.error('Login error:', err);
      setError(t.errorNetwork);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          {/* 1. TOP HEADER & LANGUAGE SWITCHER */}
          <View style={styles.topHeader}>
            <View style={styles.brandRow}>
              <Image
                resizeMode="contain"
                source={require('@/assets/images/demo/hcmut-logo-home.png')}
                style={styles.logo}
              />
              <View style={styles.brandTextWrap}>
                <Text style={styles.brandTitle}>{t.university}</Text>
                <Text style={styles.brandSubtitle}>{t.subCampus}</Text>
              </View>
            </View>

            {/* Chuyển ngôn ngữ EN / VI */}
            <View style={styles.langSwitch}>
              <Pressable
                onPress={() => setLang('EN')}
                style={[styles.langBtn, lang === 'EN' && styles.langBtnActive]}>
                <Text style={[styles.langText, lang === 'EN' && styles.langTextActive]}>
                  EN
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setLang('VI')}
                style={[styles.langBtn, lang === 'VI' && styles.langBtnActive]}>
                <Text style={[styles.langText, lang === 'VI' && styles.langTextActive]}>
                  VI
                </Text>
              </Pressable>
            </View>
          </View>

          {/* 2. SUB HEADER */}
          <View style={styles.subHeader}>
            <Text style={styles.casTitle}>{t.casTitle}</Text>
            <Text style={styles.casSubtitle}>{t.casSubtitle}</Text>
          </View>

          {/* 3. MAIN FORM CARD */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{t.cardTitle}</Text>
              <View style={styles.cardTitleLine} />
            </View>

            <Text style={styles.cardDesc}>{t.cardDesc}</Text>

            {/* Field: Identifier */}
            <View style={styles.field}>
              <Text style={styles.label}>
                {t.labelUsername} <Text style={styles.asterisk}>*</Text>
              </Text>
              <View style={styles.inputWrap}>
                <TextInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                  onChangeText={(text) => {
                    setIdentifier(text);
                    if (error) setError('');
                  }}
                  placeholder={t.placeholderUsername}
                  placeholderTextColor="#94A3B8"
                  returnKeyType="next"
                  style={styles.input}
                  value={identifier}
                />
              </View>
            </View>

            {/* Field: Password */}
            <View style={styles.field}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>
                  {t.labelPassword} <Text style={styles.asterisk}>*</Text>
                </Text>
              </View>

              <View style={styles.inputWrap}>
                <TextInput
                  autoCapitalize="none"
                  editable={!isLoading}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (error) setError('');
                  }}
                  onSubmitEditing={handleLogin}
                  placeholder={t.placeholderPassword}
                  placeholderTextColor="#94A3B8"
                  returnKeyType="done"
                  secureTextEntry={!showPassword}
                  style={styles.input}
                  value={password}
                />
                <Pressable
                  accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                  hitSlop={8}
                  onPress={() => setShowPassword((val) => !val)}
                  style={styles.eyeButton}>
                  {showPassword ? <EyeOpenIcon /> : <EyeClosedIcon />}
                </Pressable>
              </View>
            </View>

            {/* Checkbox Warning */}
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: warnBeforeLogin }}
              onPress={() => setWarnBeforeLogin((val) => !val)}
              style={styles.checkboxRow}>
              <View style={[styles.checkbox, warnBeforeLogin && styles.checkboxActive]}>
                {warnBeforeLogin && <Text style={styles.checkMark}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>{t.warnCheckbox}</Text>
            </Pressable>

            {/* Error Banner */}
            {Boolean(error) && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.buttonRow}>
              <Pressable
                disabled={isLoading}
                onPress={handleLogin}
                style={[styles.btn, styles.btnLogin, isLoading && styles.btnDisabled]}>
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.btnLoginText}>{t.loginBtn}</Text>
                )}
              </Pressable>

              <Pressable
                disabled={isLoading}
                onPress={handleReset}
                style={[styles.btn, styles.btnReset]}>
                <Text style={styles.btnResetText}>{t.resetBtn}</Text>
              </Pressable>
            </View>
          </View>

          {/* 4. SSO INFO BANNER */}
          <View style={styles.ssoCard}>
            <Text style={styles.ssoTitle}>{t.ssoTitle}</Text>
            <Text style={styles.ssoText}>
              {t.ssoText1}
              <Text style={styles.bold}>MyBK</Text>,{' '}
              <Text style={styles.bold}>BK-LMS</Text>,{' '}
              <Text style={styles.bold}>Cổng OISP</Text>
              {t.ssoText2}
              <Text style={styles.bold}>Hệ thống Mạng Trường</Text>.
            </Text>
          </View>

          {/* 5. TECH SUPPORT BOX */}
          <View style={styles.supportCard}>
            <Text style={styles.supportText}>
              {t.techSupport}:{' '}
              <Text style={styles.supportLink}>support@hcmut.edu.vn</Text> | {t.phone}:{' '}
              <Text style={styles.supportTextDark}>(84-8) 38647256 - 7204</Text>
            </Text>
          </View>

          {/* 6. SECURITY NOTICE FOOTER */}
          <Text style={styles.footerNotice}>{t.securityNotice}</Text>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: {
    backgroundColor: '#F7F9FC',
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    maxWidth: 480,
    alignSelf: 'center',
    width: '100%',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    width: 36,
    height: 36,
  },
  brandTextWrap: {
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  brandSubtitle: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  langSwitch: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
    padding: 2,
  },
  langBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  langBtnActive: {
    backgroundColor: '#0F2544',
  },
  langText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  langTextActive: {
    color: '#FFFFFF',
  },
  subHeader: {
    marginBottom: 16,
  },
  casTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  casSubtitle: {
    fontSize: 13,
    color: '#64748B',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 20,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
  },
  cardHeader: {
    alignSelf: 'flex-start',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F2544',
    paddingBottom: 6,
  },
  cardTitleLine: {
    height: 2,
    backgroundColor: '#0F2544',
    width: 48,
    borderRadius: 1,
  },
  cardDesc: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 19,
  },
  field: {
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  asterisk: {
    color: '#EF4444',
  },
  forgotLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F2544',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    minHeight: 46,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    paddingVertical: 10,
  },
  eyeButton: {
    paddingLeft: 8,
    paddingVertical: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 2,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxActive: {
    backgroundColor: '#0F2544',
    borderColor: '#0F2544',
  },
  checkMark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 12.5,
    color: '#475569',
    lineHeight: 18,
  },
  errorBanner: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECDD3',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  btn: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnLogin: {
    backgroundColor: '#0F2544',
  },
  btnLoginText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  btnReset: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  btnResetText: {
    color: '#1E293B',
    fontSize: 14,
    fontWeight: '600',
  },
  btnDisabled: {
    opacity: 0.7,
  },
  ssoCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 14,
    gap: 4,
    marginBottom: 12,
  },
  ssoTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F2544',
  },
  ssoText: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
  },
  bold: {
    fontWeight: '700',
    color: '#0F172A',
  },
  supportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  supportText: {
    fontSize: 11.5,
    color: '#475569',
    textAlign: 'center',
  },
  supportLink: {
    color: '#1E293B',
    fontWeight: '500',
  },
  supportTextDark: {
    color: '#1E293B',
  },
  footerNotice: {
    fontSize: 11.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 17,
    paddingHorizontal: 10,
  },
});