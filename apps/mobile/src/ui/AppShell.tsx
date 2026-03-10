import {
  ApolloClient,
  ApolloProvider,
  HttpLink,
  InMemoryCache
} from "@apollo/client";
import {
  IonApp,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar
} from "@ionic/react";

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: new HttpLink({
    fetch,
    uri: "/graphql"
  })
});

export function AppShell() {
  return (
    <ApolloProvider client={client}>
      <IonApp>
        <IonPage>
          <IonHeader>
            <IonToolbar>
              <IonTitle>todoabl</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent fullscreen>
            API contract, auth wiring, and generated hooks land next.
          </IonContent>
        </IonPage>
      </IonApp>
    </ApolloProvider>
  );
}
