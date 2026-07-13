export type GenShift = {
  employee_name: string;
  date: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  shift_name: string;
};
export type GenResult = {
  success: boolean;
  message: string;
  shifts: GenShift[];
  warnings?: string[];
  issues?: unknown[];
  employeeIssues?: unknown[];
};

export type CreateLinkResult = { token: string; url: string; weekStartDate: string };
export type StatusResult = {
  total: number;
  submittedCount: number;
  submitted: string[];
  pending: string[];
};

// SmartShift 백엔드 base URL + 시크릿 헤더
// SMARTSHIFT_API_URL은 공개 URL이라 기본값을 코드에 둔다(카카오클라우드 env 주입 미지원 대응).
// MCP_SHARED_SECRET은 비밀이라 env 우선 — 없으면 빌드 시 주입된 기본값(Dockerfile ENV) 사용.
const DEFAULT_SMARTSHIFT_API_URL = "https://smartshift-kakao-backend.vercel.app";

function backend(): { base: string; headers: Record<string, string> } {
  const base = process.env.SMARTSHIFT_API_URL || DEFAULT_SMARTSHIFT_API_URL;
  const secret = process.env.MCP_SHARED_SECRET;
  if (!secret) throw new Error("MCP_SHARED_SECRET 미설정");
  return { base, headers: { "content-type": "application/json", "x-mcp-secret": secret } };
}

async function readError(res: Response): Promise<string> {
  const t = await res.text().catch(() => "");
  return `백엔드 오류 ${res.status}: ${t.slice(0, 200)}`;
}

export type LaborMode = "full" | "under5" | "off";

// [공모전] 카카오 로그인 — 신원매핑
export async function callLogin(): Promise<{ url: string }> {
  const { base, headers } = backend();
  const res = await fetch(`${base}/api/mcp/login`, {
    method: "GET",
    headers,
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(await readError(res));
  return (await res.json()) as { url: string };
}

export type MyStore = { sessionId: string; name: string; createdAt: string };

export async function callMyStores(ownerToken: string): Promise<MyStore[]> {
  const { base, headers } = backend();
  const url = `${base}/api/mcp/my-stores?ownerToken=${encodeURIComponent(ownerToken)}`;
  const res = await fetch(url, { method: "GET", headers, signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(await readError(res));
  return ((await res.json()) as { stores: MyStore[] }).stores;
}

export async function callGenerate(
  sessionId: string | undefined,
  weekStartDate: string,
  laborMode?: LaborMode,
  ownerToken?: string
): Promise<GenResult> {
  const { base, headers } = backend();
  const res = await fetch(`${base}/api/mcp/generate`, {
    method: "POST",
    headers,
    body: JSON.stringify({ sessionId, weekStartDate, laborMode, ownerToken }),
    signal: AbortSignal.timeout(70000), // 백엔드 Render 콜드스타트(60s) 대기보다 크게
  });
  if (!res.ok) throw new Error(await readError(res));
  return (await res.json()) as GenResult;
}

export async function callGetSchedule(
  sessionId: string | undefined,
  weekStartDate: string,
  ownerToken?: string
): Promise<GenResult> {
  const { base, headers } = backend();
  const params = new URLSearchParams({ weekStartDate });
  if (sessionId) params.set("sessionId", sessionId);
  if (ownerToken) params.set("ownerToken", ownerToken);
  const res = await fetch(`${base}/api/mcp/schedule?${params.toString()}`, {
    method: "GET",
    headers,
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(await readError(res));
  return (await res.json()) as GenResult;
}

export async function callCreateAvailabilityLink(
  sessionId: string,
  weekStartDate: string,
  ownerToken?: string
): Promise<CreateLinkResult> {
  const { base, headers } = backend();
  const res = await fetch(`${base}/api/mcp/availability-link`, {
    method: "POST",
    headers,
    body: JSON.stringify({ sessionId, weekStartDate, ownerToken }),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(await readError(res));
  return (await res.json()) as CreateLinkResult;
}

export async function callAvailabilityStatus(
  sessionId: string,
  ownerToken?: string
): Promise<StatusResult> {
  const { base, headers } = backend();
  const params = new URLSearchParams({ sessionId });
  if (ownerToken) params.set("ownerToken", ownerToken);
  const url = `${base}/api/mcp/availability-status?${params.toString()}`;
  const res = await fetch(url, { method: "GET", headers, signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(await readError(res));
  return (await res.json()) as StatusResult;
}

export type PublishResult = {
  published: number;
  failed: number;
  total: number;
  dryRun: boolean;
  sample: string[];
};

export type ShiftSlotInput = { name: string; startTime: string; endTime: string; count: number; day?: string };
export type CreatedStore = {
  sessionId: string;
  name: string;
  shiftSlots: ShiftSlotInput[];
  workingDays: string[];
};

export async function callCreateStore(input: {
  name: string;
  shiftSlots?: ShiftSlotInput[];
  workingDays?: string[];
  ownerToken?: string;
}): Promise<CreatedStore> {
  const { base, headers } = backend();
  const res = await fetch(`${base}/api/mcp/store`, {
    method: "POST",
    headers,
    body: JSON.stringify(input),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(await readError(res));
  return (await res.json()) as CreatedStore;
}

export type EmployeeUpsert = { action: "created" | "updated"; name: string };

export async function callSetEmployee(input: {
  sessionId: string;
  name: string;
  contractDays?: number;
  unavailableDays?: string[];
  isMinor?: boolean;
  fixedSlots?: { day: string; shiftName: string }[];
  unavailableSlots?: { date: string; shiftName: string }[];
  ownerToken?: string;
}): Promise<EmployeeUpsert> {
  const { base, headers } = backend();
  const res = await fetch(`${base}/api/mcp/employee`, {
    method: "POST",
    headers,
    body: JSON.stringify(input),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(await readError(res));
  return (await res.json()) as EmployeeUpsert;
}

export async function callPublish(
  sessionId: string,
  weekStartDate: string,
  ownerToken?: string
): Promise<PublishResult> {
  const { base, headers } = backend();
  const res = await fetch(`${base}/api/mcp/publish`, {
    method: "POST",
    headers,
    body: JSON.stringify({ sessionId, weekStartDate, ownerToken }),
    signal: AbortSignal.timeout(60000),
  });
  if (!res.ok) throw new Error(await readError(res));
  return (await res.json()) as PublishResult;
}
