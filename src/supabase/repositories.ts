import { AppError } from "@/src/domain/errors";
import type {
  ChatRepository,
  PostRepository,
  ReportRepository,
  SessionRepository,
} from "@/src/domain/repositories";
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
} from "@/src/domain/types";

export interface SupabaseRepositoryOptions {
  url: string;
  anonKey: string;
  serviceRoleKey?: string;
  schema?: string;
}

const notConfigured = (): never => {
  throw new AppError(
    "BAD_REQUEST",
    "Supabase repository is not connected yet. Replace mock composition with Supabase wiring.",
  );
};

export class SupabaseSessionRepository implements SessionRepository {
  constructor(private readonly _options: SupabaseRepositoryOptions) {}

  async mockLogin(_input: MockLoginInput): Promise<SessionContext> {
    return notConfigured();
  }

  async getCurrentSession(): Promise<SessionContext> {
    return notConfigured();
  }

  async getCurrentUser(): Promise<User> {
    return notConfigured();
  }
}

export class SupabasePostRepository implements PostRepository {
  constructor(private readonly _options: SupabaseRepositoryOptions) {}

  async list(
    _query: PostListQuery,
    _session: SessionContext,
  ): Promise<ListResult<Post>> {
    return notConfigured();
  }

  async getById(
    _postId: string,
    _session: SessionContext,
  ): Promise<Post | null> {
    return notConfigured();
  }

  async create(
    _input: CreatePostInput,
    _session: SessionContext,
  ): Promise<Post> {
    return notConfigured();
  }

  async update(
    _postId: string,
    _input: UpdatePostInput,
    _session: SessionContext,
  ): Promise<Post> {
    return notConfigured();
  }

  async softDelete(_postId: string, _session: SessionContext): Promise<void> {
    return notConfigured();
  }

  async promote(
    _postId: string,
    _promotionUntil: string,
    _session: SessionContext,
  ): Promise<Post> {
    return notConfigured();
  }

  async incrementViewCount(
    _postId: string,
    _session: SessionContext,
  ): Promise<void> {
    return notConfigured();
  }
}

export class SupabaseChatRepository implements ChatRepository {
  constructor(private readonly _options: SupabaseRepositoryOptions) {}

  async listThreads(_session: SessionContext): Promise<ChatThread[]> {
    return notConfigured();
  }

  async getThreadById(
    _threadId: string,
    _session: SessionContext,
  ): Promise<ChatThread | null> {
    return notConfigured();
  }

  async startThread(
    _input: StartChatInput,
    _session: SessionContext,
  ): Promise<ChatThread> {
    return notConfigured();
  }

  async listMessages(
    _threadId: string,
    _session: SessionContext,
  ): Promise<ChatMessage[]> {
    return notConfigured();
  }

  async sendMessage(
    _threadId: string,
    _input: SendMessageInput,
    _session: SessionContext,
  ): Promise<ChatMessage> {
    return notConfigured();
  }
}

export class SupabaseReportRepository implements ReportRepository {
  constructor(private readonly _options: SupabaseRepositoryOptions) {}

  async create(
    _input: CreateReportInput,
    _session: SessionContext,
  ): Promise<Report> {
    return notConfigured();
  }

  async listForAdmin(
    _query: ReportListQuery,
    _session: SessionContext,
  ): Promise<ListResult<Report>> {
    return notConfigured();
  }

  async resolve(
    _reportId: string,
    _input: ResolveReportInput,
    _session: SessionContext,
  ): Promise<Report> {
    return notConfigured();
  }
}

export interface SupabaseRepositories {
  sessions: SessionRepository;
  posts: PostRepository;
  chats: ChatRepository;
  reports: ReportRepository;
}

export const createSupabaseRepositories = (
  options: SupabaseRepositoryOptions,
): SupabaseRepositories => ({
  sessions: new SupabaseSessionRepository(options),
  posts: new SupabasePostRepository(options),
  chats: new SupabaseChatRepository(options),
  reports: new SupabaseReportRepository(options),
});
