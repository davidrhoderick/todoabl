import type { AppContext } from "./context";

export type AppBindings = {
  Bindings: Env;
  Variables: {
    appContext: AppContext;
    requestId: string;
    userId: string | null;
  };
};
