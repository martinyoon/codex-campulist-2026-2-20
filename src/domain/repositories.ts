import type {
  ChatMessage,
  ChatThread,
  CreatePostInput,
  CreateReportInput,
  ListResult,
  MockLoginInput,
  Post,
  PostListQuery,
  Report,
  ReportListQuery,
  ResolveReportInput,
  SendMessageInput,
  SessionContext,
  StartChatInput,
  UpdatePostInput,
  User,
} from "./types";

export interface SessionRepository {
  mockLogin(input: MockLoginInput): Promise<SessionContext>;
  getCurrentSession(): Promise<SessionContext>;
  getCurrentUser(): Promise<User>;
}

export interface PostRepository {
  list(query: PostListQuery, session: SessionContext): Promise<ListResult<Post>>;
  getById(postId: string, session: SessionContext): Promise<Post | null>;
  create(input: CreatePostInput, session: SessionContext): Promise<Post>;
  update(
    postId: string,
    input: UpdatePostInput,
    session: SessionContext,
  ): Promise<Post>;
  softDelete(postId: string, session: SessionContext): Promise<void>;
  promote(
    postId: string,
    promotionUntil: string,
    session: SessionContext,
  ): Promise<Post>;
  incrementViewCount(postId: string, session: SessionContext): Promise<void>;
}

export interface ChatRepository {
  listThreads(session: SessionContext): Promise<ChatThread[]>;
  getThreadById(
    threadId: string,
    session: SessionContext,
  ): Promise<ChatThread | null>;
  startThread(
    input: StartChatInput,
    session: SessionContext,
  ): Promise<ChatThread>;
  listMessages(threadId: string, session: SessionContext): Promise<ChatMessage[]>;
  sendMessage(
    threadId: string,
    input: SendMessageInput,
    session: SessionContext,
  ): Promise<ChatMessage>;
}

export interface ReportRepository {
  create(input: CreateReportInput, session: SessionContext): Promise<Report>;
  listForAdmin(
    query: ReportListQuery,
    session: SessionContext,
  ): Promise<ListResult<Report>>;
  resolve(
    reportId: string,
    input: ResolveReportInput,
    session: SessionContext,
  ): Promise<Report>;
}
