# Add HTTP Streaming to your Lambda Functions

This repo contains a Cloudflare Worker and Durable Object that enables streaming HTTP responses from AWS Lambda functions. It's a proof of concept and not production ready, but it's a good starting point for anyone wanting to add streaming to their lambdas.

All it takes is a few lines of code in your lambda to enable streaming:

```ts
import { streamHandler } from "./lib";

export const handler = streamHandler((_request) => {
  const body = getBody();
  return new Response(body, { status: 200 });
});

/**
 * Returns a ReadableStream that will emit 5 chunks of text, one every second.
 */
function getBody() {
  const encoder = new TextEncoder();
  const numberOfChunks = 5;
  let i = 0;

  return new ReadableStream({
    async pull(controller) {
      if (i === numberOfChunks) {
        controller.close();
      } else {
        controller.enqueue(encoder.encode(`Chunk ${i}\n`));
        i++;
        await wait(1000);
      }
    },
  });
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
```

https://user-images.githubusercontent.com/9257001/213889485-c5d8dbcd-361d-4a22-9572-d31759a36e1d.mov

## Performance

In my very limited testing this seemed to add almost zero extra latency to the response. Of course this will depend on your locality to Cloudflare and AWS.

More testing is needed here and it'snot my area of expertise, please reach out if you can help instrumenting/measuring this!

## How does it work?

I'll write a full blog post with the details but for now here's a sequence diagram:

![Screenshot of an excalidraw canvas https://app.excalidraw.com/l/7jPdrRbLpNn/9ORhrifaK24](https://user-images.githubusercontent.com/9257001/213723506-17a1f244-f25d-4f43-8831-6d2e0ce50ac7.png)

The state machine running in the durable object may also be useful to understand: [gateway-worker/src/lambdaMachine.ts](./gateway-worker/src/lambdaMachine.ts)

## Running the example

Pre-requisites:

- An AWS account [bootstrapped with CDK](https://docs.aws.amazon.com/cdk/v2/guide/bootstrapping.html)
- A paid Cloudflare account. Free plan doesn't support durable objects unfortunately :(
- Node + pnpm installed

1. Clone the repo
2. `pnpm i`
3. `pnpm run deploy:cloudfare`
4. Use the worker URL from the output of the previous command to create a `.env` file in the `application-lambda` directory eg.
    ```
    SOCKET_CONNECTION_URL=wss://lambda-gateway.me.workers.dev/socket
    ```
5. `pnpm run deploy:lambda`
6. Put the lambda URL from the previous command into the LAMBDA_URL variable in `gateway-worker/wrangler.toml`
7. `pnpm run deploy:cloudfare` again to deploy the worker with the new lambda URL
8. Send a request to the worker URL eg. `curl -N https://lambda-gateway.me.workers.dev/api/`

Watch the output for those chunks!

## Differences with other approaches

https://github.com/jacob-ebey/cf-lambda-streaming is a technique that reverses the websocket handshake and has the lambda act as a websocket server (instead of a client as in this repo). This has some potential latency benefits but requires more infratructure on the AWS side. The only way to accept a websocket in AWS lambda is to put an API gateway in front of it, this is extra infra that you might not want to manage. With the approach in this repo you can instead drop a Cloudflare gateway infront of your existing infrastructure to enable streaming. This can also make the lambda simpler to deploy because you can use [Function URLs](https://docs.aws.amazon.com/lambda/latest/dg/lambda-urls.html) instead of an API gateway. Because there's no extra infrastructure on the cloud vendor side, this approach is also portable to other cloud providers.

## Things you might wanna figure out before putting this in production

- Chunking of request and response chunks. Cloudflare websockets have a maximum message size of 1MiB but HTTP has an unbounded chunk size (AFAIA). The worker and lambda should chunk the request and response bodies to ensure that they don't exceed the maximum message size.
- Retrying and reconnecting. Websockets can close for a variety of reasons, the lambda function should be able to handle this and reconnect then resume the response stream.
- Implementing a similar `streamHandler` but for Node.js streams (Writable/Readable). This would unlock using many traditional Node.js libraries for streaming data.
- Removing xstate from the durable object in favour of a hand rolled state machine if you don't like the extra dependency.
- Socket recycling. The lambda function will create a new socket for each request. An alternative is to reuse an existing socket to improve latency, potentially using [Durable Object Groups](https://github.com/cloudflare/dog) for coordination.
- Measure the perf (memory and CPU) of the durable object and worker. I haven't done this yet, but I'm sure there are some optimisations to be made. You may want to consider implementing the worker in Rust for better performance. Removing the xstate dependency could also help here.
- A more efficient websocket message encoding. JSON is probably slower than some alternatives here, especially the serialisation of body chunks to/from base64 strings.

## Timeout lengths

Lambda functions have a maximum execution time of 15 minutes. This means that if you're streaming a large response, you'll need to make sure that the function doesn't time out before the response is complete. This also prevents you from creating HTTP connections that last longer than 15 minutes, which you might want to do with Server Sent Events for example.

Notably however, Lambda event size is not limited to the traditional 6MB imposed by AWS. You can send requests of arbitrary size, as long as the client can it and the lambda can process it within 15minutes. In other words, this architecture limits the time a HTTP connection is open for to 15 minutes, but the amount of data sent in that time is unbounded.
