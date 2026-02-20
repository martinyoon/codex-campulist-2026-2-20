import type {
  Campus,
  ChatMessage,
  ChatThread,
  Post,
  Report,
  User,
} from "../domain/types";

export interface MockDatabase {
  campuses: Campus[];
  users: User[];
  posts: Post[];
  chat_threads: ChatThread[];
  chat_messages: ChatMessage[];
  reports: Report[];
}

export const cloneDatabase = (database: MockDatabase): MockDatabase =>
  JSON.parse(JSON.stringify(database)) as MockDatabase;
