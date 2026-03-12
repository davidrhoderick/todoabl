import type {
  ListColor,
  ListRecord,
  TaskRecord,
  TaskState,
  TaskUpdateRecord
} from "@todoabl/db/queries";

export type TaskNode = {
  completedAt: string | null;
  deadlineAt: string | null;
  id: string;
  listId: string;
  notes: string | null;
  parentTaskId: string | null;
  reminderAt: string | null;
  startAt: string | null;
  state: TaskState;
  subtasks: TaskNode[];
  title: string;
  updates: TaskUpdateNode[];
};

export type TaskListNode = {
  color: ListColor | null;
  id: string;
  name: string;
  tasks: TaskNode[];
};

export type TaskUpdateNode = {
  body: string;
  createdAt: string;
  id: string;
  taskId: string;
};

export function toIsoString(value: unknown): string | null {
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "number") {
    return new Date(value).toISOString();
  }

  if (typeof value === "string") {
    return value;
  }

  return null;
}

export function toTimestamp(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.getTime();
  }

  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? null : parsed;
  }

  return null;
}

export function toTaskListNode(list: ListRecord): TaskListNode {
  return { color: list.color, id: list.id, name: list.name, tasks: [] };
}

export function toTaskNode(task: TaskRecord): TaskNode {
  return {
    completedAt: toIsoString(task.completedAt),
    deadlineAt: toIsoString(task.deadlineAt),
    id: task.id,
    listId: task.listId,
    notes: task.notes,
    parentTaskId: task.parentTaskId,
    reminderAt: toIsoString(task.reminderAt),
    startAt: toIsoString(task.startAt),
    state: task.state,
    subtasks: [],
    title: task.title,
    updates: []
  };
}

export function toTaskUpdateNode(update: TaskUpdateRecord): TaskUpdateNode {
  return {
    body: update.body,
    createdAt: new Date(update.createdAt).toISOString(),
    id: update.id,
    taskId: update.taskId
  };
}
