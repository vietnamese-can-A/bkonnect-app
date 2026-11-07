import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = 'https://api.bkonnect.edu.vn/api/v1';

interface FetchOptions extends RequestInit {
  requiresAuth?: boolean;
}

/**
 * Hàm fetch tùy chỉnh tự động đính kèm Token và xử lý Refresh Token
 */
export async function apiFetch<T = any>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<{ success: boolean; data?: T; message?: string }> {
  const { requiresAuth = true, headers, ...customConfig } = options;

  // 1. Lấy Access Token từ SecureStore
  let token = await SecureStore.getItemAsync('accessToken');

  const reqHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  };

  if (requiresAuth && token) {
    reqHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...customConfig,
    headers: reqHeaders,
  };

  try {
    let response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // 2. Xử lý trường hợp Access Token hết hạn (Lỗi 401)
    if (response.status === 401 && requiresAuth) {
      const refreshedSuccess = await refreshAccessToken();

      if (refreshedSuccess) {
        // Thử lại request cũ với Token mới
        const newToken = await SecureStore.getItemAsync('accessToken');
        reqHeaders['Authorization'] = `Bearer ${newToken}`;
        response = await fetch(`${API_BASE_URL}${endpoint}`, {
          ...config,
          headers: reqHeaders,
        });
      } else {
        // Refresh token cũng hết hạn -> Xóa token và buộc người dùng đăng nhập lại
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
        return { success: false, message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' };
      }
    }

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: result.message || 'Đã có lỗi xảy ra từ máy chủ.',
      };
    }

    return {
      success: true,
      data: result.data,
      message: result.message,
    };
  } catch (error) {
    console.error(`[API Error] ${endpoint}:`, error);
    return {
      success: false,
      message: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối mạng.',
    };
  }
}

/**
 * Hàm gọi ngầm để xin cấp lại Access Token mới bằng Refresh Token
 */
async function refreshAccessToken(): Promise<boolean> {
  try {
    const refreshToken = await SecureStore.getItemAsync('refreshToken');
    if (!refreshToken) return false;

    const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    const result = await response.json();
    if (response.ok && result.success && result.data?.accessToken) {
      await SecureStore.setItemAsync('accessToken', result.data.accessToken);
      if (result.data.refreshToken) {
        await SecureStore.setItemAsync('refreshToken', result.data.refreshToken);
      }
      return true;
    }

    return false;
  } catch {
    return false;
  }
}