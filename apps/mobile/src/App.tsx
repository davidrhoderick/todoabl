import "@ionic/react/css/core.css";
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";
import "@ionic/react/css/palettes/dark.system.css";
import "./theme/variables.css";

import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  HttpLink,
  InMemoryCache
} from "@apollo/client";
import { IonApp, IonRouterOutlet, setupIonicReact } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { Redirect, Route } from "react-router-dom";

import { AuthProvider } from "./auth/AuthProvider";
import { getStoredSessionToken } from "./auth/session-token";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthPage } from "./pages/AuthPage";
import Home from "./pages/Home";

setupIonicReact();

const client = new ApolloClient({
  cache: new InMemoryCache({
    typePolicies: {
      Task: { keyFields: ["id"] },
      TaskList: { keyFields: ["id"] }
    }
  }),
  link: ApolloLink.from([
    new ApolloLink((operation, forward) => {
      const sessionToken = getStoredSessionToken();

      operation.setContext(({ headers = {} }) => ({
        headers: sessionToken
          ? { ...headers, authorization: `Bearer ${sessionToken}` }
          : headers
      }));

      return forward(operation);
    }),
    new HttpLink({
      fetch,
      uri: "/graphql"
    })
  ])
});

const App: React.FC = () => {
  return (
    <ApolloProvider client={client}>
      <AuthProvider>
        <IonApp>
          <IonReactRouter>
            <IonRouterOutlet>
              <Route exact path="/auth">
                <AuthPage />
              </Route>
              <ProtectedRoute exact path="/home">
                <Home />
              </ProtectedRoute>
              <Route exact path="/">
                <Redirect to="/home" />
              </Route>
            </IonRouterOutlet>
          </IonReactRouter>
        </IonApp>
      </AuthProvider>
    </ApolloProvider>
  );
};

export default App;
