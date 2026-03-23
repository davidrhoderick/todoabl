import "./Home.css";

import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonPage,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar
} from "@ionic/react";
import { useState } from "react";

import { useAuth } from "../auth/AuthProvider";
import {
  useCompleteTaskMutation,
  useCreateListMutation,
  useCreateTaskMutation,
  useReopenTaskMutation,
  useViewerQueryQuery,
  ViewerQueryDocument
} from "../graphql/generated";
import { CreateListDrawer } from "./CreateListDrawer";
import { BucketCard, ListsCard } from "./HomeSections";

const Home: React.FC = () => {
  const { logout } = useAuth();
  const [isCreateListOpen, setIsCreateListOpen] = useState(false);
  const { data, error, loading } = useViewerQueryQuery();
  const [createList] = useCreateListMutation({
    refetchQueries: [{ query: ViewerQueryDocument }]
  });
  const [createTask] = useCreateTaskMutation({
    refetchQueries: [{ query: ViewerQueryDocument }]
  });
  const [completeTask] = useCompleteTaskMutation({
    refetchQueries: [{ query: ViewerQueryDocument }]
  });
  const [reopenTask] = useReopenTaskMutation({
    refetchQueries: [{ query: ViewerQueryDocument }]
  });

  if (loading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Today</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen className="home-page ion-padding">
          <div className="home-loading">
            <IonSpinner name="crescent" />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (error || !data) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Today</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen className="home-page ion-padding">
          <IonCard className="home-card">
            <IonCardHeader>
              <IonCardTitle>Unable to load your workspace</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonText color="danger">
                <p>{error?.message ?? "Viewer data is unavailable."}</p>
              </IonText>
              <IonButton expand="block" onClick={() => void logout()}>
                Logout
              </IonButton>
            </IonCardContent>
          </IonCard>
        </IonContent>
      </IonPage>
    );
  }

  const { viewer } = data;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Today</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => void logout()}>Logout</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="home-page ion-padding">
        <section className="home-hero">
          <IonText color="medium">
            <p>{viewer.email}</p>
          </IonText>
          <IonText>
            <h1>Capture what matters. Move what is actionable.</h1>
          </IonText>
          <IonButton
            className="home-primary-action"
            onClick={() => setIsCreateListOpen(true)}
          >
            Add list
          </IonButton>
        </section>

        <section className="home-grid">
          <BucketCard
            emptyMessage="Nothing is waiting in your inbox."
            tasks={viewer.inbox}
            title="Inbox"
          />
          <BucketCard
            emptyMessage="You have no scheduled work for today."
            tasks={viewer.today}
            title="Today"
          />
          <BucketCard
            emptyMessage="Nothing is queued up next."
            tasks={viewer.upcoming}
            title="Upcoming"
          />
          <ListsCard
            lists={viewer.lists}
            onCreateTask={(input) => createTask({ variables: { input } })}
            onComplete={(id) => completeTask({ variables: { input: { id } } })}
            onReopen={(id, state) =>
              reopenTask({ variables: { input: { id, state } } })
            }
          />
        </section>
        <CreateListDrawer
          isOpen={isCreateListOpen}
          onDismiss={() => setIsCreateListOpen(false)}
          onSubmit={async (input) => {
            await createList({ variables: { input } });
            setIsCreateListOpen(false);
          }}
        />
      </IonContent>
    </IonPage>
  );
};

export default Home;
