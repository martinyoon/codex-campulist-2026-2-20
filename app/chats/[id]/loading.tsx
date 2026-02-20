import { LoadingState } from "@/app/stateBlocks";

export default function ChatThreadLoading() {
  return (
    <LoadingState
      title="대화 내용을 불러오는 중입니다"
      description="메시지 기록을 준비하고 있습니다."
    />
  );
}
