/**
 * Supabase Edge Function: JazzCash Mobile Account (MWALLET) proxy.
 * Deploy: supabase functions deploy jazzcash-mwallet --no-verify-jwt
 * Secrets: supabase secrets set JAZZCASH_MERCHANT_ID ... (see repo .env.example)
 */

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function jazzCashSecureHash(
  fields: Record<string, string>,
  integritySalt: string,
): Promise<string> {
  const keys = Object.keys(fields)
    .filter((k) => k !== "pp_SecureHash")
    .sort((a, b) => a.localeCompare(b));
  let tail = "";
  for (const key of keys) {
    const val = fields[key];
    if (val !== undefined && val !== null && String(val).length > 0) {
      tail += `&${String(val)}`;
    }
  }
  const message = `${integritySalt}${tail}`;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(integritySalt),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function formatTxnDateTime(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}` +
    `${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`
  );
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const merchantId = Deno.env.get("JAZZCASH_MERCHANT_ID")?.trim();
  const password = Deno.env.get("JAZZCASH_MERCHANT_PASSWORD")?.trim();
  const integritySalt = Deno.env.get("JAZZCASH_INTEGRITY_SALT")?.trim();
  const apiUrl =
    Deno.env.get("JAZZCASH_API_URL")?.trim() ||
    "https://sandbox.jazzcash.com.pk/ApplicationAPI/API/2.0/Purchase/DoMWalletTransaction";

  let bodyJson: {
    txnRefNo?: string;
    mobileNumber?: string;
    cnicLast6?: string;
    amountPkr?: number;
    billReference?: string;
    description?: string;
  };

  try {
    bodyJson = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { txnRefNo, mobileNumber, cnicLast6, amountPkr, billReference, description } = bodyJson;

  if (!txnRefNo || !mobileNumber || !cnicLast6 || amountPkr == null || !billReference) {
    return new Response(
      JSON.stringify({ error: "Missing txnRefNo, mobileNumber, cnicLast6, amountPkr, or billReference" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const amountStr = String(Math.round(Number(amountPkr) * 100));
  const now = new Date();
  const expiry = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const txnDateTime = formatTxnDateTime(now);
  const txnExpiryDateTime = formatTxnDateTime(expiry);
  const desc = (description || "Payment").replace(/[<>\\*=%/:'"{}]/g, " ").slice(0, 200);

  if (!merchantId || !password || !integritySalt) {
    return new Response(
      JSON.stringify({
        demo: true,
        pp_ResponseCode: "000",
        pp_ResponseMessage:
          "Demo JazzCash: set JAZZCASH_MERCHANT_ID, JAZZCASH_MERCHANT_PASSWORD, JAZZCASH_INTEGRITY_SALT as function secrets.",
        pp_TxnRefNo: txnRefNo,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const payload: Record<string, string> = {
    pp_Version: "2.0",
    pp_Language: "EN",
    pp_MerchantID: merchantId,
    pp_SubMerchantID: "",
    pp_Password: password,
    pp_TxnType: "MWALLET",
    pp_TxnRefNo: txnRefNo,
    pp_MobileNumber: mobileNumber.replace(/\D/g, ""),
    pp_CNIC: cnicLast6.replace(/\D/g, "").slice(-6),
    pp_Amount: amountStr,
    pp_DiscountedAmount: "",
    pp_TxnCurrency: "PKR",
    pp_TxnDateTime: txnDateTime,
    pp_BillReference: billReference.slice(0, 40),
    pp_Description: desc,
    pp_TxnExpiryDateTime: txnExpiryDateTime,
    ppmpf_1: "",
    ppmpf_2: "",
    ppmpf_3: "",
    ppmpf_4: "",
    ppmpf_5: "",
  };

  payload.pp_SecureHash = await jazzCashSecureHash(payload, integritySalt);

  try {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), 45_000);
    const jcRes = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: ac.signal,
    });
    clearTimeout(t);

    const text = await jcRes.text();
    let parsed: Record<string, unknown> = {};
    try {
      parsed = JSON.parse(text) as Record<string, unknown>;
    } catch {
      return new Response(
        JSON.stringify({ error: "JazzCash returned non-JSON", status: jcRes.status, preview: text.slice(0, 500) }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const code =
      (parsed.pp_ResponseCode as string) ||
      (parsed.responseCode as string) ||
      (parsed.pp_responseCode as string) ||
      "";

    return new Response(
      JSON.stringify({
        httpStatus: jcRes.status,
        pp_ResponseCode: code,
        pp_ResponseMessage:
          (parsed.pp_ResponseMessage as string) || (parsed.responseMessage as string) || "",
        raw: parsed,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: "JazzCash request failed", detail: msg }), {
      status: 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
