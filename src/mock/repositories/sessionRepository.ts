import { AppError } from "../../domain/errors";
import type { SessionRepository } from "../../domain/repositories";
import type { MockLoginInput, SessionContext, User } from "../../domain/types";
import type { MockDatabase } from "../database";

export class InMemorySessionRepository implements SessionRepository {
  private currentSession: SessionContext;

  constructor(private readonly db: MockDatabase) {
    const defaultUser = db.users.find((user) => user.role === "student");
    if (!defaultUser) {
      throw new AppError("NOT_FOUND", "Seed user for default session is missing.");
    }
    this.currentSession = {
      user_id: defaultUser.id,
      role: defaultUser.role,
      campus_id: defaultUser.campus_id,
    };
  }

  async mockLogin(input: MockLoginInput): Promise<SessionContext> {
    const nextUser = this.pickUser(input);
    if (!nextUser) {
      throw new AppError("NOT_FOUND", "No user matched the mock login request.");
    }

    this.currentSession = {
      user_id: nextUser.id,
      role: nextUser.role,
      campus_id: nextUser.campus_id,
    };

    return this.currentSession;
  }

  async getCurrentSession(): Promise<SessionContext> {
    return this.currentSession;
  }

  async getCurrentUser(): Promise<User> {
    const user = this.db.users.find(
      (item) => item.id === this.currentSession.user_id && item.deleted_at === null,
    );
    if (!user) {
      throw new AppError("NOT_FOUND", "Current user not found.");
    }
    return user;
  }

  private pickUser(input: MockLoginInput): User | undefined {
    if (input.user_id) {
      return this.db.users.find((user) => user.id === input.user_id);
    }

    const targetCampusId = input.campus_id ?? this.currentSession.campus_id;
    return this.db.users.find(
      (user) =>
        user.role === input.role &&
        user.campus_id === targetCampusId &&
        user.deleted_at === null,
    );
  }
}
