import { AppError } from "../../domain/errors";
import { canReadPost } from "../../domain/policies";
import type { ChatRepository } from "../../domain/repositories";
import type {
  ChatMessage,
  ChatThread,
  SendMessageInput,
  SessionContext,
  StartChatInput,
} from "../../domain/types";
import type { MockDatabase } from "../database";
import { createId, ensure, nowIso } from "../utils";

export class InMemoryChatRepository implements ChatRepository {
  constructor(private readonly db: MockDatabase) {}

  async listThreads(session: SessionContext) {
    return this.db.chat_threads
      .filter((thread) => thread.deleted_at === null)
      .filter((thread) => thread.campus_id === session.campus_id)
      .filter((thread) => thread.participant_ids.includes(session.user_id))
      .sort((a, b) => {
        const aTime = a.last_message_at ?? a.created_at;
        const bTime = b.last_message_at ?? b.created_at;
        return bTime.localeCompare(aTime);
      });
  }

  async getThreadById(threadId: string, session: SessionContext) {
    const thread = this.db.chat_threads.find(
      (item) => item.id === threadId && item.deleted_at === null,
    );
    if (!thread) {
      return null;
    }
    if (thread.campus_id !== session.campus_id) {
      return null;
    }
    if (!thread.participant_ids.includes(session.user_id)) {
      return null;
    }
    return thread;
  }

  async startThread(input: StartChatInput, session: SessionContext) {
    const post = this.db.posts.find(
      (item) => item.id === input.post_id && item.deleted_at === null,
    );
    ensure(!!post, "NOT_FOUND", "Post not found.");
    ensure(
      canReadPost(session, post),
      "FORBIDDEN",
      "Cannot start chat for inaccessible post.",
    );
    ensure(post.campus_id === session.campus_id, "FORBIDDEN", "Cross-campus chat is blocked.");
    ensure(post.author_id !== session.user_id, "BAD_REQUEST", "Cannot chat on your own post.");

    const sorted = [post.author_id, session.user_id].sort();
    const existing = this.db.chat_threads.find(
      (thread) =>
        thread.deleted_at === null &&
        thread.post_id === post.id &&
        thread.participant_ids.length === 2 &&
        thread.participant_ids.slice().sort().join(",") === sorted.join(","),
    );

    if (existing) {
      return existing;
    }

    const now = nowIso();
    const thread: ChatThread = {
      id: createId(),
      campus_id: post.campus_id,
      post_id: post.id,
      participant_ids: [post.author_id, session.user_id],
      status: "open",
      last_message_at: null,
      created_at: now,
      updated_at: now,
      deleted_at: null,
    };

    this.db.chat_threads.unshift(thread);
    return thread;
  }

  async listMessages(threadId: string, session: SessionContext) {
    const thread = await this.getThreadById(threadId, session);
    ensure(!!thread, "NOT_FOUND", "Chat thread not found.");

    return this.db.chat_messages
      .filter((message) => message.deleted_at === null)
      .filter((message) => message.thread_id === threadId)
      .sort((a, b) => a.created_at.localeCompare(b.created_at));
  }

  async sendMessage(
    threadId: string,
    input: SendMessageInput,
    session: SessionContext,
  ) {
    const thread = await this.getThreadById(threadId, session);
    ensure(!!thread, "NOT_FOUND", "Chat thread not found.");
    ensure(thread.status === "open", "BAD_REQUEST", "Closed chat thread.");

    const body = input.body.trim();
    ensure(body.length > 0, "BAD_REQUEST", "Message cannot be empty.");

    const now = nowIso();
    const message: ChatMessage = {
      id: createId(),
      campus_id: thread.campus_id,
      thread_id: thread.id,
      sender_id: session.user_id,
      body,
      is_read: false,
      created_at: now,
      updated_at: now,
      deleted_at: null,
    };

    this.db.chat_messages.push(message);
    thread.last_message_at = now;
    thread.updated_at = now;

    return message;
  }
}
