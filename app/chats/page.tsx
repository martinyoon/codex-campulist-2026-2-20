import Link from "next/link";
import { mockApi } from "@/src/server/mockApiSingleton";
import { ChatListRefreshControls } from "./chatListRefreshControls";
import { EmptyState, ErrorState } from "@/app/stateBlocks";
import { getUserRoleLabel } from "@/src/ui/labelMap";
import { StatusBadge } from "@/app/components/statusBadge";

export default async function ChatsPage() {
  const [sessionResult, threadsResult] = await Promise.all([
    mockApi.getSession(),
    mockApi.listMyChats(),
  ]);

  const roleText = sessionResult.ok ? getUserRoleLabel(sessionResult.data.role) : "guest";

  return (
    <>
      <section className="hero">
        <h1>채팅함</h1>
        <p>
          현재 세션 역할: {roleText}. 게시글 문의 대화를 확인하고 메시지를
          이어갈 수 있습니다.
        </p>
      </section>

      {!threadsResult.ok ? (
        <ErrorState
          title="채팅 목록을 불러오지 못했습니다."
          description={threadsResult.error.message}
          action_href="/chats"
          action_label="다시 시도"
        />
      ) : null}

      {threadsResult.ok ? (
        <>
          <section className="grid" style={{ marginTop: 16 }}>
            {threadsResult.data.map((thread) => (
              <article key={thread.id} className="post-item">
                <h4>
                  <Link href={`/chats/${thread.id}`}>채팅방 {thread.id.slice(0, 8)}</Link>
                </h4>
                <div className="post-meta">
                  <StatusBadge kind="chat" value={thread.status} />
                  <span>참여자 {thread.participant_ids.length}명</span>
                  <span>
                    최근 활동{" "}
                    {new Date(
                      thread.last_message_at ?? thread.created_at,
                    ).toLocaleString("ko-KR")}
                  </span>
                  <Link href={`/posts/${thread.post_id}`} className="btn">
                    원글 보기
                  </Link>
                </div>
              </article>
            ))}
            {threadsResult.data.length === 0 ? (
              <EmptyState
                title="아직 채팅방이 없습니다."
                description="게시글 상세 페이지에서 문의 채팅을 시작해 보세요."
                action_href="/boards/market"
                action_label="게시판 보러가기"
              />
            ) : null}
          </section>

          <ChatListRefreshControls />
        </>
      ) : null}
    </>
  );
}
