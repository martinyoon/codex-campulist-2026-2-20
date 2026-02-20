import { AppError } from "@/src/domain/errors";

export const DATA_PROVIDERS = ["mock", "supabase"] as const;

export type DataProvider = (typeof DATA_PROVIDERS)[number];

export const readDataProvider = (): DataProvider => {
  const raw = process.env.DATA_PROVIDER?.trim().toLowerCase();
  if (!raw || raw === "mock") {
    return "mock";
  }

  if (raw === "supabase") {
    return "supabase";
  }

  throw new AppError(
    "BAD_REQUEST",
    `Invalid DATA_PROVIDER: ${raw}. Use one of: ${DATA_PROVIDERS.join(", ")}.`,
  );
};
