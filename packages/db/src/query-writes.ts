import { getListById } from "./query-reads";
import type {
  CreateListInput,
  CreateTaskInput,
  DatabaseClient
} from "./query-types";

export async function createList(
  db: DatabaseClient,
  userId: string,
  input: CreateListInput,
  now = Date.now(),
  id: string = crypto.randomUUID()
) {
  const name = input.name.trim();

  await db
    .prepare(
      "insert into lists (id, user_id, name, color, created_at, updated_at) values (?, ?, ?, ?, ?, ?)"
    )
    .bind(id, userId, name, input.color, now, now)
    .run();

  return { color: input.color, id, name };
}

export async function createTask(
  db: DatabaseClient,
  userId: string,
  input: CreateTaskInput,
  now = Date.now(),
  id: string = crypto.randomUUID()
) {
  const list = await getListById(db, userId, input.listId);

  if (!list) {
    return null;
  }

  const title = input.title.trim();

  await db
    .prepare(
      "insert into tasks (id, user_id, list_id, title, state, start_at, reminder_at, deadline_at, created_at, updated_at) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(
      id,
      userId,
      input.listId,
      title,
      "INBOX",
      input.startAt,
      input.reminderAt,
      input.deadlineAt,
      now,
      now
    )
    .run();

  return {
    list,
    task: {
      completedAt: null,
      createdAt: now,
      deadlineAt: input.deadlineAt,
      id,
      listId: input.listId,
      notes: null,
      parentTaskId: null,
      reminderAt: input.reminderAt,
      startAt: input.startAt,
      state: "INBOX" as const,
      title
    }
  };
}
