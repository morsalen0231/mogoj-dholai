import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { RealtimePostgresInsertPayload } from "@supabase/supabase-js";
import type { Article, CategoryId } from "@/lib/site-data";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

type Database = {
  public: {
    Tables: {
      articles: {
        Row: {
          id: string;
          slug: string | null;
          category_id: string;
          profile_id: string | null;
          title_bn: string;
          title_en: string | null;
          cover_label: string | null;
          teaser: string | null;
          content_standard: string;
          content_funny: string;
          fun_fact: string | null;
          tags: string | null;
          image_url: string | null;
          status: "pending" | "approved" | "rejected";
          reviewed_by: string | null;
          reviewed_at: string | null;
          auto_publish_at: string;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          slug?: string | null;
          category_id: string;
          profile_id?: string | null;
          title_bn: string;
          title_en?: string | null;
          cover_label?: string | null;
          teaser?: string | null;
          content_standard: string;
          content_funny: string;
          fun_fact?: string | null;
          tags?: string | null;
          image_url?: string | null;
          status?: "pending" | "approved" | "rejected";
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          auto_publish_at?: string;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["articles"]["Insert"]>;
      };
      chat_messages: {
        Row: {
          id: string;
          room_id: string;
          sender_id: string | null;
          sender_name: string;
          message_text: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          sender_id?: string | null;
          sender_name: string;
          message_text: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["chat_messages"]["Insert"]>;
      };
      profiles: {
        Row: {
          id: string;
          session_id: string;
          display_name: string;
          email: string | null;
          email_verified: boolean;
          username: string | null;
          role: "reader" | "admin";
          bio: string | null;
          tagline: string | null;
          avatar_url: string | null;
          favorite_topic: string | null;
          location: string | null;
          occupation: string | null;
          points: number;
          level: number;
          badges: string[] | null;
          avatar_glow: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          session_id: string;
          display_name: string;
          email?: string | null;
          email_verified?: boolean;
          username?: string | null;
          role?: "reader" | "admin";
          bio?: string | null;
          tagline?: string | null;
          avatar_url?: string | null;
          favorite_topic?: string | null;
          location?: string | null;
          occupation?: string | null;
          points?: number;
          level?: number;
          badges?: string[] | null;
          avatar_glow?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      user_posts: {
        Row: {
          id: string;
          profile_id: string | null;
          display_name: string | null;
          is_anonymous: boolean;
          category: string;
          fact_text: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id?: string | null;
          display_name?: string | null;
          is_anonymous?: boolean;
          category: string;
          fact_text: string;
          status?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["user_posts"]["Insert"]>;
      };
      post_likes: {
        Row: {
          id: string;
          post_id: string;
          profile_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          profile_id: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["post_likes"]["Insert"]>;
      };
      post_comments: {
        Row: {
          id: string;
          post_id: string;
          profile_id: string;
          display_name: string | null;
          comment_text: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          profile_id: string;
          display_name?: string | null;
          comment_text: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["post_comments"]["Insert"]>;
      };
      post_notifications: {
        Row: {
          id: string;
          recipient_profile_id: string;
          actor_profile_id: string | null;
          post_id: string | null;
          article_id: string | null;
          type: "like" | "comment" | "post_submission" | "article_submission" | "article_review";
          body_text: string;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          recipient_profile_id: string;
          actor_profile_id?: string | null;
          post_id?: string | null;
          article_id?: string | null;
          type: "like" | "comment" | "post_submission" | "article_submission" | "article_review";
          body_text: string;
          read_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["post_notifications"]["Insert"]>;
      };
      feedback: {
        Row: {
          id: string;
          user_id: string | null;
          emoji_rating: string | null;
          subject: string;
          message: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          emoji_rating?: string | null;
          subject: string;
          message: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["feedback"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: {
      auto_publish_pending_articles: {
        Args: Record<string, never>;
        Returns: number;
      };
      can_request_password_reset: {
        Args: {
          target_email: string;
        };
        Returns: boolean;
      };
      create_email_verification_token: {
        Args: {
          target_profile_id: string;
          target_email: string;
        };
        Returns: string;
      };
      verify_email_token: {
        Args: {
          raw_token: string;
        };
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

let browserClient: SupabaseClient<Database> | null = null;

export type ProfileRecord = {
  id: string;
  session_id: string;
  display_name: string;
  email: string | null;
  email_verified: boolean;
  username: string | null;
  role: "reader" | "admin";
  bio: string | null;
  tagline: string | null;
  avatar_url: string | null;
  favorite_topic: string | null;
  location: string | null;
  occupation: string | null;
  points: number;
  level: number;
  badges: string[] | null;
  avatar_glow: string | null;
};

export type LeaderboardRecord = Pick<ProfileRecord, "id" | "display_name" | "points" | "level">;
export type ArticleRecord = Database["public"]["Tables"]["articles"]["Row"];
export type ArticleStatus = ArticleRecord["status"];

export type ChatRecord = {
  id: string;
  room_id: string;
  sender_id: string | null;
  sender_name: string;
  message_text: string;
  created_at: string;
};

export type UserPostRecord = {
  id: string;
  profile_id: string | null;
  display_name: string | null;
  is_anonymous: boolean;
  category: string;
  fact_text: string;
  status: string;
  created_at: string;
};

export type PublicPostWithAuthor = UserPostRecord & {
  author_username: string | null;
  author_display_name: string | null;
};

export type PostLikeRecord = {
  id: string;
  post_id: string;
  profile_id: string;
  created_at: string;
};

export type PostCommentRecord = {
  id: string;
  post_id: string;
  profile_id: string;
  display_name: string | null;
  comment_text: string;
  created_at: string;
};

export type PostCommentWithAuthor = PostCommentRecord & {
  author_username: string | null;
  author_display_name: string | null;
};

export type PublicFeedPost = PublicPostWithAuthor & {
  like_count: number;
  comment_count: number;
  viewer_has_liked: boolean;
  comments: PostCommentWithAuthor[];
};

export type PostNotificationRecord = {
  id: string;
  recipient_profile_id: string;
  actor_profile_id: string | null;
  post_id: string | null;
  article_id: string | null;
  type: "like" | "comment" | "post_submission" | "article_submission" | "article_review";
  body_text: string;
  read_at: string | null;
  created_at: string;
};

export type PostNotificationWithActor = PostNotificationRecord & {
  actor_username: string | null;
  actor_display_name: string | null;
};

export type FeedbackRecord = {
  id: string;
  user_id: string | null;
  emoji_rating: string | null;
  subject: string;
  message: string;
  created_at: string;
};

type ProfileUpsertInput = {
  id: string;
  session_id: string;
  display_name: string;
  email?: string;
  email_verified?: boolean;
  username?: string;
  role?: "reader" | "admin";
  bio?: string;
  tagline?: string;
  avatar_url?: string;
  favorite_topic?: string;
  location?: string;
  occupation?: string;
  level?: number;
};

type ArticleInput = {
  id: string;
  slug: string;
  category_id: CategoryId;
  profile_id?: string;
  title_bn: string;
  title_en: string;
  cover_label: string;
  teaser: string;
  content_standard: string;
  content_funny: string;
  fun_fact: string;
  tags: string;
  image_url: string;
  status?: ArticleStatus;
};

type ArticleStatusUpdateInput = {
  status: Exclude<ArticleStatus, "pending">;
  reviewed_by: string;
  reviewed_at?: string;
  published_at?: string | null;
};

type UserPostInput = {
  profile_id: string;
  display_name: string;
  is_anonymous: boolean;
  category: string;
  fact_text: string;
};

type ChatInput = {
  room_id: string;
  sender_id: string;
  sender_name: string;
  message_text: string;
};

type FeedbackInput = {
  user_id: string;
  emoji_rating: string;
  subject: string;
  message: string;
};

type PostLikeInput = {
  post_id: string;
  profile_id: string;
};

type PostCommentInput = {
  post_id: string;
  profile_id: string;
  display_name: string;
  comment_text: string;
};

type ProfileQueryClient = {
  from(table: "profiles"): {
    upsert(values: ProfileUpsertInput, options: { onConflict: string }): Promise<{ error: { message: string } | null }>;
    select(query: string): {
      eq(column: string, value: string): {
        single(): Promise<{ data: ProfileRecord | null; error: { message: string } | null }>;
      };
    };
  };
};

type PasswordResetEligibilityClient = SupabaseClient<Database> & {
  rpc(
    fn: "can_request_password_reset",
    args: { target_email: string },
  ): Promise<{ data: boolean | null; error: { message: string } | null }>;
};

type EmailVerificationRpcClient = SupabaseClient<Database> & {
  rpc(
    fn: "create_email_verification_token",
    args: { target_profile_id: string; target_email: string },
  ): Promise<{ data: string | null; error: { message: string } | null }>;
  rpc(
    fn: "verify_email_token",
    args: { raw_token: string },
  ): Promise<{ data: boolean | null; error: { message: string } | null }>;
};

type ArticleQueryClient = {
  from(table: "articles"): {
    select(query: string): {
      order(column: string, options: { ascending: boolean }): Promise<{ data: ArticleRecord[] | null; error: { message: string } | null }>;
      eq(column: string, value: string): {
        order(column: string, options: { ascending: boolean }): Promise<{ data: ArticleRecord[] | null; error: { message: string } | null }>;
        single(): Promise<{ data: ArticleRecord | null; error: { message: string } | null }>;
      };
    };
    upsert(values: ArticleInput, options: { onConflict: string }): Promise<{ error: { message: string } | null }>;
    insert(values: ArticleInput): Promise<{ error: { message: string } | null }>;
    update(values: ArticleInput | ArticleStatusUpdateInput): {
      eq(column: string, value: string): Promise<{ error: { message: string } | null }>;
    };
  };
};

type UserPostQueryClient = {
  from(table: "user_posts"): {
    insert(values: UserPostInput): Promise<{ error: { message: string } | null }>;
    select(query: string): {
      order(column: string, options: { ascending: boolean }): Promise<{ data: UserPostRecord[] | null; error: { message: string } | null }>;
    };
    update(values: { status: string }): {
      eq(column: string, value: string): Promise<{ error: { message: string } | null }>;
    };
  };
};

type FeedbackQueryClient = {
  from(table: "feedback"): {
    insert(values: FeedbackInput): Promise<{ error: { message: string } | null }>;
    select(query: string): {
      order(column: string, options: { ascending: boolean }): Promise<{ data: FeedbackRecord[] | null; error: { message: string } | null }>;
    };
  };
};

type ChatQueryClient = {
  from(table: "chat_messages"): {
    insert(values: ChatInput): Promise<{ error: { message: string } | null }>;
    select(query: string): {
      eq(column: string, value: string): {
        order(column: string, options: { ascending: boolean }): {
          limit(value: number): Promise<{ data: ChatRecord[] | null; error: { message: string } | null }>;
        };
      };
    };
    delete(): {
      eq(column: string, value: string): Promise<{ error: { message: string } | null }>;
    };
  };
};

type LeaderboardQueryClient = {
  from(table: "profiles"): {
    select(query: string): {
      order(column: string, options: { ascending: boolean }): {
        limit(value: number): Promise<{ data: LeaderboardRecord[] | null; error: { message: string } | null }>;
      };
    };
  };
};

type ProfileLookupClient = {
  from(table: "profiles"): {
    select(query: string): {
      ilike(column: string, value: string): {
        single(): Promise<{ data: ProfileRecord | null; error: { message: string } | null }>;
      };
    };
  };
};

type UserPostListClient = {
  from(table: "user_posts"): {
    select(query: string): {
      eq(column: string, value: string): {
        order(column: string, options: { ascending: boolean }): {
          limit(value: number): Promise<{ data: UserPostRecord[] | null; error: { message: string } | null }>;
          then?: never;
        };
      };
      order(column: string, options: { ascending: boolean }): {
        limit(value: number): Promise<{ data: UserPostRecord[] | null; error: { message: string } | null }>;
      };
    };
  };
};

type ProfilesByIdsClient = {
  from(table: "profiles"): {
    select(query: string): {
      in(column: string, values: string[]): Promise<{
        data: Array<{ id: string; username: string | null; display_name: string }>| null;
        error: { message: string } | null;
      }>;
    };
  };
};

type PostLikesClient = {
  from(table: "post_likes"): {
    select(query: string): {
      in(column: string, values: string[]): Promise<{ data: PostLikeRecord[] | null; error: { message: string } | null }>;
    };
    insert(values: PostLikeInput): Promise<{ error: { message: string } | null }>;
    delete(): {
      eq(column: string, value: string): {
        eq(nextColumn: string, nextValue: string): Promise<{ error: { message: string } | null }>;
      };
    };
  };
};

type PostCommentsClient = {
  from(table: "post_comments"): {
    select(query: string): {
      in(column: string, values: string[]): {
        order(column: string, options: { ascending: boolean }): Promise<{ data: PostCommentRecord[] | null; error: { message: string } | null }>;
      };
    };
    insert(values: PostCommentInput): Promise<{ error: { message: string } | null }>;
  };
};

type PostNotificationsClient = {
  from(table: "post_notifications"): {
    select(query: string): {
      eq(column: string, value: string): {
        order(column: string, options: { ascending: boolean }): {
          limit(value: number): Promise<{ data: PostNotificationRecord[] | null; error: { message: string } | null }>;
        };
      };
    };
    update(values: { read_at: string }): {
      eq(column: string, value: string): {
        is(nextColumn: string, nextValue: null): Promise<{ error: { message: string } | null }>;
      };
    };
  };
};

export function getSupabaseBrowserClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  if (!browserClient) {
    browserClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }

  return browserClient;
}

function getSupabaseServerClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function splitContent(value: string | null) {
  return (value ?? "")
    .split(/\r?\n\r?\n|\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitTags(value: string | null) {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function normalizeArticleRecord(row: ArticleRecord): Article {
  return {
    id: row.id,
    slug: row.slug ?? row.id.toLowerCase(),
    categoryId: row.category_id as CategoryId,
    titleBn: row.title_bn,
    titleEn: row.title_en ?? row.title_bn,
    coverLabel: row.cover_label ?? row.title_bn,
    teaser: row.teaser ?? "",
    contentStandard: splitContent(row.content_standard),
    contentFunny: splitContent(row.content_funny),
    funFact: row.fun_fact ?? "",
    imageUrl: row.image_url ?? "",
    tags: splitTags(row.tags),
  };
}

export async function upsertProfileRecord(input: ProfileUpsertInput) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return { error: { message: "Supabase config পাওয়া যায়নি।" } };
  }

  const profileClient = supabase as unknown as ProfileQueryClient;
  return profileClient.from("profiles").upsert(input, { onConflict: "id" });
}

export async function upsertArticleRecord(input: ArticleInput) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return { error: { message: "Supabase config পাওয়া যায়নি।" } };
  }

  const articleClient = supabase as unknown as ArticleQueryClient;
  return articleClient.from("articles").upsert(input, { onConflict: "id" });
}

async function syncArticleAutoPublishingWithClient(
  supabase: SupabaseClient<Database> | null,
) {
  if (!supabase) {
    return { error: { message: "Supabase config পাওয়া যায়নি।" } };
  }

  const { error } = await supabase.rpc("auto_publish_pending_articles");
  return { error };
}

export async function submitArticleRecord(input: ArticleInput) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return { error: { message: "Supabase config পাওয়া যায়নি।" } };
  }

  const articleClient = supabase as unknown as ArticleQueryClient;
  return articleClient.from("articles").insert({
    ...input,
    status: "pending",
  });
}

export async function fetchProfileRecord(id: string) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return { data: null, error: { message: "Supabase config পাওয়া যায়নি।" } };
  }

  const profileClient = supabase as unknown as ProfileQueryClient;
  return profileClient
    .from("profiles")
    .select("id, session_id, display_name, email, email_verified, username, role, bio, tagline, avatar_url, favorite_topic, location, occupation, points, level, badges, avatar_glow")
    .eq("id", id)
    .single();
}

export async function fetchProfileByUsername(username: string) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return { data: null, error: { message: "Supabase config পাওয়া যায়নি।" } };
  }

  const profileLookupClient = supabase as unknown as ProfileLookupClient;
  return profileLookupClient
    .from("profiles")
    .select("id, session_id, display_name, email, email_verified, username, role, bio, tagline, avatar_url, favorite_topic, location, occupation, points, level, badges, avatar_glow")
    .ilike("username", username)
    .single();
}

export async function canRequestPasswordReset(email: string) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return { data: null, error: { message: "Supabase config পাওয়া যায়নি।" } };
  }

  const rpcClient = supabase as PasswordResetEligibilityClient;
  return rpcClient.rpc("can_request_password_reset", { target_email: email.trim().toLowerCase() });
}

export async function createEmailVerificationToken(profileId: string, email: string) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return { data: null, error: { message: "Supabase config পাওয়া যায়নি।" } };
  }

  const rpcClient = supabase as EmailVerificationRpcClient;
  return rpcClient.rpc("create_email_verification_token", {
    target_profile_id: profileId,
    target_email: email.trim().toLowerCase(),
  });
}

export async function verifyEmailToken(rawToken: string) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return { data: null, error: { message: "Supabase config পাওয়া যায়নি।" } };
  }

  const rpcClient = supabase as EmailVerificationRpcClient;
  return rpcClient.rpc("verify_email_token", { raw_token: rawToken });
}

export async function fetchAdminArticleRecords() {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return { data: null, error: { message: "Supabase config পাওয়া যায়নি।" } };
  }

  const sync = await syncArticleAutoPublishingWithClient(supabase);
  if (sync.error) {
    return { data: null, error: sync.error };
  }

  const articleClient = supabase as unknown as ArticleQueryClient;
  return articleClient
    .from("articles")
    .select("id, slug, category_id, profile_id, title_bn, title_en, cover_label, teaser, content_standard, content_funny, fun_fact, tags, image_url, status, reviewed_by, reviewed_at, auto_publish_at, published_at, created_at, updated_at")
    .order("created_at", { ascending: false });
}

export async function fetchOwnArticleRecords(profileId: string) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return { data: null, error: { message: "Supabase config পাওয়া যায়নি।" } };
  }

  const sync = await syncArticleAutoPublishingWithClient(supabase);
  if (sync.error) {
    return { data: null, error: sync.error };
  }

  const articleClient = supabase as unknown as ArticleQueryClient;
  return articleClient
    .from("articles")
    .select("id, slug, category_id, profile_id, title_bn, title_en, cover_label, teaser, content_standard, content_funny, fun_fact, tags, image_url, status, reviewed_by, reviewed_at, auto_publish_at, published_at, created_at, updated_at")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false });
}

export async function updateArticleStatus(id: string, input: ArticleStatusUpdateInput) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return { error: { message: "Supabase config পাওয়া যায়নি।" } };
  }

  const articleClient = supabase as unknown as ArticleQueryClient;
  return articleClient.from("articles").update(input).eq("id", id);
}

export async function fetchPublicArticlesServer() {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return { data: null, error: { message: "Supabase config পাওয়া যায়নি।" } };
  }

  await syncArticleAutoPublishingWithClient(supabase);

  const articleClient = supabase as unknown as ArticleQueryClient;
  const { data, error } = await articleClient
    .from("articles")
    .select("id, slug, category_id, profile_id, title_bn, title_en, cover_label, teaser, content_standard, content_funny, fun_fact, tags, image_url, status, reviewed_by, reviewed_at, auto_publish_at, published_at, created_at, updated_at")
    .order("created_at", { ascending: false });

  return {
    data: data?.map(normalizeArticleRecord) ?? null,
    error,
  };
}

export async function fetchPublicArticleBySlugServer(slug: string) {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return { data: null, error: { message: "Supabase config পাওয়া যায়নি।" } };
  }

  await syncArticleAutoPublishingWithClient(supabase);

  const articleClient = supabase as unknown as ArticleQueryClient;
  const { data, error } = await articleClient
    .from("articles")
    .select("id, slug, category_id, profile_id, title_bn, title_en, cover_label, teaser, content_standard, content_funny, fun_fact, tags, image_url, status, reviewed_by, reviewed_at, auto_publish_at, published_at, created_at, updated_at")
    .eq("slug", slug)
    .single();

  return {
    data: data ? normalizeArticleRecord(data) : null,
    error,
  };
}

export async function insertUserPostRecord(input: UserPostInput) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return { error: { message: "Supabase config পাওয়া যায়নি।" } };
  }

  const postClient = supabase as unknown as UserPostQueryClient;
  return postClient.from("user_posts").insert(input);
}

export async function insertFeedbackRecord(input: FeedbackInput) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return { error: { message: "Supabase config পাওয়া যায়নি।" } };
  }

  const feedbackClient = supabase as unknown as FeedbackQueryClient;
  return feedbackClient.from("feedback").insert(input);
}

export async function fetchAdminPosts() {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return { data: null, error: { message: "Supabase config পাওয়া যায়নি।" } };
  }

  const postClient = supabase as unknown as UserPostQueryClient;
  return postClient
    .from("user_posts")
    .select("id, profile_id, display_name, is_anonymous, category, fact_text, status, created_at")
    .order("created_at", { ascending: false });
}

export async function fetchOwnPosts(profileId: string) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return { data: null, error: { message: "Supabase config পাওয়া যায়নি।" } };
  }

  const postListClient = supabase as unknown as UserPostListClient;
  return postListClient
    .from("user_posts")
    .select("id, profile_id, display_name, is_anonymous, category, fact_text, status, created_at")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false })
    .limit(100);
}

export async function fetchApprovedPosts(limit = 8) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return { data: null, error: { message: "Supabase config পাওয়া যায়নি।" } };
  }

  const postListClient = supabase as unknown as UserPostListClient;
  return postListClient
    .from("user_posts")
    .select("id, profile_id, display_name, is_anonymous, category, fact_text, status, created_at")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(limit);
}

export async function fetchApprovedPostsWithAuthors(limit = 8) {
  const { data, error } = await fetchApprovedPosts(limit);
  if (error || !data) {
    return { data: null, error };
  }

  const ids = Array.from(new Set(data.map((post) => post.profile_id).filter((value): value is string => Boolean(value))));
  if (ids.length === 0) {
    return {
      data: data.map((post) => ({ ...post, author_username: null, author_display_name: post.display_name })),
      error: null,
    };
  }

  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return { data: null, error: { message: "Supabase config পাওয়া যায়নি।" } };
  }

  const profilesClient = supabase as unknown as ProfilesByIdsClient;
  const { data: profiles, error: profileError } = await profilesClient
    .from("profiles")
    .select("id, username, display_name")
    .in("id", ids);

  if (profileError) {
    return { data: null, error: profileError };
  }

  const profileMap = new Map((profiles ?? []).map((profile) => [profile.id, profile]));

  return {
    data: data.map((post) => {
      const author = post.profile_id ? profileMap.get(post.profile_id) : null;
      return {
        ...post,
        author_username: author?.username ?? null,
        author_display_name: author?.display_name ?? post.display_name,
      };
    }),
    error: null,
  };
}

export async function fetchPublicFeedPosts(limit = 8, viewerId?: string) {
  const { data: posts, error: postsError } = await fetchApprovedPostsWithAuthors(limit);
  if (postsError || !posts) {
    return { data: null, error: postsError };
  }

  if (posts.length === 0) {
    return { data: [], error: null };
  }

  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return { data: null, error: { message: "Supabase config পাওয়া যায়নি।" } };
  }

  const postIds = posts.map((post) => post.id);
  const likesClient = supabase as unknown as PostLikesClient;
  const commentsClient = supabase as unknown as PostCommentsClient;

  const [{ data: likes, error: likesError }, { data: comments, error: commentsError }] = await Promise.all([
    likesClient.from("post_likes").select("id, post_id, profile_id, created_at").in("post_id", postIds),
    commentsClient
      .from("post_comments")
      .select("id, post_id, profile_id, display_name, comment_text, created_at")
      .in("post_id", postIds)
      .order("created_at", { ascending: true }),
  ]);

  if (likesError) {
    return { data: null, error: likesError };
  }

  if (commentsError) {
    return { data: null, error: commentsError };
  }

  const commentAuthorIds = Array.from(
    new Set((comments ?? []).map((comment) => comment.profile_id).filter((value): value is string => Boolean(value))),
  );

  let commentAuthors: Array<{ id: string; username: string | null; display_name: string }> = [];
  if (commentAuthorIds.length > 0) {
    const profilesClient = supabase as unknown as ProfilesByIdsClient;
    const { data: profiles, error: profileError } = await profilesClient
      .from("profiles")
      .select("id, username, display_name")
      .in("id", commentAuthorIds);

    if (profileError) {
      return { data: null, error: profileError };
    }

    commentAuthors = profiles ?? [];
  }

  const commentAuthorMap = new Map(commentAuthors.map((profile) => [profile.id, profile]));
  const likesByPost = new Map<string, PostLikeRecord[]>();
  const commentsByPost = new Map<string, PostCommentWithAuthor[]>();

  for (const like of likes ?? []) {
    const bucket = likesByPost.get(like.post_id) ?? [];
    bucket.push(like);
    likesByPost.set(like.post_id, bucket);
  }

  for (const comment of comments ?? []) {
    const author = commentAuthorMap.get(comment.profile_id);
    const bucket = commentsByPost.get(comment.post_id) ?? [];
    bucket.push({
      ...comment,
      author_username: author?.username ?? null,
      author_display_name: author?.display_name ?? comment.display_name,
    });
    commentsByPost.set(comment.post_id, bucket);
  }

  return {
    data: posts.map((post) => {
      const postLikes = likesByPost.get(post.id) ?? [];
      const postComments = commentsByPost.get(post.id) ?? [];

      return {
        ...post,
        like_count: postLikes.length,
        comment_count: postComments.length,
        viewer_has_liked: viewerId ? postLikes.some((like) => like.profile_id === viewerId) : false,
        comments: postComments,
      };
    }),
    error: null,
  };
}

export async function insertPostLike(input: PostLikeInput) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return { error: { message: "Supabase config পাওয়া যায়নি।" } };
  }

  const likesClient = supabase as unknown as PostLikesClient;
  return likesClient.from("post_likes").insert(input);
}

export async function deletePostLike(postId: string, profileId: string) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return { error: { message: "Supabase config পাওয়া যায়নি।" } };
  }

  const likesClient = supabase as unknown as PostLikesClient;
  return likesClient.from("post_likes").delete().eq("post_id", postId).eq("profile_id", profileId);
}

export async function insertPostComment(input: PostCommentInput) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return { error: { message: "Supabase config পাওয়া যায়নি।" } };
  }

  const commentsClient = supabase as unknown as PostCommentsClient;
  return commentsClient.from("post_comments").insert(input);
}

export async function fetchPostNotifications(profileId: string, limit = 20) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return { data: null, error: { message: "Supabase config পাওয়া যায়নি।" } };
  }

  const notificationsClient = supabase as unknown as PostNotificationsClient;
  const { data, error } = await notificationsClient
    .from("post_notifications")
    .select("id, recipient_profile_id, actor_profile_id, post_id, article_id, type, body_text, read_at, created_at")
    .eq("recipient_profile_id", profileId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    return { data: null, error };
  }

  const actorIds = Array.from(
    new Set(data.map((item) => item.actor_profile_id).filter((value): value is string => Boolean(value))),
  );

  if (actorIds.length === 0) {
    return {
      data: data.map((item) => ({
        ...item,
        actor_username: null,
        actor_display_name: null,
      })),
      error: null,
    };
  }

  const profilesClient = supabase as unknown as ProfilesByIdsClient;
  const { data: actors, error: actorsError } = await profilesClient
    .from("profiles")
    .select("id, username, display_name")
    .in("id", actorIds);

  if (actorsError) {
    return { data: null, error: actorsError };
  }

  const actorMap = new Map((actors ?? []).map((profile) => [profile.id, profile]));

  return {
    data: data.map((item) => {
      const actor = item.actor_profile_id ? actorMap.get(item.actor_profile_id) : null;
      return {
        ...item,
        actor_username: actor?.username ?? null,
        actor_display_name: actor?.display_name ?? null,
      };
    }),
    error: null,
  };
}

export async function markNotificationsAsRead(profileId: string) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return { error: { message: "Supabase config পাওয়া যায়নি।" } };
  }

  const notificationsClient = supabase as unknown as PostNotificationsClient;
  return notificationsClient
    .from("post_notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("recipient_profile_id", profileId)
    .is("read_at", null);
}

export async function updateUserPostStatus(id: string, status: "approved" | "rejected" | "pending") {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return { error: { message: "Supabase config পাওয়া যায়নি।" } };
  }

  const postClient = supabase as unknown as UserPostQueryClient;
  return postClient.from("user_posts").update({ status }).eq("id", id);
}

export async function fetchAdminFeedback() {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return { data: null, error: { message: "Supabase config পাওয়া যায়নি।" } };
  }

  const feedbackClient = supabase as unknown as FeedbackQueryClient;
  return feedbackClient
    .from("feedback")
    .select("id, user_id, emoji_rating, subject, message, created_at")
    .order("created_at", { ascending: false });
}

export async function fetchLeaderboardRecords(limit = 10) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return { data: null, error: { message: "Supabase config পাওয়া যায়নি।" } };
  }

  const leaderboardClient = supabase as unknown as LeaderboardQueryClient;
  return leaderboardClient
    .from("profiles")
    .select("id, display_name, points, level")
    .order("points", { ascending: false })
    .limit(limit);
}

export async function fetchChatMessages(roomId: string, limit = 4) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return { data: null, error: { message: "Supabase config পাওয়া যায়নি।" } };
  }

  const chatClient = supabase as unknown as ChatQueryClient;
  return chatClient
    .from("chat_messages")
    .select("id, room_id, sender_id, sender_name, message_text, created_at")
    .eq("room_id", roomId)
    .order("created_at", { ascending: true })
    .limit(limit);
}

export async function insertChatMessage(input: ChatInput) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return { error: { message: "Supabase config পাওয়া যায়নি।" } };
  }

  const chatClient = supabase as unknown as ChatQueryClient;
  return chatClient.from("chat_messages").insert(input);
}

export async function clearChatRoom(roomId: string) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return { error: { message: "Supabase config পাওয়া যায়নি।" } };
  }

  const chatClient = supabase as unknown as ChatQueryClient;
  return chatClient.from("chat_messages").delete().eq("room_id", roomId);
}

export type ChatInsertPayload = RealtimePostgresInsertPayload<ChatRecord>;
