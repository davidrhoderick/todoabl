export const taskStates = [
  "INBOX",
  "NEXT",
  "IN_PROGRESS",
  "WAITING",
  "SOMEDAY",
  "DONE",
  "CANCELED"
] as const;

export type TaskState = (typeof taskStates)[number];

export function isTerminalTaskState(state: TaskState): boolean {
  return state === "DONE" || state === "CANCELED";
}

export function transitionTaskState(
  currentState: TaskState,
  nextState: TaskState,
  currentCompletedAt: number | null,
  now = Date.now()
) {
  if (currentState === "CANCELED" && nextState === "DONE") {
    return null;
  }

  if (nextState === "DONE") {
    return { completedAt: currentCompletedAt ?? now, state: nextState };
  }

  if (currentState === "DONE") {
    return { completedAt: null, state: nextState };
  }

  return { completedAt: currentCompletedAt, state: nextState };
}
