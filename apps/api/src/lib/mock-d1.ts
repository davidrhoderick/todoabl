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
  if (/\b(?:from|into)\s+lists\b/u.test(sql)) {
    return "lists";
  }

  if (/\b(?:from|into)\s+task_updates\b/u.test(sql)) {
    return "task_updates";
  }

  if (/\b(?:from|into)\s+tasks\b/u.test(sql)) {
    return "tasks";
  }

  if (/\b(?:from|into)\s+sessions\b/u.test(sql)) {
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
    [/\bemail = \?/u, "email"],
    [/\buser_id = \?/u, "user_id"],
    [/\blist_id = \?/u, "list_id"],
    [/\bparent_task_id = \?/u, "parent_task_id"],
    [/\btask_id = \?/u, "task_id"],
    [/\bstate = \?/u, "state"],
    [/\bid = \?/u, "id"]
  ] as const;

  const orderedChecks = checks
    .map(([pattern, field]) => {
      const match = sql.match(pattern);
      return match?.index === undefined ? null : { field, index: match.index };
    })
    .filter(
      (value): value is { field: (typeof checks)[number][1]; index: number } =>
        value !== null
    )
    .sort((left, right) => left.index - right.index);

  let index = 0;

  for (const check of orderedChecks) {
    if (row[check.field] !== params[index]) {
      return false;
    }

    index += 1;
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
    select.split(", ").map((column) => {
      const parts = column.split(" as ");
      const source = parts[0] ?? column;
      const alias = parts[1];
      return [alias ?? source, row[source]];
    })
  );
}
