"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { POST_CATEGORIES } from "@/src/domain/enums";

interface CreatePostResponse {
  ok: boolean;
  status: number;
  data?: { id: string };
  error?: {
    code: string;
    message: string;
  };
}

export default function WritePage() {
  const router = useRouter();
  const [isSubmitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isPromoted, setIsPromoted] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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
        setMessage("상단노출을 선택한 경우 노출 종료 시간을 입력해야 합니다.");
        setSubmitting(false);
        return;
      }
      const parsedTime = new Date(promotionUntilRaw).getTime();
      if (Number.isNaN(parsedTime)) {
        setMessage("상단노출 종료 시간 형식이 올바르지 않습니다.");
        setSubmitting(false);
        return;
      }
      promotionUntil = new Date(parsedTime).toISOString();
    }

    const payload = {
      category: String(formData.get("category")),
      title: String(formData.get("title")),
      body: String(formData.get("body")),
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
        setMessage(result.error?.message ?? "작성 실패");
        return;
      }
      router.push(`/posts/${result.data.id}`);
      router.refresh();
    } catch {
      setMessage("요청 처리 중 오류가 발생했습니다.");
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
            <select name="category" className="select" defaultValue="market">
              {POST_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
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
          <input
            type="text"
            name="title"
            className="input"
            minLength={2}
            required
            placeholder="게시글 제목"
          />
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

        <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "작성 중..." : "게시글 등록"}
        </button>
        {message ? <div className="note">{message}</div> : null}
      </form>
    </>
  );
}
