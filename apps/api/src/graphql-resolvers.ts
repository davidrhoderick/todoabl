import {
  buildViewerTaskBuckets,
  getListById,
  getTaskById,
  getViewerById,
  listListsByUserId,
  listSubtasksByParentId,
  listTasksByListId,
  listTasksByUserId,
  listTaskUpdatesByTaskId,
  type TaskRecord
} from "@todoabl/db/queries";
import type { Resolvers } from "@todoabl/graphql/server";

import type { AppContext } from "./context";
import { requireUserId, unauthorizedError } from "./graphql-errors";
import {
  toTaskListNode,
  toTaskNode,
  toTaskUpdateNode
} from "./graphql-mappers";
import { DateTime } from "./graphql-scalars";
import { taskMutations } from "./graphql-task-mutations";

export const graphqlResolvers: Resolvers<AppContext> = {
  DateTime,
  Mutation: taskMutations,
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
