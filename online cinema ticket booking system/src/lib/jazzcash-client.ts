/**
 * Browser client for JazzCash Mobile Wallet (MWALLET) initiation.
 * Dev: POST /api/payments/jazzcash-mwallet (Vite plugin — keeps merchant secrets server-side).
 * Prod: set VITE_JAZZCASH_API_URL to your backend (e.g. Supabase Edge Function); enable CORS there.
 */

export function formatJazzCashAmountPkr(pkr: number): string {
  return String(Math.round(Number(pkr) * 100));
}

/** Normalize common PK mobile inputs to 03XXXXXXXXX */
export function normalizePkMobile(input: string): string {
  const d = input.replace(/\D/g, "");
  if (d.length === 12 && d.startsWith("92")) return `0${d.slice(2)}`;
  if (d.length === 10 && d.startsWith("3")) return `0${d}`;
  return d;
}

export interface JazzCashMwalletClientPayload {
  txnRefNo: string;
  mobileNumber: string;
  cnicLast6: string;
  amountPkr: number;
  billReference: string;
  description: string;
}

export interface JazzCashMwalletClientResult {
  ok: boolean;
  demo?: boolean;
  pp_ResponseCode?: string;
  pp_ResponseMessage?: string;
  error?: string;
  detail?: string;
}

export async function initiateJazzCashMwalletPayment(
  payload: JazzCashMwalletClientPayload,
): Promise<JazzCashMwalletClientResult> {
  const endpoint =
    import.meta.env.VITE_JAZZCASH_API_URL?.trim() || "/api/payments/jazzcash-mwallet";

  let res: Response;
  try {
    res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return {
      ok: false,
      error: "Network error calling JazzCash API",
      detail: msg,
    };
  }

  let data: Record<string, unknown> = {};
  try {
    data = (await res.json()) as Record<string, unknown>;
  } catch {
    return { ok: false, error: "Invalid response from payment server", detail: `HTTP ${res.status}` };
  }

  if (!res.ok) {
    return {
      ok: false,
      error: (data.error as string) || `Payment server error (${res.status})`,
      detail: (data.detail as string) || "",
    };
  }

  const code = String(data.pp_ResponseCode ?? "");
  const demo = Boolean(data.demo);
  const ok = code === "000";

  return {
    ok,
    demo,
    pp_ResponseCode: code,
    pp_ResponseMessage: String(data.pp_ResponseMessage ?? ""),
    error: ok ? undefined : code || "DECLINED",
    detail: String(data.pp_ResponseMessage ?? ""),
  };
}

export function generateJazzCashTxnRef(): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const d = new Date();
  const stamp =
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}` +
    `${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  const rnd = Math.floor(1000 + Math.random() * 9000);
  return `T${stamp}${rnd}`;
}
