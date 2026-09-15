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

function createTimeoutSignal(timeoutMs: number): AbortSignal {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeoutMs);
  return controller.signal;
}

export async function getLiveFundData(
  amfiCode: string,
): Promise<LiveFundData | null> {
  try {
    const response = await fetch(`https://api.mfapi.in/mf/${amfiCode}`, {
      signal: createTimeoutSignal(2500),
      next: { revalidate: 60 * 60 },
    });

    if (!response.ok) {
      return null;
    }

    const parsedResponse = mfapiResponseSchema.safeParse(await response.json());

    if (!parsedResponse.success) {
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
  } catch {
    return null;
  }
}
