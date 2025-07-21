import { CreateTransactionRequest,CreateTransactionResponse } from "../interfaces/transactions";


const API_BASE =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
export async function createTransaction(
  payload: CreateTransactionRequest,
  options?: { signal?: AbortSignal }
): Promise<CreateTransactionResponse> {
  const url = `${API_BASE}/transactions`;

  console.log('[createTransaction] URL:', url);
  console.log('[createTransaction] Payload enviado:', payload);

  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: options?.signal,
  });

  let json: any = null;
  try {
    json = await resp.json();
  } catch {
    throw new Error(`Respuesta no válida del servidor (${resp.status}).`);
  }

  if (!resp.ok) {
    const msg =
      typeof json?.message === 'string'
        ? json.message
        : `Error HTTP ${resp.status}`;
    console.error('[createTransaction] Error en backend:', json);
    throw new Error(msg);
  }

  console.log('[createTransaction] Respuesta JSON:', json);
  return json as CreateTransactionResponse;
}