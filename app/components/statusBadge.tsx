import type {
  ChatThreadStatus,
  PostStatus,
  ReportStatus,
} from "@/src/domain/enums";
import {
  getChatThreadStatusLabel,
  getPostStatusLabel,
  getReportStatusLabel,
} from "@/src/ui/labelMap";

type StatusBadgeProps =
  | {
      kind: "post";
      value: PostStatus;
    }
  | {
      kind: "report";
      value: ReportStatus;
    }
  | {
      kind: "chat";
      value: ChatThreadStatus;
    };

export function StatusBadge(props: StatusBadgeProps) {
  const tone = getStatusTone(props.kind, props.value);
  const label = getStatusLabel(props.kind, props.value);

  return <span className={`chip status-badge status-${tone}`}>{label}</span>;
}

const getStatusLabel = (
  kind: StatusBadgeProps["kind"],
  value: string,
): string => {
  if (kind === "post") {
    return getPostStatusLabel(value as PostStatus);
  }
  if (kind === "report") {
    return getReportStatusLabel(value as ReportStatus);
  }
  return getChatThreadStatusLabel(value as ChatThreadStatus);
};

const getStatusTone = (
  kind: StatusBadgeProps["kind"],
  value: string,
): "success" | "warning" | "danger" | "neutral" => {
  if (kind === "post") {
    if (value === "active") {
      return "success";
    }
    if (value === "reserved") {
      return "warning";
    }
    if (value === "hidden") {
      return "danger";
    }
    return "neutral";
  }

  if (kind === "report") {
    if (value === "pending") {
      return "warning";
    }
    if (value === "actioned") {
      return "danger";
    }
    return "neutral";
  }

  if (value === "open") {
    return "success";
  }
  return "neutral";
};
