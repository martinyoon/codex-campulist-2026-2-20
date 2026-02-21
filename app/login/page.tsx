"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { STUDENT_TYPES, USER_ROLES, type StudentType } from "@/src/domain/enums";
import { useToast } from "@/app/components/toastProvider";
import {
  getStudentTypeLabel,
  getUserRoleDisplayLabel,
  getUserRoleLabel,
} from "@/src/ui/labelMap";
import {
  CAMPUS_OPTIONS,
  DEFAULT_CAMPUS_ID,
  getCampusNameById,
} from "@/src/ui/campuses";

interface LoginResult {
  ok: boolean;
  status: number;
  data?: {
    user_id: string;
    role: (typeof USER_ROLES)[number];
    student_type: StudentType | null;
    campus_id: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

export default function LoginPage() {
  const router = useRouter();
  const { pushToast } = useToast();
  const [role, setRole] = useState<(typeof USER_ROLES)[number]>("student");
  const [studentType, setStudentType] = useState<StudentType>("undergrad");
  const [campusId, setCampusId] = useState<string>(DEFAULT_CAMPUS_ID);
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
          student_type: role === "student" ? studentType : undefined,
          campus_id: campusId,
        }),
      });
      const result = (await response.json()) as LoginResult;

      if (!result.ok || !result.data) {
        const errorMessage = result.error?.message ?? "로그인 실패";
        setMessage(errorMessage);
        pushToast({ kind: "error", message: errorMessage });
        return;
      }

      const successMessage = `세션 변경 완료: ${getUserRoleDisplayLabel(
        result.data.role,
        result.data.student_type,
      )} · ${getCampusNameById(result.data.campus_id)}`;
      setMessage(successMessage);
      pushToast({ kind: "success", message: successMessage });
      router.push("/");
      router.refresh();
    } catch {
      setMessage("요청 처리 중 오류가 발생했습니다.");
      pushToast({ kind: "error", message: "요청 처리 중 오류가 발생했습니다." });
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
                {getUserRoleLabel(item)}
              </option>
            ))}
          </select>
        </label>
        {role === "student" ? (
          <label>
            <div className="note">학생 구분</div>
            <select
              className="select"
              value={studentType}
              onChange={(event) => setStudentType(event.target.value as StudentType)}
            >
              {STUDENT_TYPES.map((item) => (
                <option value={item} key={item}>
                  {getStudentTypeLabel(item)}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <label>
          <div className="note">캠퍼스</div>
          <select
            className="select"
            value={campusId}
            onChange={(event) => setCampusId(event.target.value)}
          >
            {CAMPUS_OPTIONS.map((campus) => (
              <option value={campus.id} key={campus.id}>
                {campus.name_ko}
              </option>
            ))}
          </select>
        </label>
        <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "변경 중..." : "세션 변경"}
        </button>
        {message ? <div className="note">{message}</div> : null}
      </form>
    </section>
  );
}
