## Things you might wanna figure out before putting this in production

- A more efficient websocket message encoding. JSON is probably slower than some alternatives here, especially the serialisation of body chunks to/from base64 strings.
- Retrying and reconnecting. Websockets can close for a variety of reasons, the lambda function should be able to handle this and reconnect then resume the response stream.
- Implementing a similar `streamHandler` but for Node.js streams (Writable/Readable). This would unlock using many traditional Node.js libraries for streaming data.

## Caveats

Aside from the above, there are a few caveats to be aware of:

- Lambda timeouts. Lambda functions have a maximum execution time of 15 minutes. This means that if you're streaming a large response, you'll need to make sure that the function doesn't time out before the response is complete. This also prevents you from creating HTTP connections that last longer than 15 minutes, which you might want to do with Server Sent Events for example.
