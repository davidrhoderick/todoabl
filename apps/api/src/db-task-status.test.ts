import { completeTask, reopenTask } from "@todoabl/db/queries";
import { describe, expect, it } from "vitest";

import { createMockD1Database } from "./lib/mock-d1";

describe("task status writes", () => {
  it("completes a task and stores completedAt", async () => {
    const db = createMockD1Database({
      tasks: [
        {
          id: "task-1",
          list_id: "list-1",
          title: "Ship it",
          state: "IN_PROGRESS",
          start_at: null,
          reminder_at: null,
          deadline_at: null,
          completed_at: null,
          parent_task_id: null,
          notes: null,
          created_at: 1,
          updated_at: 1,
          user_id: "user-1"
        }
      ]
    });

    await expect(completeTask(db, "user-1", "task-1", 500)).resolves.toEqual({
      completedAt: 500,
      id: "task-1",
      state: "DONE"
    });
  });

  it("reopens a completed task into a non-done state and clears completedAt", async () => {
    const db = createMockD1Database({
      tasks: [
        {
          id: "task-1",
          list_id: "list-1",
          title: "Ship it",
          state: "DONE",
          start_at: null,
          reminder_at: null,
          deadline_at: null,
          completed_at: 500,
          parent_task_id: null,
          notes: null,
          created_at: 1,
          updated_at: 500,
          user_id: "user-1"
        }
      ]
    });

    await expect(
      reopenTask(db, "user-1", "task-1", "IN_PROGRESS", 600)
    ).resolves.toEqual({
      completedAt: null,
      id: "task-1",
      state: "IN_PROGRESS"
    });
    await expect(
      reopenTask(db, "user-2", "task-1", "NEXT", 700)
    ).resolves.toBeNull();
    await expect(
      reopenTask(db, "user-1", "task-1", "DONE", 700)
    ).resolves.toBeNull();
  });
});
