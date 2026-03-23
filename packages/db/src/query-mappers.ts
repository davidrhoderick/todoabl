import type {
  ListColor,
  ListRecord,
  ListRow,
  TaskRecord,
  TaskRow
} from "./query-types";

export function mapTaskRow(row: TaskRow): TaskRecord {
  return {
    completedAt: row.completed_at,
    createdAt: row.created_at,
    deadlineAt: row.deadline_at,
    id: row.id,
    listId: row.list_id,
    notes: row.notes,
    parentTaskId: row.parent_task_id,
    reminderAt: row.reminder_at,
    startAt: row.start_at,
    state: row.state,
    title: row.title
  };
}

export function mapListRow(row: ListRow): ListRecord {
  return {
    color: toListColor(row.color),
    id: row.id,
    name: row.name
  };
}

export function compareTasks(left: TaskRecord, right: TaskRecord) {
  const leftScheduledAt = getScheduledAt(left) ?? Number.MAX_SAFE_INTEGER;
  const rightScheduledAt = getScheduledAt(right) ?? Number.MAX_SAFE_INTEGER;
  return leftScheduledAt - rightScheduledAt || left.createdAt - right.createdAt;
}

export function isCompleted(task: TaskRecord) {
  return task.completedAt !== null || task.state === "DONE";
}

export function getScheduledAt(task: TaskRecord) {
  return [task.startAt, task.reminderAt, task.deadlineAt].reduce<number | null>(
    (earliest, value) => {
      if (value === null) {
        return earliest;
      }

      return earliest === null ? value : Math.min(earliest, value);
    },
    null
  );
}

function toListColor(value: string | null): ListColor | null {
  switch (value) {
    case "BLUE":
    case "GRAY":
    case "GREEN":
    case "ORANGE":
    case "PINK":
    case "PURPLE":
    case "RED":
    case "YELLOW":
      return value;
    default:
      return null;
  }
}
