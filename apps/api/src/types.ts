export type AppBindings = {
  Bindings: Env;
  Variables: {
    requestId: string;
    userId: string | null;
  };
};
