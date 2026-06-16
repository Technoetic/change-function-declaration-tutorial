// @MX:NOTE: Vite 빌드 설정. GitHub Pages 배포 시 base를 레포 하위 경로로 전환한다.
// @MX:WARN: GITHUB_ACTIONS 환경에서만 base가 "/change-function-declaration-tutorial/"로 바뀐다.
// @MX:REASON: 로컬 dev/preview에서 같은 base를 쓰면 자산 404가 나므로 환경 분기가 필수.
import { defineConfig } from "vite";

// GitHub Pages 프로젝트 사이트는 /<repo>/ 하위 경로로 서빙되므로
// 자산 경로(base)를 레포 이름에 맞춘다. 로컬 dev/preview는 "/" 유지.
const base =
  process.env.GITHUB_ACTIONS === "true"
    ? "/change-function-declaration-tutorial/"
    : "/";

export default defineConfig({
  base,
  build: {
    target: "es2022",
  },
});
