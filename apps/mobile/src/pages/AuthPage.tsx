import {
  IonButton,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
  IonSegment,
  IonSegmentButton,
  IonText,
  IonTitle,
  IonToolbar
} from "@ionic/react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Redirect } from "react-router-dom";

import { useAuth } from "../auth/AuthProvider";

type AuthFormValues = {
  email: string;
  password: string;
};

export function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { errorMessage, isAuthenticated, login, register } = useAuth();
  const { control, handleSubmit } = useForm<AuthFormValues>({
    defaultValues: { email: "", password: "" }
  });

  if (isAuthenticated) {
    return <Redirect to="/home" />;
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>todoabl</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <IonCard>
          <IonCardContent>
            <IonSegment
              value={mode}
              onIonChange={(event) =>
                setMode((event.detail.value as "login" | "register") ?? "login")
              }
            >
              <IonSegmentButton value="login">
                <IonLabel>Login</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="register">
                <IonLabel>Register</IonLabel>
              </IonSegmentButton>
            </IonSegment>
            <form
              onSubmit={handleSubmit(async (values) => {
                setIsSubmitting(true);

                try {
                  if (mode === "login") {
                    await login(values);
                  } else {
                    await register(values);
                  }
                } finally {
                  setIsSubmitting(false);
                }
              })}
            >
              <IonItem>
                <IonLabel position="stacked">Email</IonLabel>
                <Controller
                  control={control}
                  name="email"
                  rules={{ required: true }}
                  render={({ field }) => (
                    <IonInput
                      type="email"
                      value={field.value}
                      onIonInput={(event) =>
                        field.onChange(event.detail.value ?? "")
                      }
                    />
                  )}
                />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Password</IonLabel>
                <Controller
                  control={control}
                  name="password"
                  rules={{ required: true, minLength: 8 }}
                  render={({ field }) => (
                    <IonInput
                      type="password"
                      value={field.value}
                      onIonInput={(event) =>
                        field.onChange(event.detail.value ?? "")
                      }
                    />
                  )}
                />
              </IonItem>
              {errorMessage ? (
                <IonText color="danger">
                  <p>{errorMessage}</p>
                </IonText>
              ) : null}
              <IonButton expand="block" type="submit" disabled={isSubmitting}>
                {mode === "login" ? "Login" : "Create account"}
              </IonButton>
            </form>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
}
