import {
  buildViewerTaskBuckets,
  createList,
  createTask,
  getListById,
  getTaskById,
  getViewerById,
  type ListColor,
  listListsByUserId,
  type ListRecord,
  listSubtasksByParentId,
  listTasksByListId,
  listTasksByUserId,
  listTaskUpdatesByTaskId,
  type TaskRecord
} from "@todoabl/db/queries";
import type { Resolvers } from "@todoabl/graphql/server";

import type { AppContext } from "./context";
import {
  invalidInputError,
  notImplementedError,
  requireUserId,
  unauthorizedError
} from "./graphql-errors";
import {
  toIsoString,
  toTaskListNode,
  toTaskNode,
  toTaskUpdateNode,
  toTimestamp
} from "./graphql-mappers";
import { DateTime } from "./graphql-scalars";

export const graphqlResolvers: Resolvers<AppContext> = {
  DateTime,
  Mutation: {
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
    createTask: async (_parent, _args, context) => {
      const userId = requireUserId(context);
      const title = _args.input.title.trim();

      if (!title) {
        throw invalidInputError("Task title is required.");
      }

      const created = await createTask(context.env.DB, userId, {
        deadlineAt: toTimestamp(_args.input.deadlineAt),
        listId: _args.input.listId,
        reminderAt: toTimestamp(_args.input.reminderAt),
        startAt: toTimestamp(_args.input.startAt),
        title
      });

      if (!created) {
        throw invalidInputError("List not found.");
      }

      return {
        list: toTaskListNode(created.list),
        task: toTaskNode(created.task)
      };
    }
  },
  Query: {
    list: async (_parent, args, context) => {
      const list = await getListById(
        context.env.DB,
        requireUserId(context),
        args.id
      );
      return list ? toTaskListNode(list) : null;
    },
    task: async (_parent, args, context) => {
      const task = await getTaskById(
        context.env.DB,
        requireUserId(context),
        args.id
      );
      return task ? toTaskNode(task) : null;
    },
    viewer: async (_parent, _args, context) => {
      const userId = requireUserId(context);
      const [user, lists, tasks] = await Promise.all([
        getViewerById(context.env.DB, userId),
        listListsByUserId(context.env.DB, userId),
        listTasksByUserId(context.env.DB, userId)
      ]);

      if (!user) {
        throw unauthorizedError();
      }

      const buckets = buildViewerTaskBuckets(tasks);

      return {
        email: user.email,
        id: user.id,
        inbox: buckets.inbox.map(toTaskNode),
        lists: lists.map(toTaskListNode),
        today: buckets.today.map(toTaskNode),
        upcoming: buckets.upcoming.map(toTaskNode)
      };
    }
  },
  Task: {
    subtasks: async (task, _args, context) =>
      (
        await listSubtasksByParentId(
          context.env.DB,
          requireUserId(context),
          String(task.id)
        )
      ).map(toTaskNode),
    updates: async (task, _args, context) =>
      (
        await listTaskUpdatesByTaskId(
          context.env.DB,
          requireUserId(context),
          String(task.id)
        )
      ).map(toTaskUpdateNode)
  },
  TaskList: {
    tasks: async (list, args, context) =>
      (
        await listTasksByListId(
          context.env.DB,
          requireUserId(context),
          String(list.id),
          args.includeCompleted,
          args.state
        )
      ).map(toTaskNode)
  }
};
