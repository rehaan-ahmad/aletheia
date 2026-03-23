import { EventSourceParserStream } from "eventsource-parser/stream";
import { SSEEvent } from "./types";

export const API_URL: string = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function* streamVerification(inputText: string | null, url: string | null): AsyncGenerator<SSEEvent> {
  const response = await fetch(`${API_URL}/verify-stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "text/event-stream"
    },
    body: JSON.stringify({ input_text: inputText, url })
  });

  if (!response.ok) {
    let errMessage = "Unknown Server Error";
    try {
      const text = await response.text();
      errMessage = text;
    } catch (e) {}
    throw new Error(`API Error: ${response.status} ${response.statusText} - ${errMessage}`);
  }

  if (!response.body) {
    throw new Error("Response body is null. Cannot consume stream.");
  }

  const stream = response.body
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new EventSourceParserStream());

  const reader = stream.getReader();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        yield {
          type: value.event ?? "message",
          data: JSON.parse(value.data || "{}")
        };
      }
    }
  } finally {
    reader.releaseLock();
  }
}
