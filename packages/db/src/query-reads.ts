import {
  compareTasks,
  getScheduledAt,
  isCompleted,
  mapListRow,
  mapTaskRow
} from "./query-mappers";
import type {
  DatabaseClient,
  ListRow,
  TaskRecord,
  TaskRow,
  TaskState,
  TaskUpdateRow,
  ViewerRecord
} from "./query-types";

export async function getViewerById(db: DatabaseClient, userId: string) {
  return db
    .prepare("select id, email from users where id = ?")
    .bind(userId)
    .first<ViewerRecord>();
}

export async function listListsByUserId(db: DatabaseClient, userId: string) {
  const { results } = await db
    .prepare("select id, name, color from lists where user_id = ?")
    .bind(userId)
    .all<ListRow>();

  return results
    .map(mapListRow)
    .sort((left, right) => left.name.localeCompare(right.name));
}

export async function getListById(
  db: DatabaseClient,
  userId: string,
  listId: string
) {
  const row = await db
    .prepare("select id, name, color from lists where id = ? and user_id = ?")
    .bind(listId, userId)
    .first<ListRow>();

  return row ? mapListRow(row) : null;
}

export async function listTasksByUserId(db: DatabaseClient, userId: string) {
  const { results } = await db
    .prepare(
      "select id, list_id, title, state, start_at, reminder_at, deadline_at, completed_at, parent_task_id, notes, created_at from tasks where user_id = ?"
    )
    .bind(userId)
    .all<TaskRow>();

  return results.map(mapTaskRow).sort(compareTasks);
}

export async function listTasksByListId(
  db: DatabaseClient,
  userId: string,
  listId: string,
  includeCompleted: boolean,
  state?: TaskState | null
) {
  const tasks = await listTasksByUserId(db, userId);
  return tasks.filter((task) => {
    if (task.listId !== listId) {
      return false;
    }

    if (!includeCompleted && isCompleted(task)) {
      return false;
    }

    return state ? task.state === state : true;
  });
}

export async function getTaskById(
  db: DatabaseClient,
  userId: string,
  taskId: string
) {
  const row = await db
    .prepare(
      "select id, list_id, title, state, start_at, reminder_at, deadline_at, completed_at, parent_task_id, notes, created_at from tasks where id = ? and user_id = ?"
    )
    .bind(taskId, userId)
    .first<TaskRow>();

  return row ? mapTaskRow(row) : null;
}

export async function listSubtasksByParentId(
  db: DatabaseClient,
  userId: string,
  parentTaskId: string
) {
  const { results } = await db
    .prepare(
      "select id, list_id, title, state, start_at, reminder_at, deadline_at, completed_at, parent_task_id, notes, created_at from tasks where parent_task_id = ? and user_id = ?"
    )
    .bind(parentTaskId, userId)
    .all<TaskRow>();

  return results.map(mapTaskRow).sort(compareTasks);
}

export async function listTaskUpdatesByTaskId(
  db: DatabaseClient,
  userId: string,
  taskId: string
) {
  const task = await getTaskById(db, userId, taskId);

  if (!task) {
    return [];
  }

  const { results } = await db
    .prepare(
      "select id, task_id, body, created_at from task_updates where task_id = ?"
    )
    .bind(taskId)
    .all<TaskUpdateRow>();

  return results
    .map((row) => ({
      body: row.body,
      createdAt: row.created_at,
      id: row.id,
      taskId: row.task_id
    }))
    .sort((left, right) => left.createdAt - right.createdAt);
}

export function buildViewerTaskBuckets(tasks: TaskRecord[], now = Date.now()) {
  const actionableTasks = tasks.filter((task) => !isCompleted(task));
  const endOfDay = new Date(now);
  endOfDay.setUTCHours(23, 59, 59, 999);
  const endOfDayTime = endOfDay.getTime();

  return {
    inbox: actionableTasks.filter((task) => task.state === "INBOX"),
    today: actionableTasks.filter((task) => {
      const scheduledAt = getScheduledAt(task);
      return scheduledAt !== null && scheduledAt <= endOfDayTime;
    }),
    upcoming: actionableTasks.filter((task) => {
      const scheduledAt = getScheduledAt(task);
      return scheduledAt !== null && scheduledAt > endOfDayTime;
    })
  };
}
