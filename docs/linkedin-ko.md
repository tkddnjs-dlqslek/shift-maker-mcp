LLM은 근무표를 "그럴듯하게" 틀립니다. 이중배정, 주52시간 초과, 연소자 야간근무 — 자신 있게 위법한 표를 내놓죠. 그래서 생성은 수학 솔버에 맡겼습니다.

카카오 AGENTIC PLAYER 10 (2026) 출품작 shift-maker를 공개합니다.

대화만으로 가게·교대·직원·제약을 등록하면, OR-Tools CP-SAT 엔진이 근로기준법을 지키는 주간 근무표를 만듭니다. 주 52시간 상한, 주휴일, 연소근로자 야간(22~06시) 금지를 하드 제약으로 처리하고, 못 풀 땐 "불가능 + 사유"를 명확히 돌려줍니다. 그럴듯한 위반은 나오지 않습니다.

요일별 증원(주말 야간 3명), 요일×교대 고정배정, 자정 넘기는 야간 교대(익일 표기), 그리고 직원이 직접 채우는 셀프 가용시간 링크까지 지원합니다.

검증: 영화관 84슬롯을 포함한 5개 업종 복합 시나리오가 전부 OPTIMAL로 풀렸습니다. warm 상태 응답은 약 1초입니다.

기술: Node/TypeScript MCP 서버 + Streamable HTTP, 백엔드는 호스티드. Repo: https://github.com/tkddnjs-dlqslek/shift-maker-mcp / 라이브 엔드포인트: https://shift-maker.playmcp-endpoint.kakaocloud.io/mcp

#MCP #ModelContextProtocol #AI에이전트 #ORTools #사이드프로젝트
