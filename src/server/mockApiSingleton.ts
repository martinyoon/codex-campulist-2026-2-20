import {
  createApiFromRepositories,
  createMockApi,
  type MockApi,
} from "@/src/mock/api";
import { readSupabaseRepositoryOptions } from "@/src/supabase";
import { createSupabaseRepositories } from "@/src/supabase/repositories";
import { readDataProvider } from "@/src/server/dataProvider";

type GlobalWithMockApi = typeof globalThis & {
  __campulist_api__?: MockApi;
};

const globalWithMockApi = globalThis as GlobalWithMockApi;

const createServerApi = (): MockApi => {
  const provider = readDataProvider();
  if (provider === "mock") {
    return createMockApi();
  }

  const repositories = createSupabaseRepositories(readSupabaseRepositoryOptions());
  return createApiFromRepositories(repositories);
};

export const mockApi = globalWithMockApi.__campulist_api__ ?? createServerApi();

if (process.env.NODE_ENV !== "production" && !globalWithMockApi.__campulist_api__) {
  globalWithMockApi.__campulist_api__ = mockApi;
}
