type Row = Record<string, number | string | null>;
type TableName = "lists" | "sessions" | "task_updates" | "tasks" | "users";

export function getTableName(sql: string): TableName {
  if (/\b(?:from|into)\s+lists\b/u.test(sql)) {
    return "lists";
  }
  if (/\b(?:from|into)\s+task_updates\b/u.test(sql)) {
    return "task_updates";
  }
  if (/\b(?:from|into)\s+tasks\b/u.test(sql)) {
    return "tasks";
  }
  return /\b(?:from|into)\s+sessions\b/u.test(sql) ? "sessions" : "users";
}

export function matchesRow(
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

  return !sql.includes("archived_at is null") || row.archived_at === null;
}

export function projectRow(row: Row, sql: string) {
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
