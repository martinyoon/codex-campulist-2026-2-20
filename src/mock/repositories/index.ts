import type {
  ChatRepository,
  PostRepository,
  ReportRepository,
  SessionRepository,
} from "../../domain/repositories";
import type { MockDatabase } from "../database";
import { createSeedDatabase } from "../seed";
import { InMemoryChatRepository } from "./chatRepository";
import { InMemoryPostRepository } from "./postRepository";
import { InMemoryReportRepository } from "./reportRepository";
import { InMemorySessionRepository } from "./sessionRepository";

export interface MockRepositories {
  sessions: SessionRepository;
  posts: PostRepository;
  chats: ChatRepository;
  reports: ReportRepository;
}

export interface MockContext {
  db: MockDatabase;
  repositories: MockRepositories;
}

export const createMockContext = (db?: MockDatabase): MockContext => {
  const database = db ?? createSeedDatabase();
  const repositories: MockRepositories = {
    sessions: new InMemorySessionRepository(database),
    posts: new InMemoryPostRepository(database),
    chats: new InMemoryChatRepository(database),
    reports: new InMemoryReportRepository(database),
  };

  return {
    db: database,
    repositories,
  };
};
