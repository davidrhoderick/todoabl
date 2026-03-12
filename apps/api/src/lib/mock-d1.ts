import { getTableName, matchesRow, projectRow } from "./mock-d1-sql";

type Row = Record<string, number | string | null>;
type TableName = "lists" | "sessions" | "task_updates" | "tasks" | "users";

type State = Record<TableName, Row[]>;

type Statement = {
  all<T>(): Promise<{ results: T[] }>;
  bind(...params: Array<number | string | null>): Statement;
  first<T>(): Promise<T | null>;
  run(): Promise<{ success: boolean }>;
};

export function createMockD1Database(initialState?: Partial<State>): Env["DB"] {
  const state: State = {
    lists: initialState?.lists ?? [],
    sessions: initialState?.sessions ?? [],
    task_updates: initialState?.task_updates ?? [],
    tasks: initialState?.tasks ?? [],
    users: initialState?.users ?? []
  };

  return {
    prepare(sql: string) {
      let params: Array<number | string | null> = [];
      const statement: Statement = {
        all: async <T>() => ({ results: queryRows(sql, params, state) as T[] }),
        bind: (...nextParams) => {
          params = nextParams;
          return statement;
        },
        first: async <T>() => (queryRows(sql, params, state)[0] as T) ?? null,
        run: async () => {
          mutateRows(sql, params, state);
          return { success: true };
        }
      };

      return statement;
    }
  } as Env["DB"];
}

function queryRows(
  sql: string,
  params: Array<number | string | null>,
  state: State
) {
  const table = getTableName(sql);
  const rows = state[table];
  return rows
    .filter((row) => matchesRow(row, sql, params))
    .map((row) => projectRow(row, sql));
}

function mutateRows(
  sql: string,
  params: Array<number | string | null>,
  state: State
) {
  if (sql.startsWith("insert into ")) {
    insertRow(sql, params, state);
    return;
  }
  if (sql.startsWith("update sessions")) {
    const [expiresAt, id] = params;
    const session = state.sessions.find((row) => row.id === id);
    if (session) {
      session.expires_at = expiresAt ?? null;
    }
    return;
  }
  if (sql.startsWith("update tasks")) {
    const [stateValue, completedAt, updatedAt, id, userId] = params;
    const task = state.tasks.find(
      (row) => row.id === id && row.user_id === userId
    );

    if (task) {
      task.state = stateValue ?? null;
      task.completed_at = completedAt ?? null;
      task.updated_at = updatedAt ?? null;
    }
    return;
  }
  if (sql.startsWith("delete from sessions")) {
    const [id] = params;
    state.sessions = state.sessions.filter((row) => row.id !== id);
  }
}

function insertRow(
  sql: string,
  params: Array<number | string | null>,
  state: State
) {
  const table = getTableName(sql);
  const columns = sql.slice(sql.indexOf("(") + 1, sql.indexOf(")")).split(", ");
  const row = Object.fromEntries(
    columns.map((column, index) => [column, params[index] ?? null])
  );
  state[table].push(row);
}
