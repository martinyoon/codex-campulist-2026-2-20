import { AppError } from "../../domain/errors";
import {
  canCreateInCategory,
  canMutatePost,
  canReadPost,
  isAdmin,
} from "../../domain/policies";
import type { PostRepository } from "../../domain/repositories";
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
    const includeHidden = query.include_hidden === true && isAdmin(session);
    const targetCampusId =
      isAdmin(session) && query.campus_id ? query.campus_id : session.campus_id;

    let rows = this.db.posts.filter((post) => post.deleted_at === null);
    rows = rows.filter((post) => post.campus_id === targetCampusId);

    if (!includeHidden) {
      rows = rows.filter((post) => post.status !== "hidden");
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
    const post: Post = {
      id: createId("post"),
      campus_id: isAdmin(session) ? input.campus_id ?? session.campus_id : session.campus_id,
      category: input.category,
      author_id: session.user_id,
      title: input.title.trim(),
      body: input.body.trim(),
      price_krw: input.price_krw ?? null,
      tags: input.tags?.map((tag) => tag.trim()).filter(Boolean) ?? [],
      location_hint: input.location_hint?.trim() ?? null,
      status: "active",
      is_promoted: input.is_promoted ?? false,
      promotion_until: null,
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
      if (input.status === "hidden") {
        ensure(isAdmin(session), "FORBIDDEN", "Only admin can hide posts.");
      }
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

    post.is_promoted = true;
    post.promotion_until = promotionUntil;
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
