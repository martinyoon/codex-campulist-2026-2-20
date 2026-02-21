"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  POST_CATEGORIES,
  type PostCategory,
  type StudentType,
  type UserRole,
} from "@/src/domain/enums";
import { getAllowedCategoriesForRole } from "@/src/domain/policies";
import { useToast } from "@/app/components/toastProvider";
import {
  getPostCategoryLabel,
  getUserRoleDisplayLabel,
} from "@/src/ui/labelMap";
import {
  formatAffiliationPrefix,
  formatDisplayTitle,
} from "@/src/ui/postDisplayTitle";

interface CreatePostResponse {
  ok: boolean;
  status: number;
  data?: { id: string };
  error?: {
    code: string;
    message: string;
  };
}

interface SessionResponse {
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

export default function WritePage() {
  const router = useRouter();
  const { pushToast } = useToast();
  const [isSubmitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isPromoted, setIsPromoted] = useState(false);
  const [category, setCategory] = useState<PostCategory>("market");
  const [title, setTitle] = useState("");
  const [showAffiliationPrefix, setShowAffiliationPrefix] = useState(true);
  const [sessionRole, setSessionRole] = useState<UserRole | null>(null);
  const [sessionStudentType, setSessionStudentType] = useState<StudentType | null>(
    null,
  );
  const [sessionCampusId, setSessionCampusId] = useState<string | null>(null);
  const [isSessionChecked, setSessionChecked] = useState(false);
  const [sessionErrorMessage, setSessionErrorMessage] = useState<string | null>(
    null,
  );

  useEffect(() => {
    let mounted = true;

    const fetchSession = async () => {
      try {
        const response = await fetch("/api/session", { cache: "no-store" });
        const result = (await response.json()) as SessionResponse;
        if (!mounted) {
          return;
        }
        if (!result.ok || !result.data) {
          setSessionRole(null);
          setSessionStudentType(null);
          setSessionCampusId(null);
          setSessionErrorMessage(
            result.error?.message ?? "세션을 확인하지 못했습니다.",
          );
          return;
        }
        setSessionRole(result.data.role);
        setSessionStudentType(result.data.student_type);
        setSessionCampusId(result.data.campus_id);
        setSessionErrorMessage(null);
      } catch {
        if (!mounted) {
          return;
        }
        setSessionRole(null);
        setSessionStudentType(null);
        setSessionCampusId(null);
        setSessionErrorMessage("세션 확인 중 오류가 발생했습니다.");
      } finally {
        if (mounted) {
          setSessionChecked(true);
        }
      }
    };

    void fetchSession();

    return () => {
      mounted = false;
    };
  }, []);

  const allowedCategories = useMemo(() => {
    if (!sessionRole) {
      return POST_CATEGORIES;
    }
    return getAllowedCategoriesForRole(sessionRole);
  }, [sessionRole]);

  useEffect(() => {
    if (!sessionRole) {
      return;
    }
    if (allowedCategories.includes(category)) {
      return;
    }
    if (allowedCategories.length > 0) {
      setCategory(allowedCategories[0]);
    }
  }, [sessionRole, category, allowedCategories]);

  const isCategoryAllowed = allowedCategories.includes(category);
  const allowedCategoryText = sessionRole
    ? getAllowedCategoriesForRole(sessionRole)
        .map((item) => getPostCategoryLabel(item))
        .join(", ")
    : "";
  const blockedCategoryMessage =
    sessionRole && !isCategoryAllowed
      ? `현재 역할(${getUserRoleDisplayLabel(
          sessionRole,
          sessionStudentType,
        )})은 ${getPostCategoryLabel(
          category,
        )} 카테고리에 글을 작성할 수 없습니다. 허용 카테고리: ${allowedCategoryText}`
      : "";
  const isSubmitBlocked =
    isSubmitting ||
    !isSessionChecked ||
    (sessionRole !== null && !isCategoryAllowed);
  const affiliationPrefix = showAffiliationPrefix
    ? formatAffiliationPrefix({
        campus_id: sessionCampusId ?? "",
        author_role_snapshot: sessionRole,
        author_student_type_snapshot: sessionStudentType,
      })
    : "";
  const displayTitlePreview = formatDisplayTitle({
    title: title.trim() || "게시글 제목",
    campus_id: sessionCampusId ?? "",
    author_role_snapshot: sessionRole,
    author_student_type_snapshot: sessionStudentType,
    show_affiliation_prefix: showAffiliationPrefix,
  });

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isSessionChecked) {
      return;
    }

    if (sessionRole && !isCategoryAllowed) {
      setMessage(blockedCategoryMessage);
      pushToast({ kind: "error", message: blockedCategoryMessage });
      return;
    }

    setSubmitting(true);
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const priceRaw = String(formData.get("price_krw") ?? "").trim();
    const tagsRaw = String(formData.get("tags") ?? "").trim();
    const promotionUntilRaw = String(formData.get("promotion_until") ?? "").trim();
    const isPromotedChecked = formData.get("is_promoted") === "on";

    let promotionUntil: string | null = null;
    if (isPromotedChecked) {
      if (!promotionUntilRaw) {
        const errorMessage = "상단노출을 선택한 경우 노출 종료 시간을 입력해야 합니다.";
        setMessage(errorMessage);
        pushToast({ kind: "error", message: errorMessage });
        setSubmitting(false);
        return;
      }
      const parsedTime = new Date(promotionUntilRaw).getTime();
      if (Number.isNaN(parsedTime)) {
        const errorMessage = "상단노출 종료 시간 형식이 올바르지 않습니다.";
        setMessage(errorMessage);
        pushToast({ kind: "error", message: errorMessage });
        setSubmitting(false);
        return;
      }
      promotionUntil = new Date(parsedTime).toISOString();
    }

    const payload = {
      category,
      title,
      body: String(formData.get("body")),
      show_affiliation_prefix: showAffiliationPrefix,
      price_krw: priceRaw ? Number(priceRaw) : null,
      location_hint: String(formData.get("location_hint") ?? "").trim() || null,
      tags: tagsRaw
        ? tagsRaw
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : [],
      is_promoted: isPromotedChecked,
      promotion_until: promotionUntil,
    };

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as CreatePostResponse;
      if (!result.ok || !result.data) {
        const errorMessage = result.error?.message ?? "작성 실패";
        setMessage(errorMessage);
        pushToast({ kind: "error", message: errorMessage });
        return;
      }
      pushToast({ kind: "success", message: "게시글을 등록했습니다." });
      router.push(`/posts/${result.data.id}`);
      router.refresh();
    } catch {
      setMessage("요청 처리 중 오류가 발생했습니다.");
      pushToast({ kind: "error", message: "요청 처리 중 오류가 발생했습니다." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <section className="hero">
        <h1>새 게시글 작성</h1>
        <p>
          Supabase 연결 전 단계에서는 Mock API에 저장됩니다. 필드 구조는 이후
          DB 전환을 염두에 두고 고정했습니다.
        </p>
      </section>

      <form onSubmit={onSubmit} className="card form-grid" style={{ marginTop: 16 }}>
        <div className="row-2">
          <label>
            <div className="note">카테고리</div>
            <select
              name="category"
              className="select"
              value={category}
              onChange={(event) =>
                setCategory(event.target.value as PostCategory)
              }
            >
              {POST_CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {getPostCategoryLabel(item)}
                  {sessionRole && !allowedCategories.includes(item)
                    ? " (작성 불가)"
                    : ""}
                </option>
              ))}
            </select>
            {!isSessionChecked ? (
              <div className="note">권한 정책 확인 중...</div>
            ) : null}
            {sessionErrorMessage ? (
              <div className="note">
                권한 확인 실패: {sessionErrorMessage} (서버에서 최종 검증됩니다)
              </div>
            ) : null}
            {blockedCategoryMessage ? (
              <div
                className="chip status-warning status-badge"
                style={{ marginTop: 8 }}
              >
                {blockedCategoryMessage}
              </div>
            ) : null}
            {sessionRole && !blockedCategoryMessage ? (
              <div className="note">
                {getUserRoleDisplayLabel(sessionRole, sessionStudentType)} 허용 카테고리:{" "}
                {allowedCategoryText}
              </div>
            ) : null}
          </label>
          <label>
            <div className="note">가격 (선택)</div>
            <input
              type="number"
              name="price_krw"
              className="input"
              min={0}
              step={1000}
              placeholder="예: 12000"
            />
          </label>
        </div>

        <label>
          <div className="note">제목</div>
          <div className="title-compose">
            {affiliationPrefix ? (
              <span className="title-prefix">{affiliationPrefix}</span>
            ) : null}
            <input
              type="text"
              name="title"
              className="input"
              minLength={2}
              required
              placeholder={
                affiliationPrefix ? "제목 내용을 입력하세요" : "게시글 제목"
              }
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>
          <div className="note" style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
            <input
              type="checkbox"
              checked={showAffiliationPrefix}
              onChange={(event) => setShowAffiliationPrefix(event.target.checked)}
            />
            제목에 소속 자동표시 ([캠퍼스][역할])
          </div>
          <div className="note">표시 제목 미리보기: {displayTitlePreview}</div>
          {!sessionRole || !sessionCampusId ? (
            <div className="note">세션 확인 후 소속 표기가 적용됩니다.</div>
          ) : null}
        </label>

        <label>
          <div className="note">본문</div>
          <textarea
            name="body"
            className="textarea"
            minLength={5}
            required
            placeholder="자세한 내용을 작성하세요."
          />
        </label>

        <div className="row-2">
          <label>
            <div className="note">거래/활동 위치 (선택)</div>
            <input
              type="text"
              name="location_hint"
              className="input"
              placeholder="예: N1 근처, 궁동"
            />
          </label>
          <label>
            <div className="note">태그 (쉼표 구분)</div>
            <input
              type="text"
              name="tags"
              className="input"
              placeholder="예: 교재, 전자기기"
            />
          </label>
        </div>

        <div className="row-2">
          <label>
            <input
              type="checkbox"
              name="is_promoted"
              checked={isPromoted}
              onChange={(event) => setIsPromoted(event.target.checked)}
            />{" "}
            상단노출 옵션 테스트 (결제 제외)
          </label>
          <label>
            <div className="note">상단노출 종료 시각</div>
            <input
              type="datetime-local"
              name="promotion_until"
              className="input"
              disabled={!isPromoted}
              required={isPromoted}
            />
          </label>
        </div>

        <button className="btn btn-primary" type="submit" disabled={isSubmitBlocked}>
          {!isSessionChecked
            ? "권한 확인 중..."
            : isSubmitting
            ? "작성 중..."
            : "게시글 등록"}
        </button>
        {message ? <div className="note">{message}</div> : null}
      </form>
    </>
  );
}
