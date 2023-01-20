// import { readableStreamFromIterable, wait } from "./util";

export interface Env {
  lambdas: DurableObjectNamespace;
}

const routes = [
  {
    pattern: new URLPattern({
      pathname: "/api/*",
    }),
    handler: handleApi,
  },
  {
    // Accept incoming socket connections from our lambda inside AWS
    // In the real world this would likely be a seperate worker that's not available to the public
    pattern: new URLPattern({
      pathname: "/socket/:id",
    }),
    handler: handleSocket,
  },
];

function handleApi(request: Request, env: Env): Promise<Response> {
  const lambda = env.lambdas.get(env.lambdas.newUniqueId());
  return lambda.fetch(request);
}

function handleSocket(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
  match: URLPatternURLPatternResult
): Promise<Response> | Response {
  const socketId = match.pathname.groups.id;
  if (socketId === undefined) {
    return new Response("expected a socket id", { status: 400 });
  }

  const lambda = env.lambdas.get(env.lambdas.idFromName(socketId));
  return lambda.fetch(request);
}

export default {
  fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> | Response {
    const url = new URL(request.url);
    for (const { pattern, handler } of routes) {
      const match = pattern.exec(url);
      if (match) {
        return handler(request, env, ctx, match);
      }
    }
    return new Response("Not Found", { status: 404 });
  },
};

export class Lambda implements DurableObject {
  constructor(private state: DurableObjectState) {}

  async fetch(request: Request) {}
}
