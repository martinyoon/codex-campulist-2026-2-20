import { AppError } from "../../domain/errors";
import {
  canCreateInCategory,
  canMutatePost,
  canReadPost,
  isAdmin,
} from "../../domain/policies";
import type { PostRepository } from "../../domain/repositories";
import type { PostStatus } from "../../domain/enums";
import type {
  CreatePostInput,
  Post,
  PostListQuery,
  SessionContext,
  UpdatePostInput,
} from "../../domain/types";
import type { MockDatabase } from "../database";
import { createId, ensure, normalizeText, nowIso, paginate } from "../utils";

export class InMemoryPostRepository implements PostRepository {
  constructor(private readonly db: MockDatabase) {}

  async list(query: PostListQuery, session: SessionContext) {
    const now = nowIso();
    const isAdminUser = isAdmin(session);
    const includeHidden = query.include_hidden === true && isAdminUser;
    const targetCampusId =
      isAdminUser && query.campus_id ? query.campus_id : session.campus_id;

    let rows = this.db.posts.filter((post) => post.deleted_at === null);
    rows = rows.filter((post) => post.campus_id === targetCampusId);
    if (isAdminUser) {
      if (!includeHidden) {
        rows = rows.filter((post) => post.status !== "hidden");
      }
    } else {
      rows = rows.filter((post) => canReadPost(session, post));
    }

    if (query.category) {
      rows = rows.filter((post) => post.category === query.category);
    }

    if (query.status) {
      rows = rows.filter((post) => post.status === query.status);
    }

    if (query.promoted_only) {
      rows = rows.filter(
        (post) => post.is_promoted && !!post.promotion_until && post.promotion_until > now,
      );
    }

    if (query.search && query.search.trim().length > 0) {
      const keyword = normalizeText(query.search);
      rows = rows.filter((post) => {
        const haystack = [post.title, post.body, ...post.tags]
          .join(" ")
          .toLowerCase();
        return haystack.includes(keyword);
      });
    }

    const sort = query.sort ?? "newest";
    rows.sort((a, b) => comparePosts(a, b, sort));

    return paginate(rows, query.limit, query.offset);
  }

  async getById(postId: string, session: SessionContext) {
    const post = this.db.posts.find((item) => item.id === postId && item.deleted_at === null);
    if (!post) {
      return null;
    }

    if (!canReadPost(session, post)) {
      return null;
    }

    return post;
  }

  async create(input: CreatePostInput, session: SessionContext) {
    ensure(canCreateInCategory(session, input.category), "FORBIDDEN", "Category is not allowed for this role.");

    const now = nowIso();
    const isPromoted = input.is_promoted ?? false;

    let promotionUntil: string | null = null;
    if (isPromoted) {
      ensure(
        typeof input.promotion_until === "string" && input.promotion_until.length > 0,
        "BAD_REQUEST",
        "promotion_until is required when is_promoted is true.",
      );
      const promotionTime = new Date(input.promotion_until).getTime();
      ensure(
        !Number.isNaN(promotionTime),
        "BAD_REQUEST",
        "promotion_until must be a valid ISO datetime.",
      );
      ensure(
        promotionTime > Date.now(),
        "BAD_REQUEST",
        "promotion_until must be a future datetime.",
      );
      promotionUntil = new Date(promotionTime).toISOString();
    }

    const post: Post = {
      id: createId(),
      campus_id: isAdmin(session) ? input.campus_id ?? session.campus_id : session.campus_id,
      category: input.category,
      author_id: session.user_id,
      author_role_snapshot: session.role,
      show_affiliation_prefix: input.show_affiliation_prefix ?? true,
      title: input.title.trim(),
      body: input.body.trim(),
      price_krw: input.price_krw ?? null,
      tags: input.tags?.map((tag) => tag.trim()).filter(Boolean) ?? [],
      location_hint: input.location_hint?.trim() ?? null,
      status: "active",
      is_promoted: isPromoted,
      promotion_until: promotionUntil,
      view_count: 0,
      created_at: now,
      updated_at: now,
      deleted_at: null,
    };

    ensure(post.title.length >= 2, "BAD_REQUEST", "Title must be at least 2 characters.");
    ensure(post.body.length >= 5, "BAD_REQUEST", "Body must be at least 5 characters.");
    ensure(post.price_krw === null || post.price_krw >= 0, "BAD_REQUEST", "Price must be zero or positive.");

    this.db.posts.unshift(post);
    return post;
  }

  async update(postId: string, input: UpdatePostInput, session: SessionContext) {
    const post = this.getMutablePost(postId);
    ensure(canMutatePost(session, post), "FORBIDDEN", "You cannot edit this post.");
    ensure(
      post.status !== "hidden" || isAdmin(session),
      "FORBIDDEN",
      "Hidden posts can only be edited by admin.",
    );

    if (input.category && input.category !== post.category) {
      ensure(canCreateInCategory(session, input.category), "FORBIDDEN", "Role cannot move this post to selected category.");
      post.category = input.category;
    }

    if (typeof input.title === "string") {
      const title = input.title.trim();
      ensure(title.length >= 2, "BAD_REQUEST", "Title must be at least 2 characters.");
      post.title = title;
    }

    if (typeof input.body === "string") {
      const body = input.body.trim();
      ensure(body.length >= 5, "BAD_REQUEST", "Body must be at least 5 characters.");
      post.body = body;
    }

    if (input.price_krw !== undefined) {
      ensure(
        input.price_krw === null || input.price_krw >= 0,
        "BAD_REQUEST",
        "Price must be zero or positive.",
      );
      post.price_krw = input.price_krw;
    }

    if (input.tags) {
      post.tags = input.tags.map((tag) => tag.trim()).filter(Boolean);
    }

    if (input.location_hint !== undefined) {
      post.location_hint = input.location_hint?.trim() ?? null;
    }

    if (input.status) {
      ensure(
        canTransitionPostStatus(post.status, input.status, isAdmin(session)),
        "CONFLICT",
        `Invalid post status transition: ${post.status} -> ${input.status}.`,
      );
      post.status = input.status;
    }

    post.updated_at = nowIso();
    return post;
  }

  async softDelete(postId: string, session: SessionContext) {
    const post = this.getMutablePost(postId);
    ensure(canMutatePost(session, post), "FORBIDDEN", "You cannot delete this post.");
    const now = nowIso();
    post.deleted_at = now;
    post.updated_at = now;
  }

  async promote(postId: string, promotionUntil: string, session: SessionContext) {
    const post = this.getMutablePost(postId);
    ensure(canMutatePost(session, post), "FORBIDDEN", "You cannot promote this post.");
    ensure(post.status !== "hidden", "BAD_REQUEST", "Hidden posts cannot be promoted.");
    ensure(post.deleted_at === null, "BAD_REQUEST", "Deleted posts cannot be promoted.");

    const promotionTime = new Date(promotionUntil).getTime();
    ensure(
      !Number.isNaN(promotionTime),
      "BAD_REQUEST",
      "promotion_until must be a valid ISO datetime.",
    );
    ensure(
      promotionTime > Date.now(),
      "BAD_REQUEST",
      "promotion_until must be a future datetime.",
    );

    post.is_promoted = true;
    post.promotion_until = new Date(promotionTime).toISOString();
    post.updated_at = nowIso();
    return post;
  }

  async incrementViewCount(postId: string, session: SessionContext) {
    const post = this.db.posts.find((item) => item.id === postId && item.deleted_at === null);
    if (!post) {
      return;
    }
    if (!canReadPost(session, post)) {
      return;
    }
    post.view_count += 1;
    post.updated_at = nowIso();
  }

  private getMutablePost(postId: string): Post {
    const post = this.db.posts.find((item) => item.id === postId);
    if (!post || post.deleted_at !== null) {
      throw new AppError("NOT_FOUND", "Post not found.");
    }
    return post;
  }
}

const comparePosts = (
  a: Post,
  b: Post,
  sort: NonNullable<PostListQuery["sort"]>,
): number => {
  if (sort === "newest") {
    return b.created_at.localeCompare(a.created_at);
  }
  if (sort === "oldest") {
    return a.created_at.localeCompare(b.created_at);
  }
  if (sort === "price_asc") {
    return numericPrice(a) - numericPrice(b);
  }
  if (sort === "price_desc") {
    return numericPrice(b) - numericPrice(a);
  }
  if (sort === "popular") {
    return b.view_count - a.view_count;
  }
  return 0;
};

const numericPrice = (post: Post): number =>
  post.price_krw === null ? Number.MAX_SAFE_INTEGER : post.price_krw;

const STATUS_TRANSITIONS: Record<PostStatus, readonly PostStatus[]> = {
  draft: ["active"],
  active: ["reserved", "closed"],
  reserved: ["active", "closed"],
  closed: ["active"],
  hidden: [],
};

const canTransitionPostStatus = (
  from: PostStatus,
  to: PostStatus,
  isAdminUser: boolean,
): boolean => {
  if (from === to) {
    return true;
  }

  if (isAdminUser) {
    return true;
  }

  return STATUS_TRANSITIONS[from].includes(to);
};
