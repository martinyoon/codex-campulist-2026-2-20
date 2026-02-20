import {
  createApiFromRepositories,
  createMockApi,
  type MockApi,
} from "@/src/mock/api";
import { readSupabaseRepositoryOptions } from "@/src/supabase";
import { createSupabaseRepositories } from "@/src/supabase/repositories";
import { resolveProviderState } from "@/src/server/providerState";

type GlobalWithMockApi = typeof globalThis & {
  __campulist_api__?: MockApi;
};

const globalWithMockApi = globalThis as GlobalWithMockApi;

const createServerApi = (): MockApi => {
  const providerState = resolveProviderState();
  if (!providerState.ready && providerState.reason) {
    console.warn(`[ProviderFallback] ${providerState.reason}`);
  }

  if (providerState.effective_provider === "mock") {
    return createMockApi();
  }

  const repositories = createSupabaseRepositories(readSupabaseRepositoryOptions());
  return createApiFromRepositories(repositories);
};

export const mockApi = globalWithMockApi.__campulist_api__ ?? createServerApi();

if (process.env.NODE_ENV !== "production" && !globalWithMockApi.__campulist_api__) {
  globalWithMockApi.__campulist_api__ = mockApi;
}
