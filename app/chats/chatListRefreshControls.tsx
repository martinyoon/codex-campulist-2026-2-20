"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

const POLL_INTERVAL_MS = 5000;

export function ChatListRefreshControls() {
  const router = useRouter();
  const [isPolling, setPolling] = useState(true);
  const [lastRefreshedAt, setLastRefreshedAt] = useState(
    () => new Date().toISOString(),
  );
  const [isPending, startTransition] = useTransition();

  const refreshNow = () => {
    startTransition(() => {
      router.refresh();
      setLastRefreshedAt(new Date().toISOString());
    });
  };

  useEffect(() => {
    if (!isPolling) {
      return;
    }
    const timer = setInterval(() => {
      refreshNow();
    }, POLL_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [isPolling]);

  return (
    <section className="card" style={{ marginTop: 16 }}>
      <div className="post-meta" style={{ marginTop: 0, justifyContent: "space-between" }}>
        <span>
          마지막 갱신: {new Date(lastRefreshedAt).toLocaleTimeString("ko-KR")}
        </span>
        <div className="row-2" style={{ maxWidth: 320 }}>
          <button
            className="btn"
            type="button"
            onClick={() => setPolling((current) => !current)}
          >
            {isPolling ? "자동 새로고침 끄기" : "자동 새로고침 켜기"}
          </button>
          <button
            className="btn btn-primary"
            type="button"
            onClick={refreshNow}
            disabled={isPending}
          >
            {isPending ? "새로고침 중..." : "지금 새로고침"}
          </button>
        </div>
      </div>
      <p className="note" style={{ marginTop: 10 }}>
        채팅 목록은 5초 간격으로 자동 갱신됩니다.
      </p>
    </section>
  );
}
