import { IonInput, IonItem, IonLabel, IonText } from "@ionic/react";
import type { useForm } from "react-hook-form";
import { Controller } from "react-hook-form";

export type TaskDrawerFormValues = {
  deadlineAt: string;
  reminderAt: string;
  startAt: string;
  title: string;
};

export function DateField({
  control,
  label,
  name
}: {
  control: ReturnType<typeof useForm<TaskDrawerFormValues>>["control"];
  label: string;
  name: keyof Pick<
    TaskDrawerFormValues,
    "deadlineAt" | "reminderAt" | "startAt"
  >;
}) {
  return (
    <IonItem>
      <IonLabel position="stacked">{label}</IonLabel>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <IonInput
            type="datetime-local"
            value={field.value}
            onIonInput={(event) => field.onChange(event.detail.value ?? "")}
          />
        )}
      />
    </IonItem>
  );
}

export function MutationError({ message }: { message: string | null }) {
  if (!message) {
    return null;
  }

  return (
    <IonText color="danger">
      <p>{message}</p>
    </IonText>
  );
}

export function formatEnumLabel(value: string) {
  return value.replaceAll("_", " ").toLowerCase();
}

export function toIsoString(value: string) {
  if (!value) {
    return undefined;
  }

  return new Date(value).toISOString();
}

export function toMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}
