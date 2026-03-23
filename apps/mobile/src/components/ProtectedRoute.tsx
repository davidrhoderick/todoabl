import { IonContent, IonPage, IonSpinner } from "@ionic/react";
import type { PropsWithChildren, ReactNode } from "react";
import type { RouteProps } from "react-router-dom";
import { Redirect, Route } from "react-router-dom";

import { useAuth } from "../auth/AuthProvider";

type ProtectedRouteProps = PropsWithChildren<Omit<RouteProps, "children">>;

export function ProtectedRoute({
  children,
  ...routeProps
}: ProtectedRouteProps) {
  const { isAuthenticated, isReady } = useAuth();

  return (
    <Route
      {...routeProps}
      render={() => {
        if (!isReady) {
          return (
            <IonPage>
              <IonContent className="ion-padding">
                <IonSpinner name="crescent" />
              </IonContent>
            </IonPage>
          );
        }

        if (!isAuthenticated) {
          return <Redirect to="/auth" />;
        }

        return children as ReactNode;
      }}
    />
  );
}
