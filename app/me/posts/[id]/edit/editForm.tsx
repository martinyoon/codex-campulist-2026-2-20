"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  POST_CATEGORIES,
  type PostCategory,
  type PostStatus,
  type UserRole,
} from "@/src/domain/enums";
import { getAllowedCategoriesForRole } from "@/src/domain/policies";
import { useToast } from "@/app/components/toastProvider";
import { ConfirmModal } from "@/app/components/confirmModal";
import {
  getPostCategoryLabel,
  getPostStatusDescription,
  getPostStatusLabel,
  getUserRoleLabel,
} from "@/src/ui/labelMap";

const EDITABLE_POST_STATUSES = ["active", "reserved", "closed"] as const;
type EditablePostStatus = (typeof EDITABLE_POST_STATUSES)[number];

const isEditablePostStatus = (value: PostStatus): value is EditablePostStatus =>
  EDITABLE_POST_STATUSES.includes(value as EditablePostStatus);

interface EditPostResponse {
  ok: boolean;
  status: number;
  data?: {
    id: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

interface EditPostFormProps {
  postId: string;
  role: UserRole;
  initial: {
    category: PostCategory;
    status: PostStatus;
    title: string;
    body: string;
    price_krw: number | null;
    location_hint: string | null;
    tags: string[];
  };
}

export function EditPostForm({ postId, role, initial }: EditPostFormProps) {
  const router = useRouter();
  const { pushToast } = useToast();

  const [isSubmitting, setSubmitting] = useState(false);
  const [isDeleting, setDeleting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState<PostCategory>(initial.category);
  const [status, setStatus] = useState<EditablePostStatus>(
    isEditablePostStatus(initial.status) ? initial.status : "active",
  );
  const [title, setTitle] = useState(initial.title);
  const [body, setBody] = useState(initial.body);
  const [price, setPrice] = useState(
    initial.price_krw !== null ? String(initial.price_krw) : "",
  );
  const [locationHint, setLocationHint] = useState(initial.location_hint ?? "");
  const [tags, setTags] = useState(initial.tags.join(", "));

  const allowedCategories = useMemo(
    () => getAllowedCategoriesForRole(role),
    [role],
  );

  useEffect(() => {
    if (allowedCategories.includes(category)) {
      return;
    }
    if (allowedCategories.length > 0) {
      setCategory(allowedCategories[0]);
    }
  }, [allowedCategories, category]);

  const isCategoryAllowed = allowedCategories.includes(category);
  const isBusy = isSubmitting || isDeleting;
  const allowedCategoryText = allowedCategories
    .map((item) => getPostCategoryLabel(item))
    .join(", ");
  const blockedCategoryMessage = !isCategoryAllowed
    ? `현재 역할(${getUserRoleLabel(
        role,
      )})은 ${getPostCategoryLabel(
        category,
      )} 카테고리를 수정에 사용할 수 없습니다. 허용 카테고리: ${allowedCategoryText}`
    : "";

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isCategoryAllowed) {
      setMessage(blockedCategoryMessage);
      pushToast({ kind: "error", message: blockedCategoryMessage });
      return;
    }

    setSubmitting(true);
    setMessage("");

    const priceRaw = price.trim();
    const tagsRaw = tags.trim();

    const payload = {
      category,
      status,
      title: title.trim(),
      body: body.trim(),
      price_krw: priceRaw ? Number(priceRaw) : null,
      location_hint: locationHint.trim() || null,
      tags: tagsRaw
        ? tagsRaw
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : [],
    };

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as EditPostResponse;
      if (!result.ok) {
        const errorMessage = result.error?.message ?? "수정 실패";
        setMessage(errorMessage);
        pushToast({ kind: "error", message: errorMessage });
        return;
      }
      const successMessage = "게시글을 수정했습니다.";
      setMessage(successMessage);
      pushToast({ kind: "success", message: successMessage });
      router.push(`/posts/${postId}`);
      router.refresh();
    } catch {
      const errorMessage = "요청 처리 중 오류가 발생했습니다.";
      setMessage(errorMessage);
      pushToast({ kind: "error", message: errorMessage });
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async () => {
    setDeleting(true);
    setMessage("");
    try {
      const response = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
      const result = (await response.json()) as EditPostResponse;
      if (!result.ok) {
        const errorMessage = result.error?.message ?? "삭제 실패";
        setMessage(errorMessage);
        pushToast({ kind: "error", message: errorMessage });
        return;
      }
      const successMessage = "게시글을 삭제 처리했습니다.";
      setMessage(successMessage);
      pushToast({ kind: "success", message: successMessage });
      setDeleteModalOpen(false);
      router.push("/me/posts");
      router.refresh();
    } catch {
      const errorMessage = "요청 처리 중 오류가 발생했습니다.";
      setMessage(errorMessage);
      pushToast({ kind: "error", message: errorMessage });
    } finally {
      setDeleting(false);
    }
  };

  return (
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
            disabled={isBusy}
          >
            {POST_CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {getPostCategoryLabel(item)}
                {!allowedCategories.includes(item) ? " (수정 불가)" : ""}
              </option>
            ))}
          </select>
          <div className="note">
            {getUserRoleLabel(role)} 허용 카테고리: {allowedCategoryText}
          </div>
          {blockedCategoryMessage ? (
            <div className="chip status-warning status-badge" style={{ marginTop: 8 }}>
              {blockedCategoryMessage}
            </div>
          ) : null}
        </label>
        <label>
          <div className="note">상태</div>
          <select
            name="status"
            className="select"
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as EditablePostStatus)
            }
            disabled={isBusy}
          >
            {EDITABLE_POST_STATUSES.map((item) => (
              <option key={item} value={item}>
                {getPostStatusLabel(item)}
              </option>
            ))}
          </select>
          <div className="note">현재 선택 의미: {getPostStatusDescription(status)}</div>
          <div className="note">
            상태 전이 정책은 서버에서 최종 검증합니다.
          </div>
        </label>
      </div>

      <label>
        <div className="note">가격 (선택)</div>
        <input
          type="number"
          className="input"
          min={0}
          step={1000}
          placeholder="예: 12000"
          value={price}
          onChange={(event) => setPrice(event.target.value)}
          disabled={isBusy}
        />
      </label>

      <label>
        <div className="note">제목</div>
        <input
          type="text"
          className="input"
          minLength={2}
          required
          placeholder="게시글 제목"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          disabled={isBusy}
        />
      </label>

      <label>
        <div className="note">본문</div>
        <textarea
          className="textarea"
          minLength={5}
          required
          placeholder="자세한 내용을 작성하세요."
          value={body}
          onChange={(event) => setBody(event.target.value)}
          disabled={isBusy}
        />
      </label>

      <div className="row-2">
        <label>
          <div className="note">거래/활동 위치 (선택)</div>
          <input
            type="text"
            className="input"
            placeholder="예: N1 근처, 궁동"
            value={locationHint}
            onChange={(event) => setLocationHint(event.target.value)}
            disabled={isBusy}
          />
        </label>
        <label>
          <div className="note">태그 (쉼표 구분)</div>
          <input
            type="text"
            className="input"
            placeholder="예: 교재, 전자기기"
            value={tags}
            onChange={(event) => setTags(event.target.value)}
            disabled={isBusy}
          />
        </label>
      </div>

      <div className="note">수정 저장 시 내용과 상태가 함께 반영됩니다.</div>
      <div className="note">삭제는 복구되지 않으니 최종 확인 후 진행하세요.</div>
      {message ? <div className="note">{message}</div> : null}

      <section className="edit-actions-sticky" aria-label="내 게시글 수정 액션">
        <div className="edit-actions-title">수정/삭제</div>
        <div className="edit-actions-grid">
          <Link className={`btn${isBusy ? " is-disabled" : ""}`} href="/me/posts">
            취소
          </Link>
          <button
            className="btn btn-danger"
            type="button"
            onClick={() => setDeleteModalOpen(true)}
            disabled={isBusy}
          >
            {isDeleting ? "삭제 중..." : "삭제 처리"}
          </button>
          <button
            className="btn btn-primary"
            type="submit"
            disabled={isBusy || !isCategoryAllowed}
          >
            {isSubmitting ? "저장 중..." : "수정 저장"}
          </button>
        </div>
      </section>

      <ConfirmModal
        open={deleteModalOpen}
        title="게시글을 삭제 처리할까요?"
        description="삭제 처리 후에는 목록에서 노출되지 않습니다."
        confirm_label="삭제 처리"
        tone="danger"
        pending={isDeleting}
        on_cancel={() => setDeleteModalOpen(false)}
        on_confirm={onDelete}
      />
    </form>
  );
}
