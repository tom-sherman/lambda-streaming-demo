import type { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { WebSocket } from "ws";

const SOCKET_CONNECTION_URL = process.env.SOCKET_CONNECTION_URL as string;
invariant(
  typeof SOCKET_CONNECTION_URL === "string",
  "SOCKET_CONNECTION_URL must be a string"
);

interface HeaderMessage {
  headers: Headers;
  method: string;
  url: string;
}

export function streamHandler(
  handler: (request: Request) => Promise<Response> | Response
): (request: APIGatewayEvent) => Promise<APIGatewayProxyResult> {
  return async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    invariant(event.body != null, "event.body must be non null");

    const body = JSON.parse(event.body);
    const socketId = body?.socketId;
    invariant(typeof socketId === "string", "socketId must be a string");

    const socket = new WebSocket(`${SOCKET_CONNECTION_URL}/${socketId}`);

    await new Promise((r) => socket.on("open", r));

    const headerMessage = await new Promise<HeaderMessage>((resolve, reject) =>
      socket.on("message", (data) => {
        const message = JSON.parse(data.toString());
        if (message.type !== "headers") {
          reject(new Error("Expected headers as first message"));
        } else {
          invariant(
            typeof message.method === "string",
            "method must be a string"
          );
          invariant(typeof message.url === "string", "method must be a string");

          resolve({
            headers: new Headers(message.headers),
            method: message.method,
            url: message.url,
          });
        }
      })
    );

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const requestBody = new ReadableStream<Uint8Array>({
      start(controller) {
        socket.on("message", (data) => {
          const message = JSON.parse(data.toString());
          if (message.type === "body") {
            const chunk = message.chunk;
            invariant(typeof chunk === "string", "chunk must be a string");
            controller.enqueue(encoder.encode(chunk));
          } else if (message.type === "end") {
            controller.close();
          } else {
            controller.error(new Error("Unexpected message type"));
          }
        });
      },
    });

    const request = new Request(headerMessage.url, {
      headers: headerMessage.headers,
      method: headerMessage.method,
      body: requestBody,
    });

    const response = await handler(request);

    socket.send(
      JSON.stringify({
        type: "headers",
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        url: request.url,
      })
    );

    if (response.body == null) {
      // There is no response body, so we can just close the socket and return.
      socket.close();
      return {
        statusCode: 200,
        body: "OK",
      };
    }

    const reader = response.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        socket.send(
          JSON.stringify({
            type: "end",
          })
        );
        break;
      }
      socket.send(
        JSON.stringify({
          type: "body",
          chunk: decoder.decode(value),
        })
      );
    }

    socket.close();

    return {
      statusCode: 200,
      body: "OK",
    };
  };
}

function invariant(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}
