import { isAxiosError } from "axios";

import { LoginRequest, LoginResponse, User } from "@/interfaces/auth.interface";
import { apiClient } from "./api.service";

export const AUTH_AUDIENCE = "protrack-stock-app";

export const Login = async (params: LoginRequest): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>("/auth/login", params);
  return response.data;
};

export const GetMe = async (): Promise<User> => {
  const response = await apiClient.get<User>("/me");
  return response.data;
};

export const Logout = async (): Promise<void> => {
  await apiClient.post("/logout");
};

const LOGIN_ERRORS: Record<string, string> = {
  "invalid credentials": "E-mail ou senha inválidos.",
  "subscription canceled": "A assinatura da sua empresa foi cancelada.",
  "subscription paused": "A assinatura da sua empresa está pausada.",
  "subscription expired": "A assinatura da sua empresa expirou.",
};

/** Converte o erro da API (`{ error: string }`) em uma mensagem para o usuário. */
export function getLoginErrorMessage(error: unknown): string {
  if (!isAxiosError(error)) return "Não foi possível entrar. Tente novamente.";
  if (!error.response) return "Não foi possível conectar ao servidor. Verifique sua internet.";

  const { status, data } = error.response;
  const apiMessage = typeof data?.error === "string" ? data.error : "";

  if (LOGIN_ERRORS[apiMessage]) return LOGIN_ERRORS[apiMessage];
  if (status === 429) return "Muitas tentativas. Tente novamente em alguns minutos.";
  if (status === 400) return "Verifique o e-mail e a senha informados.";
  if (status === 401) return "E-mail ou senha inválidos.";
  return "Não foi possível entrar. Tente novamente.";
}
