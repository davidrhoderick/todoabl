import { createRoute, z } from "@hono/zod-openapi";

const authInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const authResponseSchema = z.object({
  sessionToken: z.string().uuid(),
  userId: z.string().uuid()
});

const sessionSchema = z.object({
  authenticated: z.boolean(),
  userId: z.string().uuid().nullable()
});

export const registerRoute = createRoute({
  method: "post",
  path: "/auth/register",
  request: {
    body: {
      content: {
        "application/json": {
          schema: authInputSchema
        }
      }
    }
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: authResponseSchema
        }
      },
      description: "Register and create a session"
    }
  },
  tags: ["auth"]
});

export const loginRoute = createRoute({
  method: "post",
  path: "/auth/login",
  request: {
    body: {
      content: {
        "application/json": {
          schema: authInputSchema
        }
      }
    }
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: authResponseSchema
        }
      },
      description: "Login and create a session"
    }
  },
  tags: ["auth"]
});

export const logoutRoute = createRoute({
  method: "post",
  path: "/auth/logout",
  responses: {
    200: {
      description: "Logout and invalidate the current session"
    }
  },
  tags: ["auth"]
});

export const sessionRoute = createRoute({
  method: "get",
  path: "/auth/session",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: sessionSchema
        }
      },
      description: "Current session state"
    }
  },
  tags: ["auth"]
});
