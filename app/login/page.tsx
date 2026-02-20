"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { USER_ROLES } from "@/src/domain/enums";

interface LoginResult {
  ok: boolean;
  status: number;
  data?: {
    user_id: string;
    role: string;
    campus_id: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<(typeof USER_ROLES)[number]>("student");
  const [isSubmitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string>("");

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      const response = await fetch("/api/session/mock-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          campus_id: "campus_kaist_main",
        }),
      });
      const result = (await response.json()) as LoginResult;

      if (!result.ok || !result.data) {
        setMessage(result.error?.message ?? "로그인 실패");
        return;
      }

      setMessage(`세션 변경 완료: ${result.data.role}`);
      router.push("/");
      router.refresh();
    } catch {
      setMessage("요청 처리 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="hero">
      <h1>역할 전환 (목업 로그인)</h1>
      <p>
        시제품에서는 인증 대신 역할을 전환해 권한/UI를 테스트합니다.
      </p>
      <form onSubmit={handleLogin} className="form-grid" style={{ marginTop: 14 }}>
        <label>
          <div className="note">역할</div>
          <select
            className="select"
            value={role}
            onChange={(event) =>
              setRole(event.target.value as (typeof USER_ROLES)[number])
            }
          >
            {USER_ROLES.map((item) => (
              <option value={item} key={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <div className="note">캠퍼스: KAIST 대전 본원 고정</div>
        <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "변경 중..." : "세션 변경"}
        </button>
        {message ? <div className="note">{message}</div> : null}
      </form>
    </section>
  );
}
