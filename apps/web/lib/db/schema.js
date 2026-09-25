import {
  pgTable,
  text,
  varchar,
  timestamp,
  bigint,
  uuid,
  index,
  jsonb,
} from "drizzle-orm/pg-core";

// ─── users ────────────────────────────────────────────────────────────────────
export const users = pgTable(
  "users",
  {
    id:           uuid("id").primaryKey().defaultRandom(),
    email:        varchar("email", { length: 255 }).notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    name:         varchar("name", { length: 100 }),
    createdAt:    timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("users_email_idx").on(t.email), // fast login lookup
  ]
);

// ─── sessions ─────────────────────────────────────────────────────────────────
export const sessions = pgTable(
  "sessions",
  {
    id:                    uuid("id").primaryKey().defaultRandom(),
    userId:                uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    accessToken:           text("access_token").notNull().unique(),
    refreshToken:          text("refresh_token").notNull().unique(),
    accessTokenExpiresAt:  bigint("access_token_expires_at", { mode: "number" }).notNull(),
    refreshTokenExpiresAt: bigint("refresh_token_expires_at", { mode: "number" }).notNull(),
    createdAt:             timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("sessions_access_token_idx").on(t.accessToken),   // token validation
    index("sessions_refresh_token_idx").on(t.refreshToken), // refresh flow
    index("sessions_user_id_idx").on(t.userId),             // user session lookup
  ]
);

// ─── items (clips) ────────────────────────────────────────────────────────────
export const items = pgTable(
  "items",
  {
    id:        uuid("id").primaryKey().defaultRandom(),
    userId:    uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    type:      varchar("type", { length: 10 }).notNull(), // text | link | image
    content:   text("content").notNull(),
    url:       text("url"),
    imageUrl:  text("image_url"),   // external storage URL
    embedding: jsonb("embedding"),  // float64[] from Gemini — stored as JSON array
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("items_user_id_idx").on(t.userId),                        // fetch user clips
    index("items_user_id_type_idx").on(t.userId, t.type),           // type filter (compound)
    index("items_user_id_created_at_idx").on(t.userId, t.createdAt), // pagination order
  ]
);
