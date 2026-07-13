import { it, expect, vi, beforeAll, afterAll } from "vitest";
import type { Server } from "node:http";

vi.mock("../src/clients/smartshift.js", () => ({
  callGetSchedule: vi.fn(),
}));

import { callGetSchedule } from "../src/clients/smartshift.js";
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
  const r = await client.callTool({ name: "get_schedule", arguments: args });
  await client.close();
  return (r.content as Array<{ type: string; text: string }>)[0].text;
}

it("저장된 근무표가 있으면 표를 보여준다", async () => {
  (callGetSchedule as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
    success: true,
    message: "저장된 근무표",
    shifts: [
      { employee_name: "김알바", date: "2026-03-09", day_of_week: "MONDAY", start_time: "09:00", end_time: "13:00", shift_name: "오전" },
    ],
  });
  const text = await call({ sessionId: "s1", weekStartDate: "2026-03-09" });
  expect(text).toContain("오전 09:00~13:00");
  expect(text).toContain("김알바");
});

it("저장된 근무표가 없으면 안내한다", async () => {
  (callGetSchedule as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
    success: true,
    message: "저장된 근무표가 없습니다",
    shifts: [],
  });
  const text = await call({ sessionId: "s1", weekStartDate: "2026-03-09" });
  expect(text).toContain("생성");
});
