"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { StudentType, UserRole } from "@/src/domain/enums";
import { CAMPUS_OPTIONS, getCampusNameById } from "@/src/ui/campuses";
import { useToast } from "@/app/components/toastProvider";

interface MockLoginResult {
  ok: boolean;
  status: number;
  data?: {
    user_id: string;
    role: UserRole;
    student_type: StudentType | null;
    campus_id: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

interface CampusQuickSwitchProps {
  sessionRole: UserRole | null;
  sessionStudentType: StudentType | null;
  campusId: string | null;
}

export function CampusQuickSwitch({
  sessionRole,
  sessionStudentType,
  campusId,
}: CampusQuickSwitchProps) {
  const router = useRouter();
  const { pushToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [selectedCampusId, setSelectedCampusId] = useState<string>(
    campusId ?? CAMPUS_OPTIONS[0].id,
  );

  useEffect(() => {
    if (campusId) {
      setSelectedCampusId(campusId);
    }
  }, [campusId]);

  if (!sessionRole || !campusId) {
    return null;
  }

  const changeCampus = async (nextCampusId: string) => {
    if (nextCampusId === campusId) {
      return;
    }

    setSelectedCampusId(nextCampusId);
    try {
      const response = await fetch("/api/session/mock-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: sessionRole,
          student_type:
            sessionRole === "student" ? sessionStudentType ?? "undergrad" : undefined,
          campus_id: nextCampusId,
        }),
      });
      const result = (await response.json()) as MockLoginResult;
      if (!result.ok || !result.data) {
        const errorMessage = result.error?.message ?? "캠퍼스 전환에 실패했습니다.";
        pushToast({ kind: "error", message: errorMessage });
        setSelectedCampusId(campusId);
        return;
      }

      pushToast({
        kind: "success",
        message: `캠퍼스 변경: ${getCampusNameById(result.data.campus_id)}`,
      });
      startTransition(() => {
        router.refresh();
      });
    } catch {
      pushToast({ kind: "error", message: "요청 처리 중 오류가 발생했습니다." });
      setSelectedCampusId(campusId);
    }
  };

  return (
    <label className="campus-switch" aria-label="캠퍼스 빠른 전환">
      <span className="campus-switch-label">캠퍼스</span>
      <select
        className="select campus-switch-select"
        value={selectedCampusId}
        onChange={(event) => void changeCampus(event.target.value)}
        disabled={isPending}
      >
        {CAMPUS_OPTIONS.map((campus) => (
          <option value={campus.id} key={campus.id}>
            {campus.name_ko}
          </option>
        ))}
      </select>
    </label>
  );
}
