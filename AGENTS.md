# AGENTS.md — Codex/Claude 공통 지시셋

이 파일은 Codex CLI가 직접 읽고, Claude Code는 `CLAUDE.md`의 `@AGENTS.md` import로 로드한다.
두 에이전트가 공유하는 **공통 규칙의 단일 소스**다. Claude 전용 하네스 규칙은 CLAUDE.md 본문에 둔다.

<!-- 32KiB 이하 유지(Codex project_doc_max_bytes). 길어지면 세부는 docs/로 분리하고 여기엔 핵심만. -->

## 프로젝트
- 마틴 파울러 리팩토링 "Change Function Declaration" 초보자용 인터랙티브 웹 튜토리얼.
- 스택: Vanilla JS(ES2022, `type:module`) + Vite. 프레임워크 없음. ES6 Class·생성자 주입·async init.
- **코드 비노출 원칙**: 학습 화면에 코드 스니펫을 한 줄도 표시하지 않는다(아이콘·도형·애니메이션 메타포만).

## 명령어
- 개발: `npm run dev`
- 빌드: `npm run build`  (vite, target es2022 — private 메서드 minify 때문에 es2020 금지)
- 미리보기: `npm run preview`
- 테스트: `npm run test`  (vitest)
- 린트: `npm run lint`  (biome)
- 포맷: `npm run format`

## 코드 스타일
- ES 모듈만(CommonJS `require` 금지). Node 스크립트가 require를 써야 하면 `.cjs` 확장자.
- 디자인 토큰은 `src/styles/tokens.css`의 `:root` 변수가 단일 진실원. 다른 CSS는 `var()` 참조만, 하드코딩 금지.
- 간격 8배수(4/8/16/24/32), radius 0/4/8/12/16, accent 1색 60-30-10. 보라 그라데이션·Inter/Roboto/Arial 금지.
- 인라인 `<style>`/임의 hex 금지. CSS는 `src/styles/*.css`·`src/main.css`로 분리.

## 검증 절차 (보고 전 필수)
- 코드 수정 후 `npm run build`로 빌드 통과를 직접 확인한다.
- UI 변경은 빌드 후 브라우저(또는 Playwright)로 실제 렌더를 스크린샷 확인한 뒤에만 "완료" 보고.

## Obsidian 지식 베이스 (notesmd-cli — 터미널 연동)
Obsidian vault를 터미널에서 읽고 쓸 수 있다. `notesmd-cli`(v0.3.6, PATH 등록됨)를 Bash로 호출한다.

**이 프로젝트의 vault = `step_archive`** (`step_archive/.obsidian/` 풀 구성 존재). step_archive 안에 TOPIC/·archived/·outputs/·references/ 등 모든 산출물이 노트로 들어있다.
- ⚠️ **항상 `--vault step_archive`를 명시하라.** 전역 기본 vault는 `Obsidian Vault`(이 프로젝트와 무관)·DHAX이며, set-default-vault는 전역이라 건드리지 않는다(다른 작업 보호).
- 도메인 지식·설계 결정·step 산출물이 필요하면 코드베이스를 맹목 스캔하기 전에 먼저 step_archive vault를 조회한다.

자주 쓰는 명령(모두 `--vault step_archive` 붙임):
- `notesmd-cli search-content "<검색어>" --vault step_archive` — 본문 검색(가장 유용, 파일:줄 표시)
- `notesmd-cli search "<제목>" --vault step_archive` — 제목 퍼지 검색
- `notesmd-cli print "<노트경로>" --vault step_archive` — 노트 출력
- `notesmd-cli list --vault step_archive` — 파일/폴더 목록
- `notesmd-cli create "<폴더/제목>" --content "<내용>" --vault step_archive` — 노트 생성
- `notesmd-cli frontmatter <노트> --vault step_archive` — 프론트매터 보기/수정

기록 규칙: 중요한 결정·디버깅 해결책은 step_archive vault에 노트로 남겨 다음 세션이 검색할 수 있게 한다(영구 결정은 MemoryHub `remember`도 병행).

### 자동 지식 캡처 (Stop 훅)
세션 종료 시 `tools/knowledge-capture/capture.ps1`(Stop 훅)이 트랜스크립트에서 결정·교훈·발견·검증 항목을 자동 추출해 **`step_archive/knowledge/YYYY-MM-DD.md`** 에 Obsidian 프론트매터(type/date/tags)로 구조화 누적한다(append, 중복 방지, fail-open). 즉 별도 조치 없이도 지식이 step_archive vault에 쌓이며, `notesmd-cli search-content "..." --vault step_archive`로 회수된다. 수동 `create`는 이를 보완하는 용도.

## 영구 메모리 (MemoryHub MCP) — 이 프로젝트에 연결됨
MemoryHub(memoryhub.ai)는 공식 MCP가 없는 SDK 서비스라, **자작 MCP 브리지**(`D:/DHAX/00-meta/scripts/memoryhub-mcp/server.py`, SDK v0.4.0)를 통해 연결한다. 이 프로젝트 `.mcp.json`에 `memoryhub` 서버로 등록됨 → Claude Code 세션에서 MCP 도구로 사용 가능(다음 세션부터 자동 기동). 브리지는 `__file__` 기준으로 D:\DHAX의 .env·PEM을 자기참조하므로 cwd 무관하게 동작한다.

MCP 도구 사용 규약:
- 세션 시작: `recall_context` — 장기 기억 로드
- 작업 중: `call_native_tool`(또는 `memoryhub__search_memory`) — 과거 기억 의미 검색
- 세션 종료: `remember` — 결정·교훈·블로커 커밋
- v0.4.0 주의: 내부적으로 `project_id`가 아니라 `tenant_id`(svc_…) 사용, app_id는 콜러블. 장기 기억 증류는 서버측 비동기 → 직후 회상은 search로.
- 비용 감시: 세션 중 `/usage`로 MCP 토큰 사용량 주기 확인.

> 메모리 계층 역할 분담: 휘발성 단기·문서형 지식 → Obsidian(notesmd-cli). 세션 간 영구 기억(결정·교훈) → MemoryHub MCP. Codex 측 단기 연속성 → Codex 네이티브 `memories`(이미 사용 중).

## 안전
- 파괴적 명령(`rm`, 강제 git reset 등)·외부 영향 행동(push/배포/PR)은 실행 전 사용자 승인을 받는다.
- `.claude/` 디렉토리에는 `commands/*.md`와 settings 외 파일을 생성하지 않는다.
