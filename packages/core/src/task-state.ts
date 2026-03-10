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
