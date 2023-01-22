import { interpret, InterpreterFrom } from "xstate";
import { waitFor } from "xstate/lib/waitFor";
import { createLambdaMachine } from "./lambdaMachine";
import { Env } from "./types";
import { invariant, jsonResponse } from "./util";

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

  console.log("Handling socket connection", socketId);

  const lambda = env.lambdas.get(env.lambdas.idFromString(socketId));
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
  actor: InterpreterFrom<ReturnType<typeof createLambdaMachine>>;

  constructor(private state: DurableObjectState, env: Env) {
    this.actor = interpret(
      createLambdaMachine(state.id.toString(), env)
    ).start();

    this.actor.onTransition((state, event) => {
      console.log(
        JSON.stringify({
          stamp: new Date().toISOString(),
          event,
          state: state.value,
        })
      );
    });
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

    console.log("Waiting for active", this.state.id.toString());
    await this.state.blockConcurrencyWhile(() =>
      waitFor(this.actor, (state) => state.matches("Active"))
    );
    console.log("actor active");

    // TODO: Tweak timeout
    const state = await Promise.race([
      waitFor(
        this.actor,
        (state) =>
          state.matches(
            "Active.WebsocketRecived.Connected.Response.DownloadingBody"
          ),
        {
          timeout: 30_000,
        }
      ),
      waitFor(this.actor, (state) => state.done === true, {
        timeout: 30_000,
      }),
    ]);

    if (state.matches("Error")) {
      return jsonResponse(state, { status: 503 });
    }

    const { res } = state.context;

    invariant(!!res, "Expected a response in context");

    return res.response;
  }

  async handleSocket(
    request: Request<unknown>,
    match: URLPatternURLPatternResult
  ): Promise<Response> {
    const state = this.actor.getSnapshot();
    console.log(
      "handling socket while in state",
      state.value,
      this.state.id.toString()
    );
    if (!state.matches("Active.Connecting")) {
      return new Response("Not ready", { status: 503 });
    }
    const upgradeHeader = request.headers.get("Upgrade");
    if (!upgradeHeader || upgradeHeader !== "websocket") {
      return new Response("Expected Upgrade: websocket", { status: 426 });
    }
    const { 0: client, 1: server } = new WebSocketPair();
    server.accept();
    this.actor.send("receive websocket", {
      socket: server,
    });

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }
}
