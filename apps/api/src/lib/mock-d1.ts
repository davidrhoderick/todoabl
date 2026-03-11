type Row = Record<string, number | string | null>;
type TableName = "sessions" | "task_lists" | "tasks" | "users";

type State = Record<TableName, Row[]>;

type Statement = {
  all<T>(): Promise<{ results: T[] }>;
  bind(...params: Array<number | string | null>): Statement;
  first<T>(): Promise<T | null>;
  run(): Promise<{ success: boolean }>;
};

export function createMockD1Database(initialState?: Partial<State>): Env["DB"] {
  const state: State = {
    sessions: initialState?.sessions ?? [],
    task_lists: initialState?.task_lists ?? [],
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

function getTableName(sql: string): TableName {
  if (sql.includes(" task_lists ")) {
    return "task_lists";
  }

  if (sql.includes(" tasks ")) {
    return "tasks";
  }

  if (sql.includes(" sessions ")) {
    return "sessions";
  }

  return "users";
}

function matchesRow(
  row: Row,
  sql: string,
  params: Array<number | string | null>
) {
  const checks = [
    ["email = ?", "email"],
    ["id = ?", "id"],
    ["user_id = ?", "user_id"],
    ["list_id = ?", "list_id"],
    ["parent_task_id = ?", "parent_task_id"],
    ["state = ?", "state"]
  ] as const;

  let index = 0;

  for (const [pattern, field] of checks) {
    if (sql.includes(pattern)) {
      if (row[field] !== params[index]) {
        return false;
      }

      index += 1;
    }
  }

  if (sql.includes("expires_at > ?")) {
    return (
      typeof row.expires_at === "number" &&
      row.expires_at > Number(params[index])
    );
  }

  if (sql.includes("archived_at is null") && row.archived_at !== null) {
    return false;
  }

  return true;
}

function projectRow(row: Row, sql: string) {
  const select = sql.slice("select ".length, sql.indexOf(" from"));
  return Object.fromEntries(
    select.split(", ").map((column) => [column, row[column]])
  );
}
