import Decimal from "decimal.js";
import { z } from "zod";

const mfapiResponseSchema = z.object({
  meta: z.object({
    fund_house: z.string().trim().min(1),
    scheme_name: z.string().trim().min(1),
  }),
  data: z
    .array(
      z.object({
        date: z.string().trim().min(1),
        nav: z.string().trim().min(1),
      }),
    )
    .min(1),
});

export type LiveFundData = Readonly<{
  amfiCode: string;
  fundHouse: string;
  name: string;
  latestNAV: string;
  date: string;
}>;

function getRequestTimeoutMs(): number {
  const configuredTimeout = Number(process.env.MFAPI_REQUEST_TIMEOUT_MS);

  return Number.isFinite(configuredTimeout) && configuredTimeout >= 3000
    ? configuredTimeout
    : 10000;
}

export async function getLiveFundData(
  amfiCode: string,
): Promise<LiveFundData | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    getRequestTimeoutMs(),
  );

  try {
    const response = await fetch(`https://api.mfapi.in/mf/${amfiCode}`, {
      signal: controller.signal,
      next: { revalidate: 60 * 60 },
    });

    if (!response.ok) {
      console.error("[MFapi Error]:", {
        amfiCode,
        status: response.status,
        statusText: response.statusText,
      });
      return null;
    }

    const parsedResponse = mfapiResponseSchema.safeParse(await response.json());

    if (!parsedResponse.success) {
      console.error("[MFapi Response Error]:", {
        amfiCode,
        issues: parsedResponse.error.issues,
      });
      return null;
    }

    const latestNav = parsedResponse.data.data[0];

    if (!latestNav) {
      return null;
    }

    return {
      amfiCode,
      fundHouse: parsedResponse.data.meta.fund_house,
      name: parsedResponse.data.meta.scheme_name,
      latestNAV: new Decimal(latestNav.nav).toFixed(4),
      date: latestNav.date,
    };
  } catch (error) {
    console.error("[MFapi Error]:", { amfiCode, error });
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}
