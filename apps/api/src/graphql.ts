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
