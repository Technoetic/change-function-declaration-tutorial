# Change Function Declaration — 인터랙티브 튜토리얼

마틴 파울러 리팩토링 카탈로그의 **Change Function Declaration**(함수 선언 변경)을
코드 한 줄 없이 아이콘·도형·애니메이션 메타포만으로 학습하는 초보자용 인터랙티브 웹 튜토리얼.

🔗 **데모:** https://technoetic.github.io/change-function-declaration-tutorial/

## 기술 스택

- Vanilla JS (ES2022, `type: module`) — 프레임워크 없음
- Vite 8 (빌드 타깃 `es2022`)
- 디자인 토큰 기반 CSS (`src/styles/tokens.css` 단일 진실원)

## 개발

```bash
npm install
npm run dev       # 개발 서버
npm run build     # 프로덕션 빌드 (dist/)
npm run preview   # 빌드 결과 미리보기
npm run test      # vitest
npm run lint      # biome
```

## 배포

`main` 브랜치에 push하면 GitHub Actions(`.github/workflows/deploy.yml`)가
`vite build` 후 GitHub Pages로 자동 배포한다.

## 설계 원칙

- **코드 비노출**: 학습 화면에 코드 스니펫을 표시하지 않는다(시각 메타포만).
- **디자인 토큰**: 간격 8배수, radius 0/4/8/12/16, accent 1색(60-30-10).
