import { it, expect, vi, beforeAll, afterAll } from "vitest";
import type { Server } from "node:http";

vi.mock("../src/clients/smartshift.js", () => ({
  callGenerate: vi.fn(async () => ({
    success: true,
    message: "ok",
    shifts: [
      {
        employee_name: "김알바",
        date: "2026-03-09",
        day_of_week: "MONDAY",
        start_time: "08:00",
        end_time: "14:00",
        shift_name: "A조",
      },
    ],
    warnings: [],
  })),
}));

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { createApp } from "../src/http.js";
import { callGenerate } from "../src/clients/smartshift.js";

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

afterAll(() => {
  server?.close();
});

it("generate_schedule가 포매팅된 근무표 텍스트를 반환", async () => {
  const client = new Client({ name: "t", version: "0" });
  await client.connect(new StreamableHTTPClientTransport(new URL(baseUrl)));
  const r = await client.callTool({
    name: "generate_schedule",
    arguments: { weekStartDate: "2026-03-09", sessionId: "s1" },
  });
  const text = (r.content as Array<{ type: string; text: string }>)[0].text;
  expect(text).toContain("A조 08:00~14:00");
  expect(text).toContain("김알바");
  await client.close();
});

it("callGenerate 실패 시 isError 응답을 반환", async () => {
  (callGenerate as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("서버 연결 실패"));
  const client = new Client({ name: "t", version: "0" });
  await client.connect(new StreamableHTTPClientTransport(new URL(baseUrl)));
  const r = await client.callTool({
    name: "generate_schedule",
    arguments: { weekStartDate: "2026-03-09" },
  });
  expect(r.isError).toBe(true);
  expect((r.content as Array<{ type: string; text: string }>)[0].text).toContain("오류");
  await client.close();
});
