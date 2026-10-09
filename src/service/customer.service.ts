import type {
  CepAddress,
  CreateCustomerRequest,
} from "@/interfaces/customer.interface";

import { apiClient } from "./api.service";

export async function CreateCustomer(
  payload: CreateCustomerRequest,
): Promise<string> {
  const response = await apiClient.post<{ customer_id: string }>(
    "/customers",
    payload,
  );
  return response.data.customer_id;
}

type ViaCepResponse = {
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean | string;
};

const CEP_TIMEOUT_MS = 10_000;

/** Busca o endereço no ViaCEP. Retorna `null` quando o CEP não existe. */
export async function LookupCep(cep: string): Promise<CepAddress | null> {
  const digits = cep.replace(/\D/g, "");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CEP_TIMEOUT_MS);

  let data: ViaCepResponse;
  try {
    const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`, {
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`ViaCEP ${response.status}`);
    data = (await response.json()) as ViaCepResponse;
  } finally {
    clearTimeout(timeout);
  }
  if (data.erro) return null;

  return {
    street: data.logradouro ?? "",
    neighborhood: data.bairro ?? "",
    city: data.localidade ?? "",
    state: data.uf ?? "",
  };
}
