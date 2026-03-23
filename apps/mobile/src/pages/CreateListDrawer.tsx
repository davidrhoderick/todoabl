import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonInput,
  IonItem,
  IonLabel,
  IonModal,
  IonSelect,
  IonSelectOption
} from "@ionic/react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

import type { CreateListInput } from "../graphql/generated";
import { ListColor } from "../graphql/generated";
import { formatEnumLabel, MutationError, toMessage } from "./HomeDrawerUtils";

const listColors: NonNullable<CreateListInput["color"]>[] = [
  ListColor.Blue,
  ListColor.Gray,
  ListColor.Green,
  ListColor.Orange,
  ListColor.Pink,
  ListColor.Purple,
  ListColor.Red,
  ListColor.Yellow
];

type CreateListFormValues = {
  color: CreateListInput["color"];
  name: string;
};

export function CreateListDrawer({
  isOpen,
  onDismiss,
  onSubmit
}: {
  isOpen: boolean;
  onDismiss(): void;
  onSubmit(input: CreateListInput): Promise<unknown>;
}) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { control, handleSubmit, reset } = useForm<CreateListFormValues>({
    defaultValues: { color: ListColor.Blue, name: "" }
  });

  return (
    <IonModal
      breakpoints={[0, 0.55, 0.85]}
      className="home-drawer"
      initialBreakpoint={0.55}
      isOpen={isOpen}
      onDidDismiss={() => {
        setErrorMessage(null);
        onDismiss();
      }}
    >
      <IonCard className="home-card home-drawer-card">
        <IonCardHeader>
          <IonCardTitle>Create List</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <form
            className="home-form"
            onSubmit={handleSubmit(async (values) => {
              setErrorMessage(null);

              try {
                await onSubmit({
                  color: values.color ?? undefined,
                  name: values.name.trim()
                });
                reset({ color: values.color, name: "" });
              } catch (error) {
                setErrorMessage(toMessage(error));
              }
            })}
          >
            <IonItem>
              <IonLabel position="stacked">Name</IonLabel>
              <Controller
                control={control}
                name="name"
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
            <IonItem>
              <IonLabel position="stacked">Color</IonLabel>
              <Controller
                control={control}
                name="color"
                render={({ field }) => (
                  <IonSelect
                    interface="popover"
                    value={field.value}
                    onIonChange={(event) => field.onChange(event.detail.value)}
                  >
                    {listColors.map((color) => (
                      <IonSelectOption key={color} value={color}>
                        {formatEnumLabel(color)}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                )}
              />
            </IonItem>
            <MutationError message={errorMessage} />
            <IonButton expand="block" type="submit">
              Create list
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
