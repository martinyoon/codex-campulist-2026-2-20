import Link from "next/link";
import { REPORT_STATUSES } from "@/src/domain/enums";
import type { ReportStatus } from "@/src/domain/enums";
import { mockApi } from "@/src/server/mockApiSingleton";
import { parsePaginationParams } from "@/src/server/params";
import { ReportActions } from "./reportActions";
import { EmptyState, ErrorState } from "@/app/stateBlocks";
import {
  getReportReasonLabel,
  getReportStatusLabel,
  getUserRoleLabel,
} from "@/src/ui/labelMap";
import { StatusBadge } from "@/app/components/statusBadge";

interface PageProps {
  searchParams: {
    status?: string;
    page?: string;
    limit?: string;
  };
}

export default async function AdminReportsPage({ searchParams }: PageProps) {
  const sessionResult = await mockApi.getSession();
  const role = sessionResult.ok ? sessionResult.data.role : null;
  const roleLabel = role ? getUserRoleLabel(role) : "게스트";

  if (role !== "admin") {
    return (
      <>
        <section className="hero">
          <h1>신고 관리</h1>
          <p>
            관리자 전용 페이지입니다. 현재 역할: <strong>{roleLabel}</strong>
          </p>
        </section>
        <ErrorState
          title="접근 권한이 없습니다."
          description="관리자 역할로 전환한 뒤 다시 시도하세요."
          action_href="/login"
          action_label="역할 전환하기"
        />
      </>
    );
  }

  const status = REPORT_STATUSES.includes(
    searchParams.status as (typeof REPORT_STATUSES)[number],
  )
    ? (searchParams.status as ReportStatus)
    : undefined;
  const pageQuery = new URLSearchParams();
  if (searchParams.status) {
    pageQuery.set("status", searchParams.status);
  }
  if (searchParams.page) {
    pageQuery.set("page", searchParams.page);
  }
  if (searchParams.limit) {
    pageQuery.set("limit", searchParams.limit);
  }
  const { limit, offset, page } = parsePaginationParams(pageQuery, { limit: 20 });

  const reportsResult = await mockApi.listReports({
    status,
    limit,
    offset,
  });
  const reports = reportsResult.ok ? reportsResult.data.items : [];
  const total = reportsResult.ok ? reportsResult.data.total : 0;
  const hasMore = reportsResult.ok ? reportsResult.data.has_more : false;
  const selectedLimit = String(limit);

  return (
    <>
      <section className="hero">
        <h1>신고 관리</h1>
        <p>
          관리자 신고 처리 화면입니다. 현재 역할: <strong>{roleLabel}</strong>
        </p>
      </section>

      {reportsResult.ok ? (
        <>
          <form method="GET" className="toolbar" style={{ marginTop: 16 }}>
            <select
              className="select"
              name="status"
              defaultValue={status ?? ""}
              style={{ maxWidth: 220 }}
            >
              <option value="">전체 상태</option>
              {REPORT_STATUSES.map((item) => (
                <option value={item} key={item}>
                  {getReportStatusLabel(item)}
                </option>
              ))}
            </select>
            <select
              className="select"
              name="limit"
              defaultValue={selectedLimit}
              style={{ maxWidth: 160 }}
            >
              <option value="10">10개씩</option>
              <option value="20">20개씩</option>
              <option value="50">50개씩</option>
            </select>
            <input type="hidden" name="page" value="1" />
            <button className="btn" type="submit">
              필터 적용
            </button>
            <Link className="btn" href="/admin/reports">
              필터 초기화
            </Link>
          </form>

          <section className="grid">
            {reports.map((report) => (
              <article key={report.id} className="post-item">
                <h4>신고 #{report.id.slice(0, 8)}</h4>
                <p className="muted" style={{ marginTop: 6 }}>
                  사유: {getReportReasonLabel(report.reason)} · {report.details}
                </p>
                <div className="post-meta">
                  <StatusBadge kind="report" value={report.status} />
                  <span>대상 게시글 {report.target_id.slice(0, 8)}</span>
                  <span>신고자 {report.reporter_id.slice(0, 8)}</span>
                  <span>{new Date(report.created_at).toLocaleString("ko-KR")}</span>
                  <Link href={`/posts/${report.target_id}`} className="btn">
                    대상 보기
                  </Link>
                </div>
                {report.status === "pending" ? (
                  <ReportActions reportId={report.id} />
                ) : (
                  <div className="note">
                    처리자: {report.reviewed_by ? report.reviewed_by.slice(0, 8) : "-"} ·
                    메모: {report.action_note ?? "-"}
                  </div>
                )}
              </article>
            ))}
            {reports.length === 0 ? (
              <EmptyState
                title="표시할 신고가 없습니다."
                description="신규 신고가 접수되면 이 화면에 표시됩니다."
              />
            ) : null}
          </section>

          <div className="post-meta" style={{ marginTop: 16, justifyContent: "space-between" }}>
            <span>
              총 {total.toLocaleString()}건 · {page}페이지
            </span>
            <div className="row-2" style={{ maxWidth: 280 }}>
              {page > 1 ? (
                <Link
                  className="btn"
                  href={buildReportsPageHref({ status, page: page - 1, limit })}
                >
                  이전
                </Link>
              ) : (
                <button className="btn" type="button" disabled>
                  이전
                </button>
              )}
              {hasMore ? (
                <Link
                  className="btn"
                  href={buildReportsPageHref({ status, page: page + 1, limit })}
                >
                  다음
                </Link>
              ) : (
                <button className="btn" type="button" disabled>
                  다음
                </button>
              )}
            </div>
          </div>
        </>
      ) : (
        <ErrorState
          title="신고 목록을 불러올 수 없습니다."
          description={
            reportsResult.error.message ??
            "관리자 계정으로 역할을 변경한 뒤 다시 시도하세요."
          }
          action_href="/admin/reports"
          action_label="다시 시도"
        />
      )}
    </>
  );
}

const buildReportsPageHref = ({
  status,
  page,
  limit,
}: {
  status?: ReportStatus;
  page: number;
  limit: number;
}): string => {
  const params = new URLSearchParams();

  if (status) {
    params.set("status", status);
  }
  if (page > 1) {
    params.set("page", String(page));
  }
  if (limit !== 20) {
    params.set("limit", String(limit));
  }

  const query = params.toString();
  return query ? `/admin/reports?${query}` : "/admin/reports";
};
