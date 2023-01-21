import { ImmutableHeaders } from "immurl";

// From https://github.com/denoland/deno_std/blob/21703f2efa5bbd2b3354096e180a1f4ae9f1ec3d/streams/readable_stream_from_iterable.ts
export function readableStreamFromIterable<T>(
  iterable: Iterable<T> | AsyncIterable<T>
): ReadableStream<T> {
  const iterator: Iterator<T> | AsyncIterator<T> =
    (iterable as AsyncIterable<T>)[Symbol.asyncIterator]?.() ??
    (iterable as Iterable<T>)[Symbol.iterator]?.();
  return new ReadableStream({
    async pull(controller) {
      const { value, done } = await iterator.next();
      if (done) {
        controller.close();
      } else {
        controller.enqueue(value);
      }
    },
    async cancel(reason) {
      if (typeof iterator.throw == "function") {
        try {
          await iterator.throw(reason);
        } catch {
          /* `iterator.throw()` always throws on site. We catch it. */
        }
      }
    },
  });
}

export const jsonResponse = (body: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: new ImmutableHeaders(init?.headers).set(
      "content-type",
      "application/json"
    ),
  });

export function invariant(
  condition: boolean,
  message: string
): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}
