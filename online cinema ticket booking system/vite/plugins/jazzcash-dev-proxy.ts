import type { IncomingMessage, ServerResponse } from "node:http";
import { createHmac } from "node:crypto";
import type { Plugin } from "vite";
import { loadEnv } from "vite";

/** JazzCash Mobile Account (MWALLET) — secure hash per common merchant integration (HMAC-SHA256). */
function jazzCashSecureHash(fields: Record<string, string>, integritySalt: string): string {
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
  const payload = `${integritySalt}${tail}`;
  return createHmac("sha256", integritySalt).update(payload).digest("hex");
}

function formatTxnDateTime(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}` +
    `${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`
  );
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function sendJson(res: ServerResponse, status: number, data: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(data));
}

export function jazzcashDevProxy(mode: string): Plugin {
  return {
    name: "jazzcash-dev-proxy",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const pathname = req.url?.split("?")[0] ?? "";
        if (pathname !== "/api/payments/jazzcash-mwallet" || req.method !== "POST") {
          return next();
        }

        const env = loadEnv(mode, process.cwd(), "");
        const merchantId = env.JAZZCASH_MERCHANT_ID?.trim();
        const password = env.JAZZCASH_MERCHANT_PASSWORD?.trim();
        const integritySalt = env.JAZZCASH_INTEGRITY_SALT?.trim();
        const apiUrl =
          env.JAZZCASH_API_URL?.trim() ||
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
          const raw = await readBody(req as IncomingMessage);
          bodyJson = JSON.parse(raw || "{}");
        } catch {
          return sendJson(res as ServerResponse, 400, { error: "Invalid JSON body" });
        }

        const {
          txnRefNo,
          mobileNumber,
          cnicLast6,
          amountPkr,
          billReference,
          description,
        } = bodyJson;

        if (!txnRefNo || !mobileNumber || !cnicLast6 || amountPkr == null || !billReference) {
          return sendJson(res as ServerResponse, 400, {
            error: "Missing txnRefNo, mobileNumber, cnicLast6, amountPkr, or billReference",
          });
        }

        const amountStr = String(Math.round(Number(amountPkr) * 100));
        const now = new Date();
        const expiry = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const txnDateTime = formatTxnDateTime(now);
        const txnExpiryDateTime = formatTxnDateTime(expiry);
        const desc = (description || "Cinema ticket booking").replace(/[<>\\*=%/:'"{}]/g, " ").slice(0, 200);

        if (!merchantId || !password || !integritySalt) {
          return sendJson(res as ServerResponse, 200, {
            demo: true,
            pp_ResponseCode: "000",
            pp_ResponseMessage:
              "Demo JazzCash: add JAZZCASH_MERCHANT_ID, JAZZCASH_MERCHANT_PASSWORD, JAZZCASH_INTEGRITY_SALT to .env for live sandbox calls.",
            pp_TxnRefNo: txnRefNo,
          });
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

        payload.pp_SecureHash = jazzCashSecureHash(payload, integritySalt);

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
            return sendJson(res as ServerResponse, 502, {
              error: "JazzCash returned non-JSON",
              status: jcRes.status,
              bodyPreview: text.slice(0, 500),
            });
          }

          const code =
            (parsed.pp_ResponseCode as string) ||
            (parsed.responseCode as string) ||
            (parsed.pp_responseCode as string) ||
            "";

          return sendJson(res as ServerResponse, 200, {
            httpStatus: jcRes.status,
            pp_ResponseCode: code,
            pp_ResponseMessage:
              (parsed.pp_ResponseMessage as string) ||
              (parsed.responseMessage as string) ||
              "",
            raw: parsed,
          });
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : String(e);
          return sendJson(res as ServerResponse, 502, {
            error: "JazzCash request failed",
            detail: msg,
          });
        }
      });
    },
  };
}
