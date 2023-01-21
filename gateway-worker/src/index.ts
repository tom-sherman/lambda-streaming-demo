// import { readableStreamFromIterable, wait } from "./util";

import { createMachine, interpret, Interpreter } from "xstate";
import { waitFor } from "xstate/lib/waitFor";
import { lambdaMachine } from "./lambdaMachine";

export interface Env {
  lambdas: DurableObjectNamespace;
}

const routes = [
  {
    pattern: new URLPattern({
      pathname: "/api/*",
    }),
    handler: handleApi,
    key: "api",
  },
  {
    // Accept incoming socket connections from our lambda inside AWS
    // In the real world this would likely be a seperate worker that's not available to the public
    pattern: new URLPattern({
      pathname: "/socket/:id",
    }),
    handler: handleSocket,
    key: "socket",
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
  id: DurableObjectId;
  actor: Interpreter<any, any, any, any>;

  constructor({ id }: DurableObjectState) {
    this.id = id;
    this.actor = interpret(lambdaMachine).start();
  }

  fetch(request: Request) {
    const url = new URL(request.url);
    for (const { pattern, key } of routes) {
      const match = pattern.exec(url);
      if (!match) continue;
      if (key === "api") {
        return this.handleApi(request, match);
      }

      if (key === "socket") {
        return this.handleSocket(request, match);
      }
    }

    return new Response("Not Found", { status: 404 });
  }

  async handleApi(
    request: Request<unknown>,
    match: URLPatternURLPatternResult
  ): Promise<Response> {
    this.actor.send("incoming request", {
      request,
    });

    // TODO: Tweak timeout
    await waitFor(this.actor, (state) => state.value === "DownloadingBody"); // TODO: Correct state value here (should be fixed when types are correct)

    const { response } = this.actor.state.context;

    return response;
  }

  async handleSocket(
    request: Request<unknown>,
    match: URLPatternURLPatternResult
  ): Promise<Response> {
    const upgradeHeader = request.headers.get("Upgrade");
    if (!upgradeHeader || upgradeHeader !== "websocket") {
      return new Response("Expected Upgrade: websocket", { status: 426 });
    }
    const { 0: client, 1: server } = new WebSocketPair();

    this.actor.send("receive websocket", {
      socket: server,
    });

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }
}
