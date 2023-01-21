![Screenshot of an excalidraw canvas https://app.excalidraw.com/l/7jPdrRbLpNn/9ORhrifaK24](https://user-images.githubusercontent.com/9257001/213723506-17a1f244-f25d-4f43-8831-6d2e0ce50ac7.png)

## Differences with other approaches

https://github.com/jacob-ebey/cf-lambda-streaming is a technique that reverses the websocket handshake and has the lambda act as a websocket client. This has some latency benefits but requires more infratructure on the AWS side. The only way to accept a websocket in AWS lambda is to put an API gateway in front of it, this is extra infra that you might not want to manage. With the approach in this repo you can instead drop a Cloudflare gateway infront of your existing infrastructure to enable streaming. This can also make the lambda simpler to deploy because you can use [Function URLs](https://docs.aws.amazon.com/lambda/latest/dg/lambda-urls.html) instead of an API gateway (for when you have just one function).

## Things you might wanna figure out before putting this in production

- Retrying and reconnecting. Websockets can close for a variety of reasons, the lambda function should be able to handle this and reconnect then resume the response stream.
- Implementing a similar `streamHandler` but for Node.js streams (Writable/Readable). This would unlock using many traditional Node.js libraries for streaming data.
- Removing xstate from the durable object in favour of a hand rolled state machine if you don't like the extra dependency.
- Measure the perf (memory and CPU) of the durable object and worker. I haven't done this yet, but I'm sure there are some optimisations to be made. You may want to consider implementing the worker in Rust for better performance. Removing the xstate dependency could also help here.
- A more efficient websocket message encoding. JSON is probably slower than some alternatives here, especially the serialisation of body chunks to/from base64 strings.

## Caveats

Aside from the above, there are a few caveats to be aware of:

- Lambda timeouts. Lambda functions have a maximum execution time of 15 minutes. This means that if you're streaming a large response, you'll need to make sure that the function doesn't time out before the response is complete. This also prevents you from creating HTTP connections that last longer than 15 minutes, which you might want to do with Server Sent Events for example.
