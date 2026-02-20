import Link from "next/link";
import { notFound } from "next/navigation";
import { mockApi } from "@/src/server/mockApiSingleton";
import { ChatComposer } from "./chatComposer";
import { ChatRefreshControls } from "./chatRefreshControls";

interface PageProps {
  params: { id: string };
}

export default async function ChatThreadPage({ params }: PageProps) {
  const [threadsResult, messagesResult] = await Promise.all([
    mockApi.listMyChats(),
    mockApi.listMessages(params.id),
  ]);

  if (!threadsResult.ok) {
    notFound();
  }

  const thread = threadsResult.data.find((item) => item.id === params.id);
  if (!thread || !messagesResult.ok) {
    notFound();
  }

  const messages = messagesResult.data;

  return (
    <>
      <section className="hero">
        <h1>채팅방 {thread.id.slice(0, 8)}</h1>
        <p>
          원글 <Link href={`/posts/${thread.post_id}`}>{thread.post_id.slice(0, 8)}</Link>
          에 대한 문의 대화입니다.
        </p>
      </section>

      <section className="grid" style={{ marginTop: 16 }}>
        {messages.map((message) => (
          <article className="post-item" key={message.id}>
            <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{message.body}</p>
            <div className="post-meta">
              <span>보낸 사용자 {message.sender_id.slice(0, 8)}</span>
              <span>{new Date(message.created_at).toLocaleString("ko-KR")}</span>
            </div>
          </article>
        ))}
        {messages.length === 0 ? (
          <article className="post-item">
            <p className="muted">아직 메시지가 없습니다.</p>
          </article>
        ) : null}
      </section>

      <ChatRefreshControls />

      <ChatComposer threadId={thread.id} />

      <div style={{ marginTop: 16 }}>
        <Link href="/chats" className="btn">
          채팅 목록으로
        </Link>
      </div>
    </>
  );
}
