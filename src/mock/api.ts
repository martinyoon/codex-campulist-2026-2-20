import { AppError } from "../domain/errors";
import type {
  CreatePostInput,
  CreateReportInput,
  MockLoginInput,
  PostListQuery,
  ReportListQuery,
  ResolveReportInput,
  SendMessageInput,
  StartChatInput,
  UpdatePostInput,
} from "../domain/types";
import { createMockContext, type MockContext } from "./repositories";

interface ApiErrorPayload {
  status: number;
  code: string;
  message: string;
}

export type ApiResult<T> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; error: ApiErrorPayload };

export class MockApi {
  constructor(private readonly context: MockContext) {}

  async login(input: MockLoginInput) {
    return this.run(() => this.context.repositories.sessions.mockLogin(input), 200);
  }

  async getSession() {
    return this.run(() => this.context.repositories.sessions.getCurrentSession(), 200);
  }

  async getCurrentUser() {
    return this.run(() => this.context.repositories.sessions.getCurrentUser(), 200);
  }

  async listPosts(query: PostListQuery) {
    return this.run(async () => {
      const session = await this.context.repositories.sessions.getCurrentSession();
      return this.context.repositories.posts.list(query, session);
    }, 200);
  }

  async getPost(postId: string) {
    return this.run(async () => {
      const session = await this.context.repositories.sessions.getCurrentSession();
      const post = await this.context.repositories.posts.getById(postId, session);
      if (!post) {
        throw new AppError("NOT_FOUND", "Post not found.");
      }
      await this.context.repositories.posts.incrementViewCount(postId, session);
      return post;
    }, 200);
  }

  async createPost(input: CreatePostInput) {
    return this.run(async () => {
      const session = await this.context.repositories.sessions.getCurrentSession();
      return this.context.repositories.posts.create(input, session);
    }, 201);
  }

  async updatePost(postId: string, input: UpdatePostInput) {
    return this.run(async () => {
      const session = await this.context.repositories.sessions.getCurrentSession();
      return this.context.repositories.posts.update(postId, input, session);
    }, 200);
  }

  async deletePost(postId: string) {
    return this.run(async () => {
      const session = await this.context.repositories.sessions.getCurrentSession();
      await this.context.repositories.posts.softDelete(postId, session);
      return { deleted: true };
    }, 200);
  }

  async promotePost(postId: string, promotionUntil: string) {
    return this.run(async () => {
      const session = await this.context.repositories.sessions.getCurrentSession();
      return this.context.repositories.posts.promote(postId, promotionUntil, session);
    }, 200);
  }

  async startChat(input: StartChatInput) {
    return this.run(async () => {
      const session = await this.context.repositories.sessions.getCurrentSession();
      return this.context.repositories.chats.startThread(input, session);
    }, 201);
  }

  async listMyChats() {
    return this.run(async () => {
      const session = await this.context.repositories.sessions.getCurrentSession();
      return this.context.repositories.chats.listThreads(session);
    }, 200);
  }

  async listMessages(threadId: string) {
    return this.run(async () => {
      const session = await this.context.repositories.sessions.getCurrentSession();
      return this.context.repositories.chats.listMessages(threadId, session);
    }, 200);
  }

  async sendMessage(threadId: string, input: SendMessageInput) {
    return this.run(async () => {
      const session = await this.context.repositories.sessions.getCurrentSession();
      return this.context.repositories.chats.sendMessage(threadId, input, session);
    }, 201);
  }

  async createReport(input: CreateReportInput) {
    return this.run(async () => {
      const session = await this.context.repositories.sessions.getCurrentSession();
      return this.context.repositories.reports.create(input, session);
    }, 201);
  }

  async listReports(query: ReportListQuery) {
    return this.run(async () => {
      const session = await this.context.repositories.sessions.getCurrentSession();
      return this.context.repositories.reports.listForAdmin(query, session);
    }, 200);
  }

  async resolveReport(reportId: string, input: ResolveReportInput) {
    return this.run(async () => {
      const session = await this.context.repositories.sessions.getCurrentSession();
      return this.context.repositories.reports.resolve(reportId, input, session);
    }, 200);
  }

  private async run<T>(
    action: () => Promise<T>,
    successStatus: number,
  ): Promise<ApiResult<T>> {
    try {
      const data = await action();
      return { ok: true, status: successStatus, data };
    } catch (error) {
      if (error instanceof AppError) {
        return {
          ok: false,
          status: error.status,
          error: {
            status: error.status,
            code: error.code,
            message: error.message,
          },
        };
      }

      return {
        ok: false,
        status: 500,
        error: {
          status: 500,
          code: "INTERNAL_ERROR",
          message: "Unexpected mock API error.",
        },
      };
    }
  }
}

export const createMockApi = (): MockApi => new MockApi(createMockContext());
