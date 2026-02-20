import { LoadingState } from "@/app/stateBlocks";

export default function BoardsCategoryLoading() {
  return (
    <LoadingState
      title="게시글을 불러오는 중입니다"
      description="선택한 카테고리 목록을 준비하고 있습니다."
    />
  );
}
