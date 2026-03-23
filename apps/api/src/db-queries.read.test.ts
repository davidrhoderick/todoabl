import {
  getListById,
  getTaskById,
  listTasksByListId,
  listTaskUpdatesByTaskId
} from "@todoabl/db/queries";
import { describe, expect, it } from "vitest";

import { createMockD1Database } from "./lib/mock-d1";

describe("db query reads", () => {
  it("scopes list and task reads by user id", async () => {
    const db = createMockD1Database({
      lists: [{ id: "list-1", name: "Inbox", color: null, user_id: "user-1" }],
      tasks: [
        {
          id: "task-1",
          list_id: "list-1",
          title: "Private task",
          state: "NEXT",
          start_at: null,
          reminder_at: null,
          deadline_at: null,
          completed_at: null,
          parent_task_id: null,
          notes: null,
          created_at: 1,
          user_id: "user-1"
        }
      ]
    });

    await expect(getListById(db, "user-1", "list-1")).resolves.toMatchObject({
      id: "list-1"
    });
    await expect(getListById(db, "user-2", "list-1")).resolves.toBeNull();
    await expect(getTaskById(db, "user-1", "task-1")).resolves.toMatchObject({
      id: "task-1"
    });
    await expect(getTaskById(db, "user-2", "task-1")).resolves.toBeNull();
  });

  it("filters list tasks and excludes completed tasks by default", async () => {
    const db = createMockD1Database({
      tasks: [
        {
          id: "open-task",
          list_id: "list-1",
          title: "Open",
          state: "NEXT",
          start_at: null,
          reminder_at: null,
          deadline_at: null,
          completed_at: null,
          parent_task_id: null,
          notes: null,
          created_at: 1,
          user_id: "user-1"
        },
        {
          id: "done-task",
          list_id: "list-1",
          title: "Done",
          state: "DONE",
          start_at: null,
          reminder_at: null,
          deadline_at: null,
          completed_at: 5,
          parent_task_id: null,
          notes: null,
          created_at: 2,
          user_id: "user-1"
        }
      ]
    });

    await expect(
      listTasksByListId(db, "user-1", "list-1", false)
    ).resolves.toHaveLength(1);
    await expect(
      listTasksByListId(db, "user-1", "list-1", true)
    ).resolves.toHaveLength(2);
  });

  it("only returns task updates when the task belongs to the user", async () => {
    const db = createMockD1Database({
      task_updates: [
        { id: "update-1", task_id: "task-1", body: "Started", created_at: 3 }
      ],
      tasks: [
        {
          id: "task-1",
          list_id: "list-1",
          title: "Private task",
          state: "NEXT",
          start_at: null,
          reminder_at: null,
          deadline_at: null,
          completed_at: null,
          parent_task_id: null,
          notes: null,
          created_at: 1,
          user_id: "user-1"
        }
      ]
    });

    await expect(
      listTaskUpdatesByTaskId(db, "user-1", "task-1")
    ).resolves.toEqual([
      { body: "Started", createdAt: 3, id: "update-1", taskId: "task-1" }
    ]);
    await expect(
      listTaskUpdatesByTaskId(db, "user-2", "task-1")
    ).resolves.toEqual([]);
  });
});
