import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonInput,
  IonItem,
  IonLabel,
  IonModal
} from "@ionic/react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

import type { CreateTaskInput, ViewerQueryQuery } from "../graphql/generated";
import type {
  TaskDrawerFormValues} from "./HomeDrawerUtils";
import {
  DateField,
  MutationError,
  toIsoString,
  toMessage
} from "./HomeDrawerUtils";

type ViewerList = ViewerQueryQuery["viewer"]["lists"][number];

export function CreateTaskDrawer({
  isOpen,
  list,
  onDismiss,
  onSubmit
}: {
  isOpen: boolean;
  list: ViewerList;
  onDismiss(): void;
  onSubmit(input: CreateTaskInput): Promise<unknown>;
}) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { control, handleSubmit, reset } = useForm<TaskDrawerFormValues>({
    defaultValues: {
      deadlineAt: "",
      reminderAt: "",
      startAt: "",
      title: ""
    }
  });

  return (
    <IonModal
      breakpoints={[0, 0.65, 0.95]}
      className="home-drawer"
      initialBreakpoint={0.65}
      isOpen={isOpen}
      onDidDismiss={() => {
        setErrorMessage(null);
        onDismiss();
      }}
    >
      <IonCard className="home-card home-drawer-card">
        <IonCardHeader>
          <IonCardTitle>Add to {list.name}</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <form
            className="home-form"
            onSubmit={handleSubmit(async (values) => {
              setErrorMessage(null);

              try {
                await onSubmit({
                  deadlineAt: toIsoString(values.deadlineAt),
                  listId: list.id,
                  reminderAt: toIsoString(values.reminderAt),
                  startAt: toIsoString(values.startAt),
                  title: values.title.trim()
                });
                reset({
                  deadlineAt: "",
                  reminderAt: "",
                  startAt: "",
                  title: ""
                });
              } catch (error) {
                setErrorMessage(toMessage(error));
              }
            })}
          >
            <IonItem>
              <IonLabel position="stacked">Title</IonLabel>
              <Controller
                control={control}
                name="title"
                rules={{ required: true }}
                render={({ field }) => (
                  <IonInput
                    value={field.value}
                    onIonInput={(event) =>
                      field.onChange(event.detail.value ?? "")
                    }
                  />
                )}
              />
            </IonItem>
            <DateField control={control} label="Start" name="startAt" />
            <DateField control={control} label="Reminder" name="reminderAt" />
            <DateField control={control} label="Deadline" name="deadlineAt" />
            <MutationError message={errorMessage} />
            <IonButton expand="block" type="submit">
              Create task
            </IonButton>
            <IonButton expand="block" fill="clear" onClick={onDismiss}>
              Cancel
            </IonButton>
          </form>
        </IonCardContent>
      </IonCard>
    </IonModal>
  );
}
