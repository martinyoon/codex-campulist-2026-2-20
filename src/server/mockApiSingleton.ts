import { createMockApi, type MockApi } from "@/src/mock/api";

type GlobalWithMockApi = typeof globalThis & {
  __campulist_mock_api__?: MockApi;
};

const globalWithMockApi = globalThis as GlobalWithMockApi;

export const mockApi =
  globalWithMockApi.__campulist_mock_api__ ?? createMockApi();

if (process.env.NODE_ENV !== "production") {
  globalWithMockApi.__campulist_mock_api__ = mockApi;
}
