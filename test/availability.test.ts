import { it, expect, vi, beforeAll, afterAll } from "vitest";
import type { Server } from "node:http";

vi.mock("../src/clients/smartshift.js", () => ({
  callCreateAvailabilityLink: vi.fn(async () => ({
    token: "tok123",
    url: "http://localhost:3000/availability/tok123",
    weekStartDate: "2026-03-09",
  })),
  callAvailabilityStatus: vi.fn(async () => ({
    total: 3,
    submittedCount: 2,
    submitted: ["김알바", "이알바"],
    pending: ["박알바"],
  })),
}));

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

async function call(name: string, args: Record<string, unknown>) {
  const client = new Client({ name: "t", version: "0" });
  await client.connect(new StreamableHTTPClientTransport(new URL(baseUrl)));
  const r = await client.callTool({ name, arguments: args });
  await client.close();
  return (r.content as Array<{ type: string; text: string }>)[0].text;
}

it("create_availability_link가 공유용 URL을 반환", async () => {
  const text = await call("create_availability_link", { sessionId: "s1", weekStartDate: "2026-03-09" });
  expect(text).toContain("http://localhost:3000/availability/tok123");
});

it("get_availability_status가 제출/미제출 현황을 보여준다", async () => {
  const text = await call("get_availability_status", { sessionId: "s1" });
  expect(text).toContain("2/3");
  expect(text).toContain("김알바");
  expect(text).toContain("박알바");
});
