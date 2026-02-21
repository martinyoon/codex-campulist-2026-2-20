"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmModal } from "@/app/components/confirmModal";
import { useToast } from "@/app/components/toastProvider";

interface ApiResponse<T> {
  ok: boolean;
  status: number;
  data?: T;
  error?: {
    status: number;
    code: string;
    message: string;
  };
}

export function MyPostActions({
  postId,
}: {
  postId: string;
}) {
  const router = useRouter();
  const { pushToast } = useToast();
  const [busy, setBusy] = useState<"delete" | null>(null);
  const [message, setMessage] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const softDelete = async () => {
    setBusy("delete");
    setMessage("");
    try {
      const response = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
      const result = (await response.json()) as ApiResponse<{ deleted: boolean }>;
      if (!result.ok) {
        const errorMessage = result.error?.message ?? "삭제 실패";
        setMessage(errorMessage);
        pushToast({ kind: "error", message: errorMessage });
        return;
      }
      setMessage("게시글이 삭제 처리되었습니다.");
      pushToast({ kind: "success", message: "게시글을 삭제 처리했습니다." });
      setDeleteModalOpen(false);
      router.refresh();
    } catch {
      setMessage("요청 처리 중 오류가 발생했습니다.");
      pushToast({ kind: "error", message: "요청 처리 중 오류가 발생했습니다." });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="form-grid" style={{ marginTop: 10 }}>
      <div className="note">상태 변경은 수정 화면에서 처리합니다.</div>
      <div className="row-2">
        <Link className="btn" href={`/me/posts/${postId}/edit`}>
          수정
        </Link>
        <button
          className="btn btn-danger"
          type="button"
          onClick={() => setDeleteModalOpen(true)}
          disabled={busy !== null}
        >
          삭제 처리
        </button>
      </div>
      {message ? <div className="note">{message}</div> : null}

      <ConfirmModal
        open={deleteModalOpen}
        title="게시글을 삭제 처리할까요?"
        description="삭제 처리 후에는 목록에서 노출되지 않습니다."
        confirm_label="삭제 처리"
        tone="danger"
        pending={busy === "delete"}
        on_cancel={() => setDeleteModalOpen(false)}
        on_confirm={softDelete}
      />
    </div>
  );
}
