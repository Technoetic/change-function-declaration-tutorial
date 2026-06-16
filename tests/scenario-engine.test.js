import { describe, expect, it } from "vitest";
import { ScenarioEngine } from "../src/core/ScenarioEngine.js";
import { LESSONS } from "../src/data/tutorial-data.js";

const engine = new ScenarioEngine();

describe("ScenarioEngine", () => {
  it("scores rename as complete only after the clearer label is selected", () => {
    const lesson = LESSONS.find((item) => item.id === "rename");

    expect(engine.evaluate(lesson, { renameChoice: "before" }).complete).toBe(
      false,
    );
    expect(engine.evaluate(lesson, { renameChoice: "after" }).score).toBe(100);
  });

  it("requires missing cards and removes obsolete cards", () => {
    const addInfo = LESSONS.find((item) => item.id === "add-info");
    const removeInfo = LESSONS.find((item) => item.id === "remove-info");

    expect(
      engine.evaluate(addInfo, {
        selectedCards: { "add-info": ["출발지", "도착지"] },
      }).complete,
    ).toBe(false);
    expect(
      engine.evaluate(removeInfo, {
        selectedCards: { "remove-info": ["곡", "재생목록"] },
      }).complete,
    ).toBe(true);
  });

  it("matches order by card position", () => {
    const lesson = LESSONS.find((item) => item.id === "reorder");
    const result = engine.evaluate(lesson, {
      cardOrder: { reorder: ["받는 사람", "금액", "메모"] },
    });

    expect(result.complete).toBe(true);
    expect(result.score).toBe(100);
  });

  it("marks migration complete near the end of the bridge", () => {
    const lesson = LESSONS.find((item) => item.id === "migrate");

    expect(engine.evaluate(lesson, { migrationProgress: 65 }).complete).toBe(
      false,
    );
    expect(engine.evaluate(lesson, { migrationProgress: 95 }).complete).toBe(
      true,
    );
  });
});
