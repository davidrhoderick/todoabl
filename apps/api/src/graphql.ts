import type { AppContext } from "./context";

const schemaPreview = `
type Query {
  viewer: Viewer!
}

type Viewer {
  id: ID!
}
`;

export async function handleGraphQL(
  request: Request,
  context: AppContext
): Promise<Response> {
  if (request.method === "GET") {
    return new Response(buildGraphQLPage(), {
      headers: { "content-type": "text/html; charset=utf-8" }
    });
  }

  if (!context.userId) {
    return Response.json(
      { errors: [{ message: "Unauthorized" }] },
      { status: 401 }
    );
  }

  if (request.method !== "POST") {
    return new Response(schemaPreview, {
      headers: { "content-type": "text/plain; charset=utf-8" }
    });
  }

  return Response.json({
    data: {
      viewer: {
        id: context.userId
      }
    }
  });
}

function buildGraphQLPage(): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>todoabl graphiql</title>
    <link
      rel="stylesheet"
      href="https://unpkg.com/graphiql/graphiql.min.css"
    />
    <style>
      body {
        margin: 0;
        background: #f3efe8;
      }

      #graphiql {
        height: 100vh;
      }
    </style>
    <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/graphiql/graphiql.min.js"></script>
  </head>
  <body>
    <div id="graphiql"></div>
    <script>
      const fetcher = GraphiQL.createFetcher({
        url: window.location.origin + "/graphql"
      });

      const root = ReactDOM.createRoot(document.getElementById("graphiql"));
      root.render(
        React.createElement(GraphiQL, {
          defaultEditorToolsVisibility: true,
          fetcher,
          headers: JSON.stringify(
            { Authorization: "Bearer " },
            null,
            2
          ),
          shouldPersistHeaders: true
        })
      );
    </script>
  </body>
</html>`;
}
