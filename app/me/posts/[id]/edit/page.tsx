import { notFound } from "next/navigation";
import { mockApi } from "@/src/server/mockApiSingleton";
import { ErrorState } from "@/app/stateBlocks";
import { StatusBadge } from "@/app/components/statusBadge";
import { getPostCategoryLabel } from "@/src/ui/labelMap";
import { EditPostForm } from "./editForm";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function EditMyPostPage({ params }: PageProps) {
  const [sessionResult, listResult] = await Promise.all([
    mockApi.getSession(),
    mockApi.listPosts({
      sort: "newest",
      limit: 1000,
      offset: 0,
    }),
  ]);

  if (!sessionResult.ok) {
    return (
      <>
        <section className="hero">
          <h1>내 게시글 수정</h1>
          <p>내가 작성한 게시글의 내용을 수정합니다.</p>
        </section>
        <ErrorState
          title="세션 정보를 확인할 수 없습니다."
          description={sessionResult.error.message}
          action_href="/login"
          action_label="역할 전환하기"
        />
      </>
    );
  }

  if (!listResult.ok) {
    return (
      <>
        <section className="hero">
          <h1>내 게시글 수정</h1>
          <p>내가 작성한 게시글의 내용을 수정합니다.</p>
        </section>
        <ErrorState
          title="내 게시글 목록을 불러오지 못했습니다."
          description={listResult.error.message}
          action_href="/me/posts"
          action_label="목록으로"
        />
      </>
    );
  }

  const session = sessionResult.data;
  const post = listResult.data.items.find(
    (item) => item.id === params.id && item.author_id === session.user_id,
  );

  if (!post) {
    notFound();
  }

  return (
    <>
      <section className="hero">
        <h1>내 게시글 수정</h1>
        <p>필요한 항목만 바꾸고 저장하세요. 상태는 내 게시글 관리에서 원클릭으로 변경됩니다.</p>
      </section>

      <section className="card" style={{ marginTop: 16 }}>
        <div className="post-meta">
          <span className="chip">{getPostCategoryLabel(post.category)}</span>
          <StatusBadge kind="post" value={post.status} />
          <span>작성: {new Date(post.created_at).toLocaleString("ko-KR")}</span>
        </div>
      </section>

      <EditPostForm
        postId={post.id}
        role={session.role}
        initial={{
          category: post.category,
          status: post.status,
          title: post.title,
          body: post.body,
          price_krw: post.price_krw,
          location_hint: post.location_hint,
          tags: post.tags,
        }}
      />
    </>
  );
}
