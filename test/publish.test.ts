import { it, expect, vi, beforeAll, afterAll } from "vitest";
import type { Server } from "node:http";

vi.mock("../src/clients/smartshift.js", () => ({
  callPublish: vi.fn(),
}));

import { callPublish } from "../src/clients/smartshift.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { createApp } from "../src/http.js";

let server: Server;
let baseUrl: string;

beforeAll(async () => {
  await new Promise<void>((resolve) => {
    server = createApp().listen(0, () => {
      const a = server.address();
      const port = typeof a === "object" && a ? a.port : 0;
      baseUrl = `http://127.0.0.1:${port}/mcp`;
      resolve();
    });
  });
});
afterAll(() => server?.close());

async function call(args: Record<string, unknown>) {
  const client = new Client({ name: "t", version: "0" });
  await client.connect(new StreamableHTTPClientTransport(new URL(baseUrl)));
  const r = await client.callTool({ name: "publish_to_calendar", arguments: args });
  await client.close();
  return (r.content as Array<{ type: string; text: string }>)[0].text;
}

it("dryRun이면 발행 예정 미리보기를 안내", async () => {
  (callPublish as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
    published: 0,
    total: 5,
    dryRun: true,
    sample: ["2026-03-09 오전 김알바 09:00~13:00"],
  });
  const text = await call({ sessionId: "s1", weekStartDate: "2026-03-09" });
  expect(text).toContain("발행 예정 5건");
  expect(text).toContain("김알바");
});

it("실발행이면 완료 건수를 보여준다", async () => {
  (callPublish as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
    published: 5,
    failed: 0,
    total: 5,
    dryRun: false,
    sample: [],
  });
  const text = await call({ sessionId: "s1", weekStartDate: "2026-03-09" });
  expect(text).toContain("발행 완료 5/5");
});
