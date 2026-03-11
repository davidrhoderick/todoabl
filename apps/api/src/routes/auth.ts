import { createRoute, z } from "@hono/zod-openapi";

const authInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const authResponseSchema = z.object({
  expiresAt: z.number().int().positive(),
  sessionToken: z.string().uuid(),
  userId: z.string().uuid()
});

const errorSchema = z.object({
  error: z.string()
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
    },
    409: {
      content: {
        "application/json": {
          schema: errorSchema
        }
      },
      description: "Email is already registered"
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
    },
    401: {
      content: {
        "application/json": {
          schema: errorSchema
        }
      },
      description: "Invalid credentials"
    }
  },
  tags: ["auth"]
});

export const logoutRoute = createRoute({
  method: "post",
  path: "/auth/logout",
  security: [
    {
      bearerAuth: []
    }
  ],
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
  security: [
    {
      bearerAuth: []
    }
  ],
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
