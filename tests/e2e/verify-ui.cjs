const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");
const AxeBuilder = require("@axe-core/playwright").default;

const rootDir = path.resolve(__dirname, "..", "..");
const screenshotDir = path.join(rootDir, "step_archive", "screenshots");
fs.mkdirSync(screenshotDir, { recursive: true });
const progressPath = path.join(
  rootDir,
  "step_archive",
  "verify-ui-progress.txt",
);
fs.writeFileSync(progressPath, "", "utf8");

const forbiddenSnippetPatterns = [
  /function\s+\w+/i,
  /\w+\s*\([^)]*\)\s*\{/,
  /=>/,
  /const\s+\w+/i,
  /let\s+\w+/i,
];

async function expectVisible(page, text) {
  const locator = page.getByText(text, { exact: false }).first();
  await locator.waitFor({ state: "visible", timeout: 5000 });
}

async function expectNoCardOverlap(page) {
  await page.waitForTimeout(150);
  await expectNoOverlap({
    page,
    sourceSelector: ".card-board .info-card",
    targetSelector: ".card-board .flow-gate",
    label: "card board info cards overlap the outcome gate",
  });
}

async function expectNoOrderOverlap(page) {
  await page.waitForTimeout(150);
  await expectNoOverlap({
    page,
    sourceSelector: ".order-board .order-token",
    targetSelector: ".order-board .app-orbit",
    label: "order board tokens overlap the app case marker",
  });
  const markerBox = await page.locator(".order-board .app-orbit").boundingBox();
  const stackBox = await page
    .locator(".order-board .order-stack")
    .boundingBox();
  if (!markerBox || !stackBox) {
    throw new Error("order board alignment target is missing");
  }
  const markerCenter = markerBox.y + markerBox.height / 2;
  const stackCenter = stackBox.y + stackBox.height / 2;
  const verticalDrift = Math.abs(markerCenter - stackCenter);
  if (verticalDrift > 96) {
    throw new Error(
      "order board app marker is visually detached from the order stack",
    );
  }
}

async function expectNoOverlap({
  page,
  sourceSelector,
  targetSelector,
  label,
}) {
  const targetBox = await page.locator(targetSelector).boundingBox();
  const sourceBoxes = await page.locator(sourceSelector).evaluateAll((nodes) =>
    nodes.map((node) => {
      const rect = node.getBoundingClientRect();
      return {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
      };
    }),
  );
  if (!targetBox) {
    throw new Error(`${label}: target is missing`);
  }
  const overlaps = sourceBoxes.some((cardBox) => {
    const separated =
      cardBox.x + cardBox.width <= targetBox.x ||
      targetBox.x + targetBox.width <= cardBox.x ||
      cardBox.y + cardBox.height <= targetBox.y ||
      targetBox.y + targetBox.height <= cardBox.y;
    return !separated;
  });
  if (overlaps) {
    throw new Error(label);
  }
}

function checkpoint(label) {
  fs.appendFileSync(
    progressPath,
    `${new Date().toISOString()} ${label}\n`,
    "utf8",
  );
}

(async () => {
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
    });
    const page = await context.newPage();
    page.setDefaultTimeout(10000);
    const consoleErrors = [];
    page.on("console", (message) => {
      if (message.type() === "error") {
        consoleErrors.push(message.text());
      }
    });
    page.on("pageerror", (error) => consoleErrors.push(error.message));

    checkpoint("goto desktop");
    await page.goto("http://127.0.0.1:5173", { waitUntil: "domcontentloaded" });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: "domcontentloaded" });
    await expectVisible(page, "Change Function Declaration");
    await page.screenshot({
      path: path.join(screenshotDir, "final-desktop.png"),
      fullPage: true,
    });

    checkpoint("desktop screenshot");
    const bodyText = (await page.locator("body").innerText()).replaceAll(
      "Change Function Declaration",
      "",
    );
    for (const pattern of forbiddenSnippetPatterns) {
      if (pattern.test(bodyText)) {
        throw new Error(
          `Learner-facing text contains code-like pattern: ${pattern}`,
        );
      }
    }

    checkpoint("rename");
    await page.locator("[data-rename-choice='after']").click();
    await expectVisible(page, "100%");

    checkpoint("add info");
    await page.locator("[data-lesson-index='1']").click();
    await page.locator("[data-card-toggle='이동 수단']").click();
    await expectVisible(page, "흐름 안정");
    await expectNoCardOverlap(page);
    await page.screenshot({
      path: path.join(screenshotDir, "final-card-board.png"),
      fullPage: true,
    });

    checkpoint("remove info");
    await page.locator("[data-lesson-index='2']").click();
    await page.locator("[data-card-toggle='옛 보관함']").click();
    await expectVisible(page, "흐름이 가벼워진다");
    await expectNoCardOverlap(page);
    await page.screenshot({
      path: path.join(screenshotDir, "final-remove-card-board.png"),
      fullPage: true,
    });

    checkpoint("reorder");
    await page.locator("[data-lesson-index='3']").click();
    await page
      .locator("[data-move-card='받는 사람'][data-direction='up']")
      .click();
    await expectVisible(page, "읽는 순서가 맞아진다");
    await expectNoOrderOverlap(page);
    await page.screenshot({
      path: path.join(screenshotDir, "final-order-board.png"),
      fullPage: true,
    });

    checkpoint("migration");
    await page.locator("[data-lesson-index='4']").click();
    await page.locator("[data-migration-range]").fill("95");
    await expectVisible(page, "옛 문을 닫을 수 있다");
    await page.screenshot({
      path: path.join(screenshotDir, "final-interaction.png"),
      fullPage: true,
    });

    checkpoint("axe");
    const axeResults = await new AxeBuilder({ page }).analyze();
    const seriousViolations = axeResults.violations.filter((violation) =>
      ["critical", "serious"].includes(violation.impact),
    );

    checkpoint("mobile");
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
    });
    const mobile = await mobileContext.newPage();
    mobile.setDefaultTimeout(10000);
    await mobile.goto("http://127.0.0.1:5173", {
      waitUntil: "domcontentloaded",
    });
    await mobile.screenshot({
      path: path.join(screenshotDir, "final-mobile.png"),
      fullPage: true,
    });

    const result = {
      consoleErrors,
      seriousAccessibilityViolations: seriousViolations.map((violation) => ({
        id: violation.id,
        impact: violation.impact,
        nodes: violation.nodes.map((node) => ({
          target: node.target,
          summary: node.failureSummary,
        })),
      })),
      screenshots: [
        "final-desktop.png",
        "final-card-board.png",
        "final-remove-card-board.png",
        "final-order-board.png",
        "final-interaction.png",
        "final-mobile.png",
      ],
    };
    fs.writeFileSync(
      path.join(rootDir, "step_archive", "browser-verification-final.json"),
      JSON.stringify(result, null, 2),
      "utf8",
    );

    if (consoleErrors.length > 0) {
      throw new Error(`Console errors found: ${consoleErrors.join("; ")}`);
    }
    if (seriousViolations.length > 0) {
      throw new Error(
        `Accessibility violations found: ${seriousViolations.length}`,
      );
    }
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
