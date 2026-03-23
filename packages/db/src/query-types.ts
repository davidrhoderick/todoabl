export type TaskState =
  | "CANCELED"
  | "DONE"
  | "INBOX"
  | "IN_PROGRESS"
  | "NEXT"
  | "SOMEDAY"
  | "WAITING";

export type ListColor =
  | "BLUE"
  | "GRAY"
  | "GREEN"
  | "ORANGE"
  | "PINK"
  | "PURPLE"
  | "RED"
  | "YELLOW";

type Scalar = number | string | null;

type Statement = {
  all<T>(): Promise<{ results: T[] }>;
  bind(...params: Scalar[]): Statement;
  first<T>(): Promise<T | null>;
  run(): Promise<{ success: boolean }>;
};

export type DatabaseClient = {
  prepare(sql: string): Statement;
};

export type ViewerRecord = {
  email: string;
  id: string;
};

export type ListRow = {
  color: string | null;
  id: string;
  name: string;
};

export type TaskRow = {
  completed_at: number | null;
  created_at: number;
  deadline_at: number | null;
  id: string;
  list_id: string;
  notes: string | null;
  parent_task_id: string | null;
  reminder_at: number | null;
  start_at: number | null;
  state: TaskState;
  title: string;
};

export type TaskUpdateRow = {
  body: string;
  created_at: number;
  id: string;
  task_id: string;
};

export type ListRecord = {
  color: ListColor | null;
  id: string;
  name: string;
};

export type TaskRecord = {
  completedAt: number | null;
  createdAt: number;
  deadlineAt: number | null;
  id: string;
  listId: string;
  notes: string | null;
  parentTaskId: string | null;
  reminderAt: number | null;
  startAt: number | null;
  state: TaskState;
  title: string;
};

export type TaskUpdateRecord = {
  body: string;
  createdAt: number;
  id: string;
  taskId: string;
};

export type CreateListInput = {
  color: ListColor | null;
  name: string;
};

export type CreateTaskInput = {
  deadlineAt: number | null;
  listId: string;
  reminderAt: number | null;
  startAt: number | null;
  title: string;
};

export type TaskStatusRecord = {
  completedAt: number | null;
  id: string;
  state: TaskState;
};
