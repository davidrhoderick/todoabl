import {
  completeTask,
  createList,
  createTask,
  getTaskById,
  reopenTask
} from "@todoabl/db/queries";
import type { Resolvers } from "@todoabl/graphql/server";

import type { AppContext } from "./context";
import { invalidInputError, requireUserId } from "./graphql-errors";
import { toTaskListNode, toTaskNode, toTimestamp } from "./graphql-mappers";

export const taskMutations: NonNullable<Resolvers<AppContext>["Mutation"]> = {
  createList: async (_parent, args, context) => {
    const userId = requireUserId(context);
    const name = args.input.name.trim();

    if (!name) {
      throw invalidInputError("List name is required.");
    }

    const list = await createList(context.env.DB, userId, {
      color: args.input.color ?? null,
      name
    });

    return { list: toTaskListNode(list) };
  },
  createTask: async (_parent, args, context) => {
    const userId = requireUserId(context);
    const title = args.input.title.trim();

    if (!title) {
      throw invalidInputError("Task title is required.");
    }

    const created = await createTask(context.env.DB, userId, {
      deadlineAt: toTimestamp(args.input.deadlineAt),
      listId: args.input.listId,
      reminderAt: toTimestamp(args.input.reminderAt),
      startAt: toTimestamp(args.input.startAt),
      title
    });

    if (!created) {
      throw invalidInputError("List not found.");
    }

    return {
      list: toTaskListNode(created.list),
      task: toTaskNode(created.task)
    };
  },
  completeTask: async (_parent, args, context) => {
    const userId = requireUserId(context);
    const task = await completeTask(context.env.DB, userId, args.input.id);

    if (!task) {
      throw invalidInputError("Task not found.");
    }

    const fullTask = await getTaskById(context.env.DB, userId, task.id);
    if (!fullTask) {
      throw invalidInputError("Task not found.");
    }

    return { task: toTaskNode(fullTask) };
  },
  reopenTask: async (_parent, args, context) => {
    const userId = requireUserId(context);
    const task = await reopenTask(
      context.env.DB,
      userId,
      args.input.id,
      args.input.state
    );

    if (!task) {
      throw invalidInputError("Task could not be reopened.");
    }

    const fullTask = await getTaskById(context.env.DB, userId, task.id);
    if (!fullTask) {
      throw invalidInputError("Task not found.");
    }

    return { task: toTaskNode(fullTask) };
  }
};
