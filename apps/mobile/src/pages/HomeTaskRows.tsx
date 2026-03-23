import {
  IonBadge,
  IonButton,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonText
} from "@ionic/react";
import { useState } from "react";

import type { ViewerQueryQuery } from "../graphql/generated";
import { TaskState } from "../graphql/generated";

type ViewerTask = ViewerQueryQuery["viewer"]["lists"][number]["tasks"][number];
type BucketTask = ViewerQueryQuery["viewer"]["inbox"][number];

const reopenStates: TaskState[] = [
  TaskState.Inbox,
  TaskState.Next,
  TaskState.InProgress,
  TaskState.Waiting,
  TaskState.Someday
];

export function MutableTaskRow({
  onComplete,
  onReopen,
  task
}: {
  onComplete(id: string): Promise<unknown>;
  onReopen(id: string, state: TaskState): Promise<unknown>;
  task: ViewerTask;
}) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [nextState, setNextState] = useState<TaskState>(TaskState.Next);

  return (
    <IonItem>
      <IonLabel>
        <h3>{task.title}</h3>
        <p>{formatSchedule(task)}</p>
        <p>{formatState(task.state)}</p>
        <MutationError message={errorMessage} />
      </IonLabel>
      {task.state === TaskState.Done ? (
        <div className="task-actions">
          <IonSelect
            interface="popover"
            value={nextState}
            onIonChange={(event) =>
              setNextState(event.detail.value as TaskState)
            }
          >
            {reopenStates.map((state) => (
              <IonSelectOption key={state} value={state}>
                {formatState(state)}
              </IonSelectOption>
            ))}
          </IonSelect>
          <IonButton
            size="small"
            onClick={async () => {
              setErrorMessage(null);

              try {
                await onReopen(task.id, nextState);
              } catch (error) {
                setErrorMessage(toMessage(error));
              }
            }}
          >
            Reopen
          </IonButton>
        </div>
      ) : (
        <IonButton
          size="small"
          onClick={async () => {
            setErrorMessage(null);

            try {
              await onComplete(task.id);
            } catch (error) {
              setErrorMessage(toMessage(error));
            }
          }}
        >
          Complete
        </IonButton>
      )}
    </IonItem>
  );
}

export function TaskSummaryRow({ task }: { task: BucketTask }) {
  return (
    <IonItem>
      <IonLabel>
        <h3>{task.title}</h3>
        <p>{formatSchedule(task)}</p>
      </IonLabel>
      <IonBadge color={toTaskBadgeColor(task.state)}>
        {formatState(task.state)}
      </IonBadge>
    </IonItem>
  );
}

function MutationError({ message }: { message: string | null }) {
  if (!message) {
    return null;
  }

  return (
    <IonText color="danger">
      <p>{message}</p>
    </IonText>
  );
}

function formatSchedule(task: {
  completedAt?: unknown;
  deadlineAt?: unknown;
  reminderAt?: unknown;
  startAt?: unknown;
}) {
  if (task.completedAt != null) {
    return `Completed ${formatDate(task.completedAt)}`;
  }

  const value = task.startAt ?? task.reminderAt ?? task.deadlineAt;
  return value == null ? "No schedule yet" : formatDate(value);
}

function formatDate(value: unknown) {
  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    month: "short"
  }).format(new Date(String(value)));
}

function formatState(state: string) {
  return state.replaceAll("_", " ").toLowerCase();
}

function toMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}

function toTaskBadgeColor(state: TaskState) {
  switch (state) {
    case TaskState.InProgress:
      return "warning";
    case TaskState.Done:
      return "success";
    case TaskState.Waiting:
      return "medium";
    case TaskState.Someday:
      return "tertiary";
    default:
      return "primary";
  }
}
