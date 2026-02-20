import { canModerateReports } from "../../domain/policies";
import type { ReportRepository } from "../../domain/repositories";
import type {
  CreateReportInput,
  Report,
  ReportListQuery,
  ResolveReportInput,
  SessionContext,
} from "../../domain/types";
import type { MockDatabase } from "../database";
import { createId, ensure, nowIso, paginate } from "../utils";

export class InMemoryReportRepository implements ReportRepository {
  constructor(private readonly db: MockDatabase) {}

  async create(input: CreateReportInput, session: SessionContext) {
    ensure(input.target_type === "post", "BAD_REQUEST", "Only post report is supported in prototype.");
    const post = this.db.posts.find(
      (item) => item.id === input.target_id && item.deleted_at === null,
    );
    ensure(!!post, "NOT_FOUND", "Report target post not found.");
    ensure(post.campus_id === session.campus_id, "FORBIDDEN", "Cross-campus report is blocked.");

    const now = nowIso();
    const report: Report = {
      id: createId("report"),
      campus_id: session.campus_id,
      reporter_id: session.user_id,
      target_type: input.target_type,
      target_id: input.target_id,
      reason: input.reason,
      details: input.details.trim(),
      status: "pending",
      reviewed_by: null,
      reviewed_at: null,
      action_note: null,
      created_at: now,
      updated_at: now,
      deleted_at: null,
    };

    this.db.reports.unshift(report);
    return report;
  }

  async listForAdmin(query: ReportListQuery, session: SessionContext) {
    ensure(canModerateReports(session), "FORBIDDEN", "Admin permission required.");

    const campusId = query.campus_id ?? session.campus_id;
    let rows = this.db.reports
      .filter((report) => report.deleted_at === null)
      .filter((report) => report.campus_id === campusId);

    if (query.status) {
      rows = rows.filter((report) => report.status === query.status);
    }

    rows.sort((a, b) => b.created_at.localeCompare(a.created_at));
    return paginate(rows, query.limit, query.offset);
  }

  async resolve(reportId: string, input: ResolveReportInput, session: SessionContext) {
    ensure(canModerateReports(session), "FORBIDDEN", "Admin permission required.");

    const report = this.db.reports.find(
      (item) => item.id === reportId && item.deleted_at === null,
    );
    ensure(!!report, "NOT_FOUND", "Report not found.");

    const now = nowIso();
    report.status = input.status;
    report.action_note = input.action_note.trim();
    report.reviewed_by = session.user_id;
    report.reviewed_at = now;
    report.updated_at = now;

    if (input.hide_target) {
      this.hideTargetPost(report.target_id, now);
    }

    return report;
  }

  private hideTargetPost(postId: string, timestamp: string): void {
    const post = this.db.posts.find(
      (item) => item.id === postId && item.deleted_at === null,
    );
    if (!post) {
      return;
    }
    post.status = "hidden";
    post.updated_at = timestamp;
  }
}
