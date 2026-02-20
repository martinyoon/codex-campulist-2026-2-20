"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

const POLL_INTERVAL_MS = 5000;

export function ChatRefreshControls() {
  const router = useRouter();
  const [isPolling, setPolling] = useState(true);
  const [isPageVisible, setPageVisible] = useState(true);
  const [lastRefreshedAt, setLastRefreshedAt] = useState(
    () => new Date().toISOString(),
  );
  const [isPending, startTransition] = useTransition();

  const refreshNow = useCallback(() => {
    startTransition(() => {
      router.refresh();
      setLastRefreshedAt(new Date().toISOString());
    });
  }, [router]);

  useEffect(() => {
    const onVisibilityChange = () => {
      const visible = document.visibilityState === "visible";
      setPageVisible(visible);
      if (visible) {
        refreshNow();
      }
    };

    onVisibilityChange();
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [refreshNow]);

  useEffect(() => {
    if (!isPolling || !isPageVisible) {
      return;
    }
    const timer = setInterval(() => {
      refreshNow();
    }, POLL_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [isPolling, isPageVisible, refreshNow]);

  return (
    <section className="card" style={{ marginTop: 16 }}>
      <div className="post-meta" style={{ justifyContent: "space-between", marginTop: 0 }}>
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
        자동 새로고침은 5초 간격으로 동작합니다. 탭이 비활성화되면 자동 갱신이
        일시 정지됩니다.
      </p>
    </section>
  );
}
