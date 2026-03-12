import { transitionTaskState } from "../../core/src/task-state";
import { getListById } from "./query-reads";
import type {
  CreateListInput,
  CreateTaskInput,
  DatabaseClient,
  TaskState,
  TaskStatusRecord
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

export async function completeTask(
  db: DatabaseClient,
  userId: string,
  taskId: string,
  now = Date.now()
) {
  return setTaskState(db, userId, taskId, "DONE", now);
}

export async function reopenTask(
  db: DatabaseClient,
  userId: string,
  taskId: string,
  state: TaskState,
  now = Date.now()
) {
  if (state === "DONE") {
    return null;
  }

  return setTaskState(db, userId, taskId, state, now);
}

async function setTaskState(
  db: DatabaseClient,
  userId: string,
  taskId: string,
  nextState: TaskState,
  now: number
) {
  const current = await db
    .prepare(
      "select id, state, completed_at from tasks where id = ? and user_id = ?"
    )
    .bind(taskId, userId)
    .first<{ completed_at: number | null; id: string; state: TaskState }>();

  if (!current) {
    return null;
  }

  const transition = transitionTaskState(
    current.state,
    nextState,
    current.completed_at,
    now
  );

  if (!transition) {
    return null;
  }

  await db
    .prepare(
      "update tasks set state = ?, completed_at = ?, updated_at = ? where id = ? and user_id = ?"
    )
    .bind(transition.state, transition.completedAt, now, taskId, userId)
    .run();

  return getTaskStatus(db, userId, taskId);
}

async function getTaskStatus(
  db: DatabaseClient,
  userId: string,
  taskId: string
): Promise<TaskStatusRecord | null> {
  const row = await db
    .prepare(
      "select id, state, completed_at from tasks where id = ? and user_id = ?"
    )
    .bind(taskId, userId)
    .first<{ completed_at: number | null; id: string; state: TaskState }>();

  if (!row) {
    return null;
  }

  return {
    completedAt: row.completed_at,
    id: row.id,
    state: row.state
  };
}
