import { mockApi } from "@/src/server/mockApiSingleton";
import { toNextResponse } from "@/src/server/apiResponse";

export async function GET() {
  const result = await mockApi.getSession();
  return toNextResponse(result);
}
