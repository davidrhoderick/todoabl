import {
  index,
  integer,
  real,
  sqliteTable,
  text
} from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  createdAt: integer("created_at").notNull(),
  displayName: text("display_name"),
  email: text("email").notNull().unique(),
  id: text("id").primaryKey(),
  passwordHash: text("password_hash").notNull(),
  updatedAt: integer("updated_at").notNull()
});

export const sessions = sqliteTable(
  "sessions",
  {
    createdAt: integer("created_at").notNull(),
    expiresAt: integer("expires_at").notNull(),
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" })
  },
  (table) => ({
    userIdIdx: index("sessions_user_id_idx").on(table.userId),
    expiresAtIdx: index("sessions_expires_at_idx").on(table.expiresAt)
  })
);

export const lists = sqliteTable(
  "lists",
  {
    color: text("color"),
    createdAt: integer("created_at").notNull(),
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    updatedAt: integer("updated_at").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" })
  },
  (table) => ({
    userIdIdx: index("lists_user_id_idx").on(table.userId)
  })
);

export const tasks = sqliteTable(
  "tasks",
  {
    completedAt: integer("completed_at"),
    createdAt: integer("created_at").notNull(),
    deadlineAt: integer("deadline_at"),
    id: text("id").primaryKey(),
    latitude: real("latitude"),
    listId: text("list_id")
      .notNull()
      .references(() => lists.id, { onDelete: "cascade" }),
    longitude: real("longitude"),
    notes: text("notes"),
    parentTaskId: text("parent_task_id").references((): any => tasks.id, {
      onDelete: "cascade"
    }),
    reminderAt: integer("reminder_at"),
    startAt: integer("start_at"),
    state: text("state").notNull(),
    title: text("title").notNull(),
    updatedAt: integer("updated_at").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" })
  },
  (table) => ({
    listIdIdx: index("tasks_list_id_idx").on(table.listId),
    parentTaskIdIdx: index("tasks_parent_task_id_idx").on(table.parentTaskId),
    userIdIdx: index("tasks_user_id_idx").on(table.userId)
  })
);

export const taskUpdates = sqliteTable(
  "task_updates",
  {
    body: text("body").notNull(),
    createdAt: integer("created_at").notNull(),
    id: text("id").primaryKey(),
    taskId: text("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" })
  },
  (table) => ({
    taskIdIdx: index("task_updates_task_id_idx").on(table.taskId)
  })
);
