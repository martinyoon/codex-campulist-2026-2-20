"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmModal } from "@/app/components/confirmModal";
import { useToast } from "@/app/components/toastProvider";
import { getPostStatusLabel } from "@/src/ui/labelMap";

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

const STATUS_OPTIONS = ["active", "reserved", "closed"] as const;

export function MyPostActions({
  postId,
  currentStatus,
}: {
  postId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const { pushToast } = useToast();
  const [status, setStatus] = useState(currentStatus);
  const [busy, setBusy] = useState<"status" | "delete" | null>(null);
  const [message, setMessage] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const updateStatus = async () => {
    setBusy("status");
    setMessage("");
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const result = (await response.json()) as ApiResponse<{ status: string }>;
      if (!result.ok) {
        const errorMessage = result.error?.message ?? "상태 변경 실패";
        setMessage(errorMessage);
        pushToast({ kind: "error", message: errorMessage });
        return;
      }
      setMessage("상태가 변경되었습니다.");
      pushToast({ kind: "success", message: "게시글 상태를 변경했습니다." });
      router.refresh();
    } catch {
      setMessage("요청 처리 중 오류가 발생했습니다.");
      pushToast({ kind: "error", message: "요청 처리 중 오류가 발생했습니다." });
    } finally {
      setBusy(null);
    }
  };

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
      <div className="row-2">
        <select
          className="select"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          disabled={busy !== null}
        >
          {STATUS_OPTIONS.map((item) => (
            <option key={item} value={item}>
              {getPostStatusLabel(item)}
            </option>
          ))}
        </select>
        <button
          className="btn"
          type="button"
          onClick={updateStatus}
          disabled={busy !== null}
        >
          상태 변경
        </button>
      </div>
      <button
        className="btn btn-danger"
        type="button"
        onClick={() => setDeleteModalOpen(true)}
        disabled={busy !== null}
      >
        삭제 처리
      </button>
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
