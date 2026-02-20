"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ApiResponse<T> {
  ok: boolean;
  status: number;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export function PostActions({ postId }: { postId: string }) {
  const router = useRouter();
  const [chatMessage, setChatMessage] = useState<string>("");
  const [reportMessage, setReportMessage] = useState<string>("");
  const [busy, setBusy] = useState<"chat" | "report" | null>(null);

  const startChat = async () => {
    setBusy("chat");
    setChatMessage("");
    try {
      const response = await fetch("/api/chats/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: postId }),
      });
      const result = (await response.json()) as ApiResponse<{ id: string }>;
      if (!result.ok || !result.data) {
        setChatMessage(result.error?.message ?? "채팅 시작 실패");
        return;
      }
      router.push(`/chats/${result.data.id}`);
      router.refresh();
    } catch {
      setChatMessage("요청 중 오류가 발생했습니다.");
    } finally {
      setBusy(null);
    }
  };

  const reportSpam = async () => {
    setBusy("report");
    setReportMessage("");
    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target_type: "post",
          target_id: postId,
          reason: "spam",
          details: "시제품 테스트 신고",
        }),
      });
      const result = (await response.json()) as ApiResponse<{ id: string }>;
      if (!result.ok || !result.data) {
        setReportMessage(result.error?.message ?? "신고 실패");
        return;
      }
      setReportMessage(`신고 접수 완료: ${result.data.id}`);
    } catch {
      setReportMessage("요청 중 오류가 발생했습니다.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="form-grid" style={{ marginTop: 16 }}>
      <div className="row-2">
        <button
          className="btn btn-primary"
          type="button"
          onClick={startChat}
          disabled={busy !== null}
        >
          {busy === "chat" ? "연결 중..." : "문의 채팅 시작"}
        </button>
        <button
          className="btn btn-danger"
          type="button"
          onClick={reportSpam}
          disabled={busy !== null}
        >
          {busy === "report" ? "신고 중..." : "신고하기(스팸)"}
        </button>
      </div>
      {chatMessage ? <div className="note">{chatMessage}</div> : null}
      {reportMessage ? <div className="note">{reportMessage}</div> : null}
    </div>
  );
}
