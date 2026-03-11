import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  createdAt: integer("created_at").notNull(),
  displayName: text("display_name"),
  email: text("email").notNull().unique(),
  id: text("id").primaryKey(),
  passwordHash: text("password_hash").notNull(),
  updatedAt: integer("updated_at").notNull()
});

export const sessions = sqliteTable("sessions", {
  createdAt: integer("created_at").notNull(),
  expiresAt: integer("expires_at").notNull(),
  id: text("id").primaryKey(),
  userId: text("user_id").notNull()
});

export const tasks = sqliteTable("tasks", {
  createdAt: integer("created_at").notNull(),
  deadlineAt: integer("deadline_at"),
  id: text("id").primaryKey(),
  latitude: real("latitude"),
  listId: text("list_id").notNull(),
  longitude: real("longitude"),
  reminderAt: integer("reminder_at"),
  startAt: integer("start_at"),
  state: text("state").notNull(),
  title: text("title").notNull(),
  updatedAt: integer("updated_at").notNull(),
  userId: text("user_id").notNull()
});
