import Link from "next/link";
import { REPORT_STATUSES } from "@/src/domain/enums";
import type { ReportStatus } from "@/src/domain/enums";
import { mockApi } from "@/src/server/mockApiSingleton";
import { parsePaginationParams } from "@/src/server/params";
import { ReportActions } from "./reportActions";

interface PageProps {
  searchParams: {
    status?: string;
    page?: string;
    limit?: string;
  };
}

export default async function AdminReportsPage({ searchParams }: PageProps) {
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

  const [sessionResult, reportsResult] = await Promise.all([
    mockApi.getSession(),
    mockApi.listReports({
      status,
      limit,
      offset,
    }),
  ]);

  const role = sessionResult.ok ? sessionResult.data.role : "guest";
  const reports = reportsResult.ok ? reportsResult.data.items : [];
  const total = reportsResult.ok ? reportsResult.data.total : 0;
  const hasMore = reportsResult.ok ? reportsResult.data.has_more : false;
  const selectedLimit = String(limit);

  return (
    <>
      <section className="hero">
        <h1>신고 관리</h1>
        <p>
          관리자 신고 처리 화면입니다. 현재 역할: <strong>{role}</strong>
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
                  {item}
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
                  사유: {report.reason} · {report.details}
                </p>
                <div className="post-meta">
                  <span className="chip">{report.status}</span>
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
              <article className="post-item">
                <p className="muted">표시할 신고가 없습니다.</p>
              </article>
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
        <section className="card" style={{ marginTop: 16 }}>
          <p className="muted">
            신고 목록을 불러올 수 없습니다. 관리자 계정으로 역할을 변경한 뒤 다시 시도하세요.
          </p>
          <div style={{ marginTop: 10 }}>
            <Link href="/login" className="btn btn-primary">
              역할 전환하기
            </Link>
          </div>
        </section>
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
