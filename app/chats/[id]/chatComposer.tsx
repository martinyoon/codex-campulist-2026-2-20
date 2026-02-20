"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

export function ChatComposer({ threadId }: { threadId: string }) {
  const router = useRouter();
  const { pushToast } = useToast();
  const [value, setValue] = useState("");
  const [isSending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!value.trim()) {
      const errorMessage = "메시지를 입력하세요.";
      setMessage(errorMessage);
      pushToast({ kind: "error", message: errorMessage });
      return;
    }

    setSending(true);
    setMessage("");
    try {
      const response = await fetch(`/api/chats/${threadId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: value.trim() }),
      });
      const result = (await response.json()) as ApiResponse<{ id: string }>;
      if (!result.ok) {
        const errorMessage = result.error?.message ?? "메시지 전송 실패";
        setMessage(errorMessage);
        pushToast({ kind: "error", message: errorMessage });
        return;
      }
      setValue("");
      pushToast({ kind: "success", message: "메시지를 전송했습니다." });
      router.refresh();
    } catch {
      setMessage("요청 처리 중 오류가 발생했습니다.");
      pushToast({ kind: "error", message: "요청 처리 중 오류가 발생했습니다." });
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={submit} className="form-grid" style={{ marginTop: 16 }}>
      <textarea
        className="textarea"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="메시지를 입력하세요."
      />
      <button className="btn btn-primary" type="submit" disabled={isSending}>
        {isSending ? "전송 중..." : "메시지 전송"}
      </button>
      {message ? <div className="note">{message}</div> : null}
    </form>
  );
}
