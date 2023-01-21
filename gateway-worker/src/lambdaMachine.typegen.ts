// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  internalEvents: {
    "done.invoke.lambda.Active:invocation[0]": {
      type: "done.invoke.lambda.Active:invocation[0]";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "xstate.init": { type: "xstate.init" };
  };
  invokeSrcNameMap: {
    establishHTTPConnection: "done.invoke.lambda.Active:invocation[0]";
    socketSubscription: "done.invoke.lambda.Active.WebsocketRecived:invocation[0]";
    streamRequestBody: "done.invoke.lambda.Active.WebsocketRecived.Connected:invocation[0]";
  };
  missingImplementations: {
    actions: never;
    delays: never;
    guards: never;
    services: never;
  };
  eventsCausingActions: {
    assignRequest: "incoming request";
    assignWebsocket: "receive websocket";
    closeResponseBody:
      | "done.invoke.lambda.Active:invocation[0]"
      | "response body complete";
    closeSocket:
      | "done.invoke.lambda.Active:invocation[0]"
      | "response body complete";
    createResponse: "receive response headers";
    enqueueResponseChunk: "receive response chunk";
    sendRequestChunk: "receive request chunk";
    sendRequestEnd: "request body complete";
    sendRequestHeaders: "socket connect";
  };
  eventsCausingDelays: {};
  eventsCausingGuards: {};
  eventsCausingServices: {
    establishHTTPConnection: "incoming request";
    socketSubscription: "receive websocket";
    streamRequestBody: "socket connect";
  };
  matchesStates:
    | "Active"
    | "Active.Connecting"
    | "Active.WebsocketRecived"
    | "Active.WebsocketRecived.Connected"
    | "Active.WebsocketRecived.Connected.Request"
    | "Active.WebsocketRecived.Connected.Request.RequestComplete"
    | "Active.WebsocketRecived.Connected.Request.Uploading"
    | "Active.WebsocketRecived.Connected.Response"
    | "Active.WebsocketRecived.Connected.Response.DownloadingBody"
    | "Active.WebsocketRecived.Connected.Response.WaitingForHeaders"
    | "Active.WebsocketRecived.Connecting"
    | "Complete"
    | "Error"
    | "Idle"
    | {
        Active?:
          | "Connecting"
          | "WebsocketRecived"
          | {
              WebsocketRecived?:
                | "Connected"
                | "Connecting"
                | {
                    Connected?:
                      | "Request"
                      | "Response"
                      | {
                          Request?: "RequestComplete" | "Uploading";
                          Response?: "DownloadingBody" | "WaitingForHeaders";
                        };
                  };
            };
      };
  tags: never;
}
