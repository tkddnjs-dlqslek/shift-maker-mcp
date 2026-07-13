# shift-maker MCP 레지스트리 제출 체크리스트

아침에 위에서부터 순서대로 따라 하면 됩니다. 대부분 무료·무심사이고, 공식 레지스트리 하나만 통과하면 나머지 디렉토리들은 대개 자동으로 크롤링해 갑니다.

---

## 0. 어디에나 붙여넣을 값 (복붙용)

| 항목 | 값 |
|------|-----|
| name (레지스트리 네임스페이스) | `io.github.tkddnjs-dlqslek/shift-maker` |
| name (디렉토리 표시용 짧은 이름) | `shift-maker` |
| 한 줄 설명 (EN) | `Labor-law-aware shift scheduling for Korean workplaces — conversational setup, OR-Tools CP-SAT schedule generation, availability links, calendar publishing.` |
| 엔드포인트 URL (Streamable HTTP) | `https://shift-maker.playmcp-endpoint.kakaocloud.io/mcp` |
| repo URL | `https://github.com/tkddnjs-dlqslek/shift-maker-mcp` |
| transport 타입 | `streamable-http` |
| 아이콘 경로 | `assets/app-icon.png` |
| 라이선스 | MIT |

> 제출 폼에서 "endpoint/URL"을 물으면 위 엔드포인트 URL을, "repository"를 물으면 repo URL을 넣으세요.

---

## 1. MCP 공식 레지스트리 (registry.modelcontextprotocol.io)

repo 안의 `server.json`이 이미 준비돼 있습니다. `mcp-publisher` CLI로 게시합니다.
**GitHub 로그인은 브라우저가 열리는 인터랙티브 절차라 사용자가 직접 실행해야 합니다.**

**(a) CLI 설치 — Windows (PowerShell):**
```powershell
$arch = if ([System.Runtime.InteropServices.RuntimeInformation]::ProcessArchitecture -eq "Arm64") { "arm64" } else { "amd64" }; Invoke-WebRequest -Uri "https://github.com/modelcontextprotocol/registry/releases/latest/download/mcp-publisher_windows_$arch.tar.gz" -OutFile "mcp-publisher.tar.gz"; tar xf mcp-publisher.tar.gz mcp-publisher.exe; rm mcp-publisher.tar.gz
```
(macOS면 `brew install mcp-publisher` 한 줄로 끝.)

**(b) repo 루트에서 게시:**
```powershell
cd C:\Users\user\Desktop\shift-maker-mcp
.\mcp-publisher.exe login github     # 브라우저가 열림 → device code 입력 → 앱 승인 (인터랙티브)
.\mcp-publisher.exe publish          # server.json을 읽어 게시
```
- `login github`은 `io.github.tkddnjs-dlqslek/*` 네임스페이스 소유권을 GitHub 계정으로 증명하는 단계입니다. `tkddnjs-dlqslek` 계정으로 로그인하세요.
- `server.json`을 손댈 필요 없음. 이미 name/description/version/remotes/repository 다 채워져 있습니다.

> 무료 / 무심사(사람 리뷰 큐 없음, 자동 검증) / 예상 5~10분

---

## 2. Smithery (smithery.ai)

두 가지 경로 중 하나. **이미 카카오클라우드에 떠 있는 엔드포인트를 그대로 등록하려면 (b) CLI가 가장 확실합니다.**

**(a) 웹 UI:** smithery.ai 접속 → 우상단 GitHub 로그인 → "Add Server" / "Claim" → repo `tkddnjs-dlqslek/shift-maker-mcp` 지정 (크롤링돼 이미 목록에 있으면 claim으로 소유권 인증).

**(b) CLI (원격 URL 직접 게시, 권장):**
```powershell
npx @smithery/cli mcp publish https://shift-maker.playmcp-endpoint.kakaocloud.io/mcp -n tkddnjs-dlqslek/shift-maker
```
- repo의 `smithery.yaml`은 "Smithery가 Dockerfile로 직접 빌드·호스팅"하는 경로용입니다. 이미 있는 카카오 엔드포인트를 쓰려면 위 CLI publish를 쓰세요.

> 무료 / 무심사(Official/Claimed 티어 자동 구분) / 예상 5분

---

## 3. Glama (glama.ai/mcp/servers)

Glama는 public GitHub repo를 자동 크롤링합니다. repo가 공개돼 있으면 며칠 내 자동 등록될 가능성이 큽니다.
- 접속: `https://glama.ai/mcp/servers`
- 이미 크롤링된 목록에 있으면 GitHub 로그인 후 "Claim"으로 소유권 인증 → Unclaimed에서 Claimed 티어로 승격.
- 없으면 사이트 상단/푸터의 "Add server" 링크로 repo URL 제출.

> 무료 / 무심사(자동 크롤 + claim) / 예상 3분 (등록 반영은 크롤 주기에 따라 수시간~며칠)

---

## 4. PulseMCP & mcp.so

**PulseMCP:** `https://www.pulsemcp.com/submit`
- 입력: 이름 `shift-maker`, 설명(위 EN 한 줄), repo URL, 엔드포인트 URL.
- 자동 크롤도 하므로 이미 올라와 있으면 claim만 하면 됩니다.
> 무료 / 무심사(수동 큐레이션은 있으나 리뷰 게이트 아님) / 예상 3분

**mcp.so:** `https://mcp.so/submit`
- **public GitHub repo만** 받습니다. repo URL(`.../shift-maker-mcp`) 제출 → 초안 편집 → 저장하면 자동 게시.
> 무료 / 무심사(공개 repo 자동 게시) / 예상 3분

---

## 5. Anthropic(Claude) 커넥터

두 가지를 구분해야 합니다. **정직하게 현재 상태:**

**(a) 개인용 커스텀 커넥터로 붙이기 (지금 바로 됨, 심사 없음):**
Claude.ai(또는 Claude Desktop) → Settings → Connectors → "Add custom connector" → URL에 엔드포인트 붙여넣기:
`https://shift-maker.playmcp-endpoint.kakaocloud.io/mcp`
> 무료 / 무심사 / 예상 2분. Pro 이상 플랜 필요할 수 있음.

**(b) 공식 커넥터 디렉토리 등재 (심사 있음 — 현재 요건 주의):**
- 제출 폼: `https://claude.com/docs/connectors/building/submission`
- **요구사항(2026 기준, 통과 못 하면 즉시 반려):**
  - **안정적인 개인정보처리방침(Privacy Policy) URL 필수.** 없으면 즉시 반려.
  - 인증이 필요하면 **OAuth 2.1 + PKCE + 실제 사용자 동의 화면**이 있어야 함. **API 키/공유 시크릿(shared secret) 방식은 디렉토리 요건 불충족.**
  - Anthropic 리뷰어가 모든 도구에 대해 실제 기능 테스트 + 정책 스캔 수행.
- **정직한 판단:** 우리 서버는 백엔드 인증을 사용자 OAuth가 아니라 서버-대-서버 shared secret으로 하므로, **현재 형태 그대로는 공식 디렉토리 요건(사용자 OAuth 동의 흐름)을 충족하지 못할 가능성이 높습니다.** 사용자 개인 데이터를 다루지 않으면 OAuth가 "필수"는 아니라는 문서 문구가 있으나, 개인정보처리방침 URL은 무조건 필요합니다. 디렉토리 등재를 노린다면 (1) Privacy Policy 페이지부터 준비, (2) 인증 모델 재검토가 선행 과제입니다. 우선은 위 (a) 커스텀 커넥터로 데모/포트폴리오 링크만 공유하는 것을 권장.
> 디렉토리 등재: 무료 / **심사 있음** / 준비 요건 충족 시 리뷰 수일~수주 (불확실).

---

## 6. OpenAI(ChatGPT) 원격 MCP 추가

**개인 추가 (Developer mode, 지금 됨):**
1. ChatGPT → Settings → Connectors → Advanced settings → **Developer mode 켜기** (Plus/Pro/Business/Enterprise/Edu 웹에서 가능, 베타).
2. Connectors에서 "+" → 새 커넥터 생성:
   - Name: `shift-maker`
   - Description: 위 EN 한 줄
   - MCP server URL: `https://shift-maker.playmcp-endpoint.kakaocloud.io/mcp`
3. 저장 후 대화에서 도구 사용 가능. HTTPS 필수(우리 엔드포인트는 이미 HTTPS).
> 무료(유료 플랜 필요) / 무심사 / 예상 3분

**공개 디렉토리:** OpenAI는 ChatGPT Apps / Apps SDK 기반의 앱 심사·배포 체계를 운영하며, 임의 remote MCP를 등록하는 공개 "커넥터 디렉토리" 제출 폼은 위 개발자 모드 추가와 별개입니다. 앱으로 공개 배포하려면 Apps SDK 흐름(`https://developers.openai.com/apps-sdk/`)을 따라야 하고 심사가 있습니다.
> 앱 공개 배포: 심사 있음 / 요건·소요 불확실(포트폴리오 목적이면 위 Developer mode 추가로 충분).

---

## 마무리 팁

- **순서 추천:** 1(공식 레지스트리) → 2(Smithery) 먼저. 3·4는 크롤러가 repo/레지스트리를 보고 자동으로 주워가는 경우가 많아 나중에 claim만 해도 됩니다.
- 어디서든 "endpoint"는 `.../mcp`로 끝나야 합니다. repo URL과 헷갈리지 마세요.
- 아이콘을 요구하면 `assets/app-icon.png`를 업로드하세요.
