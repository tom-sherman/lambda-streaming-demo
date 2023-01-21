import { assign, createMachine } from "xstate";
import { Env } from "./types";
import { invariant } from "./util";

const decoder = new TextDecoder();
const encoder = new TextEncoder();

export function createLambdaMachine(socketId: string, env: Env) {
  /** @xstate-layout N4IgpgJg5mDOIC5QBsCGBbARhVA6AkhMmAMQCWAdgMYD26lUABAE5gCOArnAC4DaADAF1EoAA41YZbmRoURIAB6IAtAEZ+AdgAsufgE5+ADkMA2Y3tVaArABoQATxXXDuAMwAmVRatXD79xqGWgC+wXZoWDi4AIJU0gBupBCyYLiU8TQA1qkR2HixCWAI6TRUqNKyAoJV8uKSFXJIiohaqla4eq5WrqqG+q5aGpZado4IfjoBvkN9Vr0+oeEYeTFxZIkkYMzMNMy4omjcAGa76Li5UQXrRSVlDVU1TXVSMo2gSgiqXhpuVibuXT0cw0-ACoxU7kMrlwGgsWkMen+QRMWncixAF3ya0SuAAwrIKGA1hQoCRWFQwNdGAB3MCYWClbJ8IS1CQvWTyD7KQaqXBWWHuAyufhaVwmVwacEIZTClzuMwi7QaEEeVTozGrQq4ADqdIZVCZACUidcICR9UzGFsdsxHmI2Q1OYhVO4-rpRUMgfM5qopapxbhVF1tHp-Pyw+rlpdsaldfTGWBuMaqKbzQnuIwqMgJJA7SBno6mh8XVo9LgTGYQaGEdYrCMHIgTLytNYNP8rAY4T4rJHIlitXGLYnk6a8QSidISWmDYnM+O4nmC68ndLuiZA6WJWZBv5+LYG9KzB15d0fAM655DL2VlccYP0yPEhAxxRCXFILhjZweLgAKoHGhUAgBgyXYLhYAzTAaAgew53QA5EzARcHWXItEEFdoXX4EwgXlIwenrMZrGhV13C0SstCMNs1TCDEo37a4dT1B8TSfF8324D8v3A7g-wAoCQPJSlEhYMCeEzAALDgKEyZD6lQ950OMct4S+IIrD3XwTClMjeVdPoTE0psVRCWiNVvWNmJnJNWI-fFXwnLixIgvjswEqdWG-CDGCgmCrW2XY5PZN5mk+AF3DcSirHlLpfH4AYpWFCKUSMHx3FBQYNAWMz6M1Rj72sx87PnTjn2NWBxAoWBY1QF4SQAMV2AAJMAgK2WBQIpKlWAq2RqsYCTWogdqgsLRTpVFHRa34dQvFS2FErFXB5VdOsK2mUFr2jAcrKNWzn3sjinN6qrUgAERoakKDc4CSQAIWg+xQJO-rfNg2h4OITjRoU0K1BBcscJwjDIVdbSDz8CLlQ7dT-G0botoYu9duHfb2Mcsq4Eq6rcAuq6boYB6YM64SwFEl6yaoKSZJ+jk0NXHQgy+DSO30OHTB03xdDbGa9D51xhRMbLaIoaC4HkTFWXkunxrUF0Iv0IxTHMSx9zGZQUuWiU21hboAUGRGCCIMApeClc1FBaEQVaCteksS8pWUNKYW1ps2n5zxDYs02xr+wwNGhUtBg7SiglMX0D25VEYQVaLDCDAZ-a9mN0eJKAfd+rksrLUUm3ivQgksLLHchdpBUsYxVVbPRk52+NCv2jOZb911cCD7PQ-hJsS-ituT1DkFDF8K8cr7PLkfrvaUzYw6JwYJuQqzgFy1hHCvnFYwgkdo9QyF2Lz1RXpa-ylGbOn4qHPfCAF-N5UfnbkOjC7iP1fXbR0vS+O20hCw0VHm8U4FSnqOWeV9PzOW4DfemZF+AqXjr0awmlTCuD9N0GEcVLD6FZgEY+E8hxnxASVJyXleL-gJiSKB40Bg6H0BoeUWEPDWESjhDosIgzwk3OXDQuDLKT1RufA6RDMYkPASQ-En1EKUNCuKXkQsQQBxPJCcGRFtCsIMHWJU8VTJLDHhZJifCCEzyEeAimUil45z0MHSxT9w5+gBvyQyccKyIgMNouiujAGnyKoIy+pUTHYxqnVKAjVmAtTasweATwULNy5GYZsliO42O7geMUZZsJ80rjyPo3D-7bRPgY7xqc-HlQCbjS611AK3SgETMY9ppaLxUMMDoooXTaA8ELPQbZmFpJwgXKEWTNCGwAKIBWYGY508p1xeEcR2OJTDI5BhcLCFsdDQyuALgjXJeBxEIU4uMz4qgfiBDMJ4No2hBjKMQH4Xk-BQRniCJ0eUoRQhAA */
  return createMachine(
    {
      predictableActionArguments: true,
      tsTypes: {} as import("./lambdaMachine.typegen").Typegen0,
      schema: {
        context: {} as {
          socket: WebSocket | null;
          request: Request | null;
          res: {
            response: Response;
            bodyStream: WritableStream<Uint8Array>;
          } | null;
        },
        events: {} as
          | { type: "incoming request"; request: Request }
          | { type: "receive websocket"; socket: WebSocket }
          | { type: "receive response chunk"; chunk: Uint8Array }
          | { type: "response body complete" }
          | { type: "receive request chunk"; chunk: Uint8Array }
          | {
              type: "receive response headers";
              headers: [string, string][];
              status: number;
              url: string;
            }
          | { type: "request body complete" }
          | { type: "request body error" }
          | { type: "socket connect" }
          | { type: "socket error" }
          | { type: "socket closed" },
      },

      context: {
        socket: null,
        request: null,
        res: null,
      },

      id: "lambda",
      initial: "Idle",

      states: {
        Idle: {
          on: {
            "incoming request": {
              target: "Active",
              actions: "assignRequest",
            },
          },
        },

        Active: {
          initial: "Connecting",

          invoke: {
            src: "establishHTTPConnection",
            onError: "Error",

            // Not sure if this is correct, but it'll do for now.
            // The contentious part is that it probably shouldn't be possible for the http connection to resolve before the websocket connection is even established.
            // A fix here is probably to turn this into a callback actor and handle the "done" event with transitions, probably always route it to the error state.
            onDone: {
              target: "Complete",
              actions: "closeSocket",
            },
          },

          states: {
            Connecting: {
              on: {
                "receive websocket": {
                  target: "WebsocketRecived",
                  actions: "assignWebsocket",
                },
              },
            },

            WebsocketRecived: {
              invoke: {
                src: "socketSubscription",
              },

              initial: "Connecting",

              states: {
                Connecting: {
                  on: {
                    "socket connect": "Connected",
                  },
                },
                Connected: {
                  type: "parallel",

                  invoke: {
                    src: "streamRequestBody",
                  },

                  entry: "sendRequestHeaders",

                  states: {
                    Request: {
                      initial: "Uploading",
                      states: {
                        Uploading: {
                          on: {
                            "request body complete": {
                              target: "RequestComplete",
                              actions: "sendRequestEnd",
                            },

                            "receive request chunk": {
                              target: "Uploading",
                              actions: "sendRequestChunk",
                              internal: true,
                            },

                            "request body error": "#error",
                          },
                        },

                        RequestComplete: {
                          type: "final",
                        },
                      },
                    },
                    Response: {
                      initial: "WaitingForHeaders",
                      states: {
                        WaitingForHeaders: {
                          on: {
                            "receive response headers": {
                              target: "DownloadingBody",
                              actions: "createResponse",
                            },
                          },
                        },
                        DownloadingBody: {
                          on: {
                            "response body complete": {
                              target: "#lambda.Complete",
                              actions: "closeSocket",
                            },

                            "receive response chunk": {
                              target: "DownloadingBody",
                              actions: "enqueueResponseChunk",
                              internal: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },

              on: {
                "socket error": "#error",
                "socket closed": "#error",
              },
            },
          },
        },

        Error: {
          id: "error",
          type: "final",
        },

        Complete: {
          entry: "closeResponseBody",
          type: "final",
        },
      },
    },
    {
      actions: {
        assignRequest: assign({
          request: (_, event) => event.request,
        }),

        assignWebsocket: assign({
          socket: (_, event) => event.socket,
        }),

        closeSocket: ({ socket }) => {
          invariant(!!socket, "socket should be defined");
          socket.close();
        },

        createResponse: assign((_ctx, event) => {
          const transformStream = new IdentityTransformStream();
          const response = new Response(transformStream.readable, {
            headers: new Headers(event.headers),
            status: event.status,
          });

          return {
            res: {
              bodyStream: transformStream.writable,
              response,
            },
          };
        }),

        closeResponseBody: ({ res }) => {
          invariant(!!res, "res should be defined");
          res.bodyStream.getWriter().close();
        },

        enqueueResponseChunk: ({ res }, event) => {
          invariant(!!res, "res should be defined");
          const writer = res.bodyStream.getWriter();

          writer.write(event.chunk);
          writer.releaseLock();
        },

        sendRequestChunk: ({ socket }, event) => {
          invariant(!!socket, "socket should be defined");
          socket.send(
            JSON.stringify({ type: "body", chunk: decoder.decode(event.chunk) })
          );
        },

        sendRequestEnd: ({ socket }) => {
          invariant(!!socket, "socket should be defined");
          socket.send(JSON.stringify({ type: "end" }));
        },

        sendRequestHeaders: ({ socket, request }) => {
          invariant(!!socket, "socket should be defined");
          invariant(!!request, "request should be defined");

          socket.send(
            JSON.stringify({
              type: "headers",
              headers: [...request.headers.entries()],
              method: request.method,
              url: request.url,
            })
          );
        },
      },

      services: {
        establishHTTPConnection: async () => {
          const response = await fetch(env.LAMBDA_URL, {
            method: "POST",
            body: JSON.stringify({
              socketId,
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to establishHTTPConnection");
          }

          return response;
        },

        streamRequestBody:
          ({ request }) =>
          (sendBack) => {
            invariant(!!request, "request should be defined");
            const body = request.body;

            if (!body) {
              sendBack({ type: "request body complete" });
              return;
            }

            // type assertion is to get around funky cloudflare types. It should for sure be a ReadableStream<Uint8Array> anyways, just like the browser
            const reader = (body as ReadableStream<Uint8Array>).getReader();
            let cancelled = false;

            const pump = async () => {
              while (true) {
                const { done, value } = await reader.read();

                if (done || cancelled) {
                  return;
                }

                sendBack({ type: "receive request chunk", chunk: value });
              }
            };

            pump()
              .then(() => sendBack({ type: "request body complete" }))
              .catch(() => sendBack({ type: "request body error" }));

            return () => {
              cancelled = true;
              reader.cancel();
            };
          },

        socketSubscription:
          (ctx, { socket }) =>
          (sendBack, onReceive) => {
            const controller = new AbortController();

            socket.addEventListener(
              "error",
              () => sendBack({ type: "socket error" }),
              {
                signal: controller.signal,
              }
            );

            socket.addEventListener(
              "close",
              () => sendBack({ type: "socket closed" }),
              {
                signal: controller.signal,
              }
            );

            if (socket.readyState === WebSocket.READY_STATE_OPEN) {
              sendBack({ type: "socket connect" });
            } else {
              socket.addEventListener(
                "open",
                () => sendBack({ type: "socket connect" }),
                {
                  signal: controller.signal,
                }
              );
            }

            socket.addEventListener(
              "message",
              (msg) => {
                console.log("msg", msg.data);
                invariant(
                  typeof msg.data === "string",
                  "msg.data should be a string"
                );
                const data = JSON.parse(msg.data);
                invariant(data.type, "data.type should be defined");
                switch (data.type) {
                  case "headers":
                    return sendBack({
                      type: "receive response headers",
                      headers: data.headers,
                      status: data.status,
                      url: data.url,
                    });

                  case "body":
                    return sendBack({
                      type: "receive response chunk",
                      chunk: encoder.encode(data.chunk),
                    });

                  case "end":
                    return sendBack({ type: "response body complete" });

                  default:
                    return sendBack({ type: "socket error" });
                }
              },
              {
                signal: controller.signal,
              }
            );

            return () => {
              controller.abort();
            };
          },
      },
    }
  );
}
