import { it, expect, vi, beforeAll, afterAll } from "vitest";
import type { Server } from "node:http";

vi.mock("../src/clients/smartshift.js", () => ({
  callCreateStore: vi.fn(async () => ({
    sessionId: "s1",
    name: "테스트가게",
    shiftSlots: [{ name: "오전", startTime: "09:00", endTime: "13:00", count: 1 }],
    workingDays: ["MONDAY", "TUESDAY"],
  })),
  callSetEmployee: vi.fn(async () => ({ action: "created", name: "김알바" })),
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

it("set_store가 sessionId와 교대 구성을 안내", async () => {
  const text = await call("set_store", { name: "테스트가게" });
  expect(text).toContain("s1");
  expect(text).toContain("오전");
});

it("set_employee_constraints가 추가 완료를 안내", async () => {
  const text = await call("set_employee_constraints", { sessionId: "s1", name: "김알바", contractDays: 3 });
  expect(text).toContain("김알바");
  expect(text).toContain("추가");
});
