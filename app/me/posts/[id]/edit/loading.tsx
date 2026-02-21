import { LoadingState } from "@/app/stateBlocks";

export default function Loading() {
  return (
    <LoadingState
      title="수정 화면을 불러오는 중입니다"
      description="게시글 정보를 확인하고 있습니다."
    />
  );
}
