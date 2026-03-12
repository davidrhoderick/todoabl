import { buildViewerTaskBuckets } from "@todoabl/db/queries";
import { describe, expect, it } from "vitest";

describe("viewer task buckets", () => {
  it("builds inbox, today, and upcoming buckets from scheduled fields", () => {
    const buckets = buildViewerTaskBuckets(
      [
        {
          id: "inbox",
          listId: "list-1",
          title: "Inbox task",
          state: "INBOX",
          startAt: null,
          reminderAt: null,
          deadlineAt: null,
          completedAt: null,
          parentTaskId: null,
          notes: null,
          createdAt: 1
        },
        {
          id: "today",
          listId: "list-1",
          title: "Today task",
          state: "NEXT",
          startAt: Date.UTC(2026, 2, 12, 12),
          reminderAt: null,
          deadlineAt: null,
          completedAt: null,
          parentTaskId: null,
          notes: null,
          createdAt: 2
        },
        {
          id: "upcoming",
          listId: "list-1",
          title: "Upcoming task",
          state: "NEXT",
          startAt: Date.UTC(2026, 2, 13, 12),
          reminderAt: null,
          deadlineAt: null,
          completedAt: null,
          parentTaskId: null,
          notes: null,
          createdAt: 3
        }
      ],
      Date.UTC(2026, 2, 12, 8)
    );

    expect(buckets.inbox.map((task) => task.id)).toEqual(["inbox"]);
    expect(buckets.today.map((task) => task.id)).toEqual(["today"]);
    expect(buckets.upcoming.map((task) => task.id)).toEqual(["upcoming"]);
  });
});
