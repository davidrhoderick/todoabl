import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonList,
  IonText
} from "@ionic/react";
import { useState } from "react";

import type { CreateTaskInput, ViewerQueryQuery } from "../graphql/generated";
import type { TaskState } from "../graphql/generated";
import { CreateTaskDrawer } from "./CreateTaskDrawer";
import { MutableTaskRow, TaskSummaryRow } from "./HomeTaskRows";

type ViewerData = ViewerQueryQuery["viewer"];
type ViewerList = ViewerData["lists"][number];
type ViewerTask = ViewerList["tasks"][number];

export function BucketCard({
  emptyMessage,
  tasks,
  title
}: {
  emptyMessage: string;
  tasks: ViewerData["inbox"];
  title: string;
}) {
  return (
    <IonCard className="home-card">
      <IonCardHeader>
        <IonCardTitle>{title}</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        {tasks.length === 0 ? (
          <IonText color="medium">
            <p>{emptyMessage}</p>
          </IonText>
        ) : (
          <IonList inset={false} lines="none">
            {tasks.map((task) => (
              <TaskSummaryRow key={task.id} task={task} />
            ))}
          </IonList>
        )}
      </IonCardContent>
    </IonCard>
  );
}

export function ListsCard({
  lists,
  onCreateTask,
  onComplete,
  onReopen
}: {
  lists: ViewerList[];
  onCreateTask(input: CreateTaskInput): Promise<unknown>;
  onComplete(id: string): Promise<unknown>;
  onReopen(id: string, state: TaskState): Promise<unknown>;
}) {
  return (
    <>
      {lists.map((list) => (
        <IonCard key={list.id} className="home-card">
          <IonCardHeader>
            <IonCardTitle>{list.name}</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonText color="medium">
              <p>
                {countActiveTasks(list.tasks)} active,{" "}
                {countDoneTasks(list.tasks)} completed
              </p>
            </IonText>
            {list.tasks.length === 0 ? (
              <IonText color="medium">
                <p>No tasks in this list yet.</p>
              </IonText>
            ) : (
              <IonList inset={false} lines="full">
                {list.tasks.map((task) => (
                  <MutableTaskRow
                    key={task.id}
                    task={task}
                    onComplete={onComplete}
                    onReopen={onReopen}
                  />
                ))}
              </IonList>
            )}
            <ListTaskActions list={list} onCreateTask={onCreateTask} />
          </IonCardContent>
        </IonCard>
      ))}
    </>
  );
}

function ListTaskActions({
  list,
  onCreateTask
}: {
  list: ViewerList;
  onCreateTask(input: CreateTaskInput): Promise<unknown>;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <IonButton
        className="list-add-button"
        fill="outline"
        onClick={() => setIsOpen(true)}
      >
        Add task
      </IonButton>
      <CreateTaskDrawer
        isOpen={isOpen}
        list={list}
        onDismiss={() => setIsOpen(false)}
        onSubmit={async (input) => {
          await onCreateTask(input);
          setIsOpen(false);
        }}
      />
    </>
  );
}

function countActiveTasks(tasks: ViewerTask[]) {
  return tasks.filter((task) => task.state !== "DONE").length;
}

function countDoneTasks(tasks: ViewerTask[]) {
  return tasks.filter((task) => task.state === "DONE").length;
}
