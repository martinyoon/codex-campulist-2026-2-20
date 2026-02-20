"use client";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description: string;
  confirm_label: string;
  cancel_label?: string;
  tone?: "default" | "danger";
  pending?: boolean;
  on_cancel: () => void;
  on_confirm: () => void;
}

export function ConfirmModal({
  open,
  title,
  description,
  confirm_label,
  cancel_label = "취소",
  tone = "default",
  pending = false,
  on_cancel,
  on_confirm,
}: ConfirmModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="confirm-overlay" role="dialog" aria-modal="true" aria-label={title}>
      <div className="confirm-card">
        <h3 className="confirm-title">{title}</h3>
        <p className="confirm-description">{description}</p>
        <div className="confirm-actions">
          <button className="btn" type="button" onClick={on_cancel} disabled={pending}>
            {cancel_label}
          </button>
          <button
            className={tone === "danger" ? "btn btn-danger" : "btn btn-primary"}
            type="button"
            onClick={on_confirm}
            disabled={pending}
          >
            {pending ? "처리 중..." : confirm_label}
          </button>
        </div>
      </div>
    </div>
  );
}
