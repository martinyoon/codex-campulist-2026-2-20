import Link from "next/link";
import { mockApi } from "@/src/server/mockApiSingleton";
import { ChatListRefreshControls } from "./chatListRefreshControls";

export default async function ChatsPage() {
  const [sessionResult, threadsResult] = await Promise.all([
    mockApi.getSession(),
    mockApi.listMyChats(),
  ]);

  const roleText = sessionResult.ok ? sessionResult.data.role : "guest";
  const threads = threadsResult.ok ? threadsResult.data : [];

  return (
    <>
      <section className="hero">
        <h1>채팅함</h1>
        <p>
          현재 세션 역할: {roleText}. 게시글 문의 대화를 확인하고 메시지를
          이어갈 수 있습니다.
        </p>
      </section>

      <section className="grid" style={{ marginTop: 16 }}>
        {threads.map((thread) => (
          <article key={thread.id} className="post-item">
            <h4>
              <Link href={`/chats/${thread.id}`}>채팅방 {thread.id.slice(0, 8)}</Link>
            </h4>
            <div className="post-meta">
              <span className="chip">{thread.status}</span>
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
        {threads.length === 0 ? (
          <article className="post-item">
            <p className="muted">아직 채팅방이 없습니다.</p>
          </article>
        ) : null}
      </section>

      <ChatListRefreshControls />
    </>
  );
}
