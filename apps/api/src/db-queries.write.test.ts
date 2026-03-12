import {
  createList,
  createTask,
  getListById,
  getTaskById
} from "@todoabl/db/queries";
import { describe, expect, it } from "vitest";

import { createMockD1Database } from "./lib/mock-d1";

describe("db query writes", () => {
  it("creates a list with a stored enum color", async () => {
    const db = createMockD1Database();
    const list = await createList(
      db,
      "user-1",
      { color: "GREEN", name: "  Personal  " },
      123,
      "list-1"
    );

    expect(list).toEqual({ color: "GREEN", id: "list-1", name: "Personal" });
    await expect(getListById(db, "user-1", "list-1")).resolves.toEqual(list);
  });

  it("creates a task only when the target list belongs to the user", async () => {
    const db = createMockD1Database({
      lists: [
        { id: "list-1", name: "Inbox", color: "GREEN", user_id: "user-1" }
      ]
    });

    const created = await createTask(
      db,
      "user-1",
      {
        deadlineAt: 300,
        listId: "list-1",
        reminderAt: 200,
        startAt: 100,
        title: "  Follow up  "
      },
      123,
      "task-1"
    );

    expect(created).toEqual({
      list: { color: "GREEN", id: "list-1", name: "Inbox" },
      task: {
        completedAt: null,
        createdAt: 123,
        deadlineAt: 300,
        id: "task-1",
        listId: "list-1",
        notes: null,
        parentTaskId: null,
        reminderAt: 200,
        startAt: 100,
        state: "INBOX",
        title: "Follow up"
      }
    });
    await expect(getTaskById(db, "user-1", "task-1")).resolves.toMatchObject({
      id: "task-1",
      state: "INBOX",
      title: "Follow up"
    });
    await expect(
      createTask(
        db,
        "user-2",
        {
          deadlineAt: null,
          listId: "list-1",
          reminderAt: null,
          startAt: null,
          title: "Blocked"
        },
        124,
        "task-2"
      )
    ).resolves.toBeNull();
  });
});
