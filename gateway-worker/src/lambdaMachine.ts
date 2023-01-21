import { assign, createMachine } from "xstate";
import { invariant } from "./util";

const decoder = new TextDecoder();
const encoder = new TextEncoder();

export const lambdaMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QBsCGBbARhVA6AkhMmAMQCWAdgMYD26lUABAE5gCOArnAC4DaADAF1EoAA41YZbmRoURIAB6IAtAEZ+AdgAsufgE5+ADkMA2Y3tVaArABoQATxXXDuAMwAmVRatXD79xqGWgC+wXZoWDi4AIJU0gBupBCyYLiU8TQA1qkR2HixCWAI6TRUqNKyAoJV8uKSFXJIioha-Ca4VlrmelYa-qq2Dogmfbiqhq6G-FaqJgbuehqh4Rh5MXFkiSRgzMw0zLiiaNwAZvvouLlRBZtFJWUNVTVNdVIyjaBKCKpeGm5WJncrisPVUGn4ATsjgQyncE1wGgsXT0gKCJi07mWICu+Q2iVwAGFZBQwBsKFASKwqGBbowAO5gTCwUrZPhCWoSN6yeRfZRaDSqDqIhb8Vz8LSuEyuDRQlRilzuMzi7QacEeVRYnHrQq4ADqjOZVFZACVSbcICRDazGDs9sxnmJOQ0eYhVO4AboJQLQYYfD9Zd8pWNgdo9P5euHNatrnjUvqmSywNxTVRzZbE9xGFRkBJIA6QK9nU0vm6tHpcCYzOCw4Y9NZOgGTIKtNYNICQfpLD4rFHIridfGrUmU+bCcTSdJyemjUms+O4vnC+8XTDOvw3Ij9MDXAN+YYA8pev9TMiQT5ESje2sbvjBxmR4kIGOKCS4pBcKbODxcABVI40VAIAYSl2C4WBM0wGgIHsG1dn2RcnWXYtXSBdw3FaKxFWBXxRS0AMxTQ9EjB8dwIX5DQfCvGMBwNe8zUfZ9X24d9PzA7hf3-QDgNYL9wMYSDoLndAjiTMAEPqJDPkQBYrDGUi5kwkwjB3PChgQaxXFwd13C0KtWkMNsNTCbFo37W49Vomdk3o98iRfCcWNA78-xzLipypGlEhYJy+KoAALDgKEycSuQ+ZoEDhFx0UMH4gisaZfBMAMdMFd0piUnwmzVEJjK1G840sk0bKfOymMc2BxAoWA41QN5yQAMX2AAJMBAJ2WAQOpWlWAq2RqsYPzWogdqQqLKSYQlHR634dQvGIxF8MlLT206StfHBTFctM7VzLvKyH1s+dmKfU1eqq1IABEaDpChXKA8kACEoPsECzv6gSYNoYTiGY0bJPCtRwQrOYzEWaVSPFRsgbMSZ9ECFsFKoszb0K4disYhyTrgSrqtwK6bruhgnugzrPLAby3vJ-zAuC9kXkQ7lkNXHRVB3AZpgMMMAlMZLfF0NsZr0IXXDFExKKxCgoLgeQcQ5CTGfGtQ3TQ-QjFMcwuwPIitOlNs+h0jx9CRggiDAOXQpXNQIU08EtFmJsYoxcYDxIhFdabAZhc8Y38vNsaAYMzSy35EF9K6JsDxbNC2ymTDTF6DwfdjDGySgP3-t5CjywlJtRT0IJLAog84VkhZLGMdVWz0JOaITfbivThWA-dXBg6zsPTFUA8vEFX148mvxegmGvdtR6zUwY0qJwYRuwszoF-lVKOdMrSwXb+YET1rM9eiFkwR5Ruuionw77LfCBZ8t1U-jb0OjHDru1OUdptC8HTWkrCiDMMA+CqPtGT4lSOo5Xi3BL5Mx0uuaKsVrAJVMK4AMAwbY4QlJ0Lo6grCuF-hZf+49RxT3Ph+Hy7EXIAXumnem8s56IFcC2XQixFRulFDpQY0JJTlkWBYWhQQ9AeAsEsLafYdqHyHHgyewCsagKIaAok31RLgPGlKQUYtwQaA8GLOESU1L8h0Jw6YOjsrYL2sffBEiiGUwUQDPo2c6zt3vp3RBQNehKQsJ4HcmDKxGLHgdIBZ9jrmJxjVOqUBGrMBam1Zg8BKEWyZs-GKrdbF3yCA4tS7DdBzHzhMfk4xNBeNwT4lO-jTqBLxtdW6ZCibPUsbySwuiJRum0OokEbZ8JzHSULCu2SpgCJWEIgAonBZg1SUKVjGCiBKKJHasJUKzFwiIWzWKBPnTBxtZEiWYsM74RhW7+AyoHaUvCobrlmKKEWXRcJqNCKEIAA */
  createMachine(
    {
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
          const transformStream = new TransformStream<Uint8Array>();
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
          res.bodyStream.getWriter().write(event.chunk);
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
          const response = await fetch("LAMBDA_URL", {
            method: "POST",
            body: JSON.stringify({
              id: "123",
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
            socket.accept();
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

            socket.addEventListener(
              "open",
              () => sendBack({ type: "socket connect" }),
              {
                signal: controller.signal,
              }
            );

            socket.addEventListener(
              "message",
              (msg) => {
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
