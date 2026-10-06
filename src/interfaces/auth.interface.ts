export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  has_company: boolean;
  expires_in: number; // segundos
  token_type: string; // "Bearer"
}

export interface LoginRequest {
  email: string;
  password: string;
  aud: string;
}

/** Resposta de GET /me. */
export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  role: string;
  company_id: string;
  department_id: string;
  department_name: string;
  /** Módulos liberados para o departamento. ADMIN tem acesso a tudo. */
  modules: string[] | null;
}
