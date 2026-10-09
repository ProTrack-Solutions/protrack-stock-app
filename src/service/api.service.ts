import axios, {
  AxiosError,
  isAxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import * as SecureStore from "expo-secure-store";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const ACCESS_TOKEN_KEY = "protrack_access_token";
const REFRESH_TOKEN_KEY = "protrack_refresh_token";

export const tokenStorage = {
  getAccessToken: () => SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
  getRefreshToken: () => SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
  async save(accessToken: string, refreshToken?: string) {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) {
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
    }
  },
  async clear() {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  },
};

// Chamado quando o refresh falha e a sessão é encerrada (ex: AuthProvider desloga).
let onSessionExpired: (() => void) | null = null;
export function setSessionExpiredHandler(handler: (() => void) | null) {
  onSessionExpired = handler;
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await tokenStorage.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
);

// Controle de fila para evitar múltiplos refresh simultâneos
let isRefreshing = false;
let failedQueue: {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}[] = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (token) resolve(token);
    else reject(error);
  });
  failedQueue = [];
}

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Rotas de /auth (login, refresh...) devolvem 401 por credenciais inválidas,
    // não por token expirado — repassa o erro original para quem chamou.
    const isAuthRoute = originalRequest?.url?.startsWith("/auth/");
    if (error.response?.status !== 401 || originalRequest._retry || isAuthRoute) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = await tokenStorage.getRefreshToken();
      if (!refreshToken) throw new Error("No refresh token available");

      const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
        refresh_token: refreshToken,
      });

      await tokenStorage.save(data.access_token, data.refresh_token);

      processQueue(null, data.access_token);
      originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      await tokenStorage.clear();
      onSessionExpired?.();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

const API_ERRORS: Record<string, string> = {
  "insufficient quantity": "Estoque insuficiente para um dos produtos.",
  "discount amount cannot exceed subtotal": "O desconto não pode ser maior que o subtotal.",
  "customer_id is required for installment sales": "Selecione um cliente para vendas no crediário.",
  "the sale must have at least one item": "Adicione pelo menos um produto à venda.",
  "categoria informada não existe": "A categoria selecionada não existe mais. Escolha outra.",
  "product limit reached for plan": "Você atingiu o limite de produtos do seu plano.",
  "The amount entered is greater than the outstanding balance.":
    "O valor informado é maior que o saldo devedor do cliente.",
};

/** Erros do banco repassados pela API, reconhecidos pelo nome da constraint. */
const API_ERROR_PATTERNS: [string, string][] = [
  ["uq_customer_cpf_company", "Já existe um cliente com este CPF."],
  ["uq_customer_email_company", "Já existe um cliente com este email."],
];

/** Converte o erro da API (`{ error: string }`) em uma mensagem para o usuário. */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!isAxiosError(error)) return fallback;
  if (!error.response) return "Não foi possível conectar ao servidor. Verifique sua internet.";

  const { status, data } = error.response;
  const apiMessage = typeof data?.error === "string" ? data.error : "";

  if (API_ERRORS[apiMessage]) return API_ERRORS[apiMessage];
  const pattern = API_ERROR_PATTERNS.find(([key]) => apiMessage.includes(key));
  if (pattern) return pattern[1];
  if (status === 403) return "Seu usuário não tem acesso a este módulo.";
  return fallback;
}
