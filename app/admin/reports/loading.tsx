import { LoadingState } from "@/app/stateBlocks";

export default function AdminReportsLoading() {
  return (
    <LoadingState
      title="신고 목록을 불러오는 중입니다"
      description="관리자 처리 대상을 조회하고 있습니다."
    />
  );
}
