import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { Server } from "node:http";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { createApp } from "../src/http.js";

let server: Server;
let baseUrl: string;

beforeAll(async () => {
  await new Promise<void>((resolve) => {
    server = createApp().listen(0, () => {
      const addr = server.address();
      const port = typeof addr === "object" && addr ? addr.port : 0;
      baseUrl = `http://127.0.0.1:${port}/mcp`;
      resolve();
    });
  });
});

afterAll(() => { server?.close(); });

describe("ping tool", () => {
  it("returns pong with the message", async () => {
    const client = new Client({ name: "test", version: "0.0.0" });
    await client.connect(new StreamableHTTPClientTransport(new URL(baseUrl)));
    const result = await client.callTool({ name: "ping", arguments: { message: "hi" } });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).toBe("pong: hi");
    await client.close();
  });
});
