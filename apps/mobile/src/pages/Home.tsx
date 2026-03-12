import {
  IonButton,
  IonContent,
  IonHeader,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar
} from "@ionic/react";

import { useAuth } from "../auth/AuthProvider";
import { useViewerQueryQuery } from "../graphql/generated";

const Home: React.FC = () => {
  const { logout, userId } = useAuth();
  const { data, error, loading } = useViewerQueryQuery();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Protected</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <IonText>
          <h2>Browser auth smoke test</h2>
          <p>Local user id: {userId}</p>
          <p>
            Viewer email:{" "}
            {data?.viewer.email ?? (loading ? "Loading..." : "Unavailable")}
          </p>
        </IonText>
        {error ? (
          <IonText color="danger">
            <p>{error.message}</p>
          </IonText>
        ) : null}
        <IonButton expand="block" onClick={() => void logout()}>
          Logout
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default Home;
