import { LoadingState } from "@/app/stateBlocks";

export default function ChatsLoading() {
  return (
    <LoadingState
      title="채팅 목록을 불러오는 중입니다"
      description="내 대화방을 조회하고 있습니다."
    />
  );
}
