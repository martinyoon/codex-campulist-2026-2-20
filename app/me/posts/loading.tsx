import { LoadingState } from "@/app/stateBlocks";

export default function MyPostsLoading() {
  return (
    <LoadingState
      title="내 게시글을 불러오는 중입니다"
      description="작성한 글 목록과 상태를 조회하고 있습니다."
    />
  );
}
