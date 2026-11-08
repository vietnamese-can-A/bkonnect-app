import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = 'https://api.bkonnect.edu.vn/api/v1';
const DEFAULT_TIMEOUT = 10000; // Thời gian chờ tối đa: 10 giây

interface FetchOptions extends Omit<RequestInit, 'body'> {
  requiresAuth?: boolean;
  timeout?: number;
  body?: any;
}

/**
 * Hàm fetch tùy chỉnh tự động đính kèm Token, xử lý Timeout, Refresh Token & Upload FormData
 */
export async function apiFetch<T = any>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<{ success: boolean; data?: T; message?: string; statusCode?: number }> {
  const { requiresAuth = true, headers, timeout = DEFAULT_TIMEOUT, body, ...customConfig } = options;

  // 1. Lấy Access Token từ SecureStore
  let token = await SecureStore.getItemAsync('accessToken');

  // Kiểm tra nếu dữ liệu truyền vào là FormData (Tải ảnh/file)
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

  // Nếu là FormData thì KHÔNG đặt Content-Type để runtime tự nhận diện boundary
  const reqHeaders: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(headers as Record<string, string>),
  };

  if (requiresAuth && token) {
    reqHeaders['Authorization'] = `Bearer ${token}`;
  }

  // Xử lý Body: Nếu là object thì JSON.stringify, nếu là FormData hoặc string thì giữ nguyên
  const reqBody = isFormData
    ? body
    : body && typeof body === 'object'
    ? JSON.stringify(body)
    : body;

  // Tạo AbortController để xử lý Timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  const config: RequestInit = {
    ...customConfig,
    body: reqBody,
    headers: reqHeaders,
    signal: controller.signal,
  };

  try {
    let response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    clearTimeout(timeoutId);

    // 2. Xử lý trường hợp Access Token hết hạn (Lỗi 401)
    if (response.status === 401 && requiresAuth) {
      const refreshedSuccess = await refreshAccessToken();

      if (refreshedSuccess) {
        const newToken = await SecureStore.getItemAsync('accessToken');
        reqHeaders['Authorization'] = `Bearer ${newToken}`;

        const retryController = new AbortController();
        const retryTimeoutId = setTimeout(() => retryController.abort(), timeout);

        try {
          response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...config,
            headers: reqHeaders,
            signal: retryController.signal,
          });
        } finally {
          clearTimeout(retryTimeoutId);
        }
      } else {
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
        return {
          success: false,
          statusCode: 401,
          message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
        };
      }
    }

    // 3. Xử lý lỗi máy chủ sập hoặc gặp sự cố nội bộ (Lỗi 5xx)
    if (response.status >= 500) {
      return {
        success: false,
        statusCode: response.status,
        message: `Máy chủ đang gặp sự cố (${response.status}). Vui lòng thử lại sau.`,
      };
    }

    // 4. Parse JSON an toàn (Tránh crash nếu server trả về HTML thay vì JSON)
    let result: any = null;
    try {
      result = await response.json();
    } catch {
      result = null;
    }

    if (!response.ok) {
      return {
        success: false,
        statusCode: response.status,
        message: result?.message || `Yêu cầu thất bại với mã lỗi ${response.status}.`,
      };
    }

    return {
      success: true,
      statusCode: response.status,
      data: result?.data ?? result,
      message: result?.message,
    };
  } catch (error: any) {
    clearTimeout(timeoutId);

    // 5. Phân loại lỗi kết nối
    if (error.name === 'AbortError') {
      return {
        success: false,
        message: 'Kết nối quá thời hạn (Timeout). Máy chủ phản hồi quá lâu.',
      };
    }

    console.error(`[API Connection Error] ${endpoint}:`, error);
    return {
      success: false,
      message: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại mạng hoặc địa chỉ IP backend.',
    };
  }
}

/**
 * Hàm gọi ngầm để xin cấp lại Access Token mới bằng Refresh Token
 */
async function refreshAccessToken(): Promise<boolean> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const refreshToken = await SecureStore.getItemAsync('refreshToken');
    if (!refreshToken) return false;

    const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) return false;

    let result: any = null;
    try {
      result = await response.json();
    } catch {
      return false;
    }

    if (result && result.success && result.data?.accessToken) {
      await SecureStore.setItemAsync('accessToken', result.data.accessToken);
      if (result.data.refreshToken) {
        await SecureStore.setItemAsync('refreshToken', result.data.refreshToken);
      }
      return true;
    }

    return false;
  } catch {
    clearTimeout(timeoutId);
    return false;
  }
}