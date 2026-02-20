"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmModal } from "@/app/components/confirmModal";
import { useToast } from "@/app/components/toastProvider";
import { getReportStatusLabel } from "@/src/ui/labelMap";

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

const RESOLVE_STATUS_OPTIONS = ["reviewed", "actioned", "rejected"] as const;

export function ReportActions({ reportId }: { reportId: string }) {
  const router = useRouter();
  const { pushToast } = useToast();
  const [status, setStatus] =
    useState<(typeof RESOLVE_STATUS_OPTIONS)[number]>("reviewed");
  const [hideTarget, setHideTarget] = useState(false);
  const [actionNote, setActionNote] = useState("시제품 처리");
  const [isSubmitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const resolveReport = async () => {
    setSubmitting(true);
    setMessage("");
    try {
      const response = await fetch(`/api/reports/${reportId}/resolve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          action_note: actionNote,
          hide_target: hideTarget,
        }),
      });
      const result = (await response.json()) as ApiResponse<{ id: string }>;
      if (!result.ok) {
        const errorMessage = result.error?.message ?? "처리 실패";
        setMessage(errorMessage);
        pushToast({ kind: "error", message: errorMessage });
        return;
      }
      setMessage("신고 처리 완료");
      setConfirmOpen(false);
      pushToast({ kind: "success", message: "신고를 처리했습니다." });
      router.refresh();
    } catch {
      setMessage("요청 처리 중 오류가 발생했습니다.");
      pushToast({ kind: "error", message: "요청 처리 중 오류가 발생했습니다." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="form-grid" style={{ marginTop: 12 }}>
      <div className="row-2">
        <select
          className="select"
          value={status}
          onChange={(event) =>
            setStatus(event.target.value as (typeof RESOLVE_STATUS_OPTIONS)[number])
          }
          disabled={isSubmitting}
        >
          {RESOLVE_STATUS_OPTIONS.map((item) => (
            <option key={item} value={item}>
              {getReportStatusLabel(item)}
            </option>
          ))}
        </select>
        <button
          className="btn btn-primary"
          type="button"
          onClick={() => setConfirmOpen(true)}
          disabled={isSubmitting}
        >
          {isSubmitting ? "처리 중..." : "신고 처리"}
        </button>
      </div>

      <input
        className="input"
        value={actionNote}
        onChange={(event) => setActionNote(event.target.value)}
        placeholder="처리 메모"
        disabled={isSubmitting}
      />

      <label className="note">
        <input
          type="checkbox"
          checked={hideTarget}
          onChange={(event) => setHideTarget(event.target.checked)}
          disabled={isSubmitting}
          style={{ marginRight: 6 }}
        />
        대상 게시글 숨김 처리
      </label>

      {message ? <div className="note">{message}</div> : null}

      <ConfirmModal
        open={confirmOpen}
        title="신고를 처리할까요?"
        description={`처리 상태: ${getReportStatusLabel(status)}${
          hideTarget ? "\n대상 게시글 숨김: 예" : ""
        }`}
        confirm_label="처리 확정"
        tone={hideTarget ? "danger" : "default"}
        pending={isSubmitting}
        on_cancel={() => setConfirmOpen(false)}
        on_confirm={resolveReport}
      />
    </div>
  );
}
