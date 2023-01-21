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
