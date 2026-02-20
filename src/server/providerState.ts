import { AppError } from "@/src/domain/errors";
import { readSupabaseEnv } from "@/src/supabase";
import { type DataProvider, readDataProvider } from "@/src/server/dataProvider";

const TRUE_VALUES = new Set(["1", "true", "yes", "on"]);

export interface ProviderState {
  requested_provider: DataProvider;
  requested_provider_raw: string | null;
  effective_provider: DataProvider;
  ready: boolean;
  reason: string | null;
  checks: {
    supabase_env_ready: boolean;
    supabase_repository_ready: boolean;
  };
}

const readDataProviderSafe = (): {
  provider: DataProvider;
  raw: string | null;
  reason: string | null;
} => {
  const raw = process.env.DATA_PROVIDER?.trim().toLowerCase() ?? null;

  try {
    return {
      provider: readDataProvider(),
      raw,
      reason: null,
    };
  } catch (error) {
    if (error instanceof AppError) {
      return {
        provider: "mock",
        raw,
        reason: error.message,
      };
    }
    throw error;
  }
};

const readSupabaseRepositoryReady = (): boolean => {
  const raw = process.env.SUPABASE_REPOSITORY_READY?.trim().toLowerCase();
  if (!raw) {
    return false;
  }
  return TRUE_VALUES.has(raw);
};

export const resolveProviderState = (): ProviderState => {
  const providerConfig = readDataProviderSafe();
  const supabaseEnv = readSupabaseEnv();
  const supabaseEnvReady =
    !!supabaseEnv.NEXT_PUBLIC_SUPABASE_URL &&
    !!supabaseEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseRepositoryReady = readSupabaseRepositoryReady();

  if (providerConfig.reason) {
    return {
      requested_provider: providerConfig.provider,
      requested_provider_raw: providerConfig.raw,
      effective_provider: "mock",
      ready: false,
      reason: `${providerConfig.reason} Falling back to mock provider.`,
      checks: {
        supabase_env_ready: supabaseEnvReady,
        supabase_repository_ready: supabaseRepositoryReady,
      },
    };
  }

  if (providerConfig.provider === "mock") {
    return {
      requested_provider: "mock",
      requested_provider_raw: providerConfig.raw,
      effective_provider: "mock",
      ready: true,
      reason: null,
      checks: {
        supabase_env_ready: supabaseEnvReady,
        supabase_repository_ready: supabaseRepositoryReady,
      },
    };
  }

  if (!supabaseEnvReady) {
    return {
      requested_provider: "supabase",
      requested_provider_raw: providerConfig.raw,
      effective_provider: "mock",
      ready: false,
      reason:
        "Missing Supabase env vars (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY). Falling back to mock provider.",
      checks: {
        supabase_env_ready: false,
        supabase_repository_ready: supabaseRepositoryReady,
      },
    };
  }

  if (!supabaseRepositoryReady) {
    return {
      requested_provider: "supabase",
      requested_provider_raw: providerConfig.raw,
      effective_provider: "mock",
      ready: false,
      reason:
        "Supabase repository implementation is not enabled yet. Set SUPABASE_REPOSITORY_READY=true after implementation. Falling back to mock provider.",
      checks: {
        supabase_env_ready: true,
        supabase_repository_ready: false,
      },
    };
  }

  return {
    requested_provider: "supabase",
    requested_provider_raw: providerConfig.raw,
    effective_provider: "supabase",
    ready: true,
    reason: null,
    checks: {
      supabase_env_ready: true,
      supabase_repository_ready: true,
    },
  };
};
