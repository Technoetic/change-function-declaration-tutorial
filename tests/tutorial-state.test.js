import { describe, expect, it } from "vitest";
import { ProgressStore } from "../src/core/ProgressStore.js";
import { TutorialState } from "../src/core/TutorialState.js";
import { LESSONS } from "../src/data/tutorial-data.js";

class MemoryStorage {
  values = new Map();

  getItem(key) {
    return this.values.get(key) ?? null;
  }

  setItem(key, value) {
    this.values.set(key, value);
  }
}

class BrokenStorage {
  getItem() {
    throw new Error("read failed");
  }

  setItem() {
    throw new Error("write failed");
  }
}

describe("TutorialState", () => {
  it("creates defaults for every activity type", async () => {
    const storage = new MemoryStorage();
    const state = new TutorialState({
      lessons: LESSONS,
      store: new ProgressStore({ key: "test", storage }),
    });

    await state.init();
    const snapshot = state.value;

    expect(snapshot.currentIndex).toBe(0);
    expect(snapshot.activity.selectedCards["add-info"]).toEqual([
      "출발지",
      "도착지",
    ]);
    expect(snapshot.activity.cardOrder.reorder).toEqual([
      "금액",
      "받는 사람",
      "메모",
    ]);
  });

  it("clamps navigation and persists updates", async () => {
    const storage = new MemoryStorage();
    const store = new ProgressStore({ key: "test", storage });
    const state = new TutorialState({ lessons: LESSONS, store });

    await state.init();
    await state.setCurrentIndex(999);
    await state.updateActivity({ renameChoice: "after" });

    const saved = JSON.parse(storage.getItem("test"));
    expect(saved.currentIndex).toBe(LESSONS.length - 1);
    expect(saved.activity.renameChoice).toBe("after");
  });

  it("resets each lesson activity to its starting shape", async () => {
    const storage = new MemoryStorage();
    const state = new TutorialState({
      lessons: LESSONS,
      store: new ProgressStore({ key: "test", storage }),
    });

    await state.init();
    await state.updateActivity({
      renameChoice: "after",
      selectedCards: {
        "add-info": ["출발지", "도착지", "이동 수단"],
        "remove-info": ["곡", "재생목록"],
      },
      cardOrder: { reorder: ["받는 사람", "금액", "메모"] },
      migrationProgress: 95,
    });

    await state.setCurrentIndex(0);
    await state.resetLesson(state.currentLesson);
    await state.setCurrentIndex(1);
    await state.resetLesson(state.currentLesson);
    await state.setCurrentIndex(3);
    await state.resetLesson(state.currentLesson);
    await state.setCurrentIndex(4);
    await state.resetLesson(state.currentLesson);

    const snapshot = state.value;
    expect(snapshot.activity.renameChoice).toBe("before");
    expect(snapshot.activity.selectedCards["add-info"]).toEqual([
      "출발지",
      "도착지",
    ]);
    expect(snapshot.activity.cardOrder.reorder).toEqual([
      "금액",
      "받는 사람",
      "메모",
    ]);
    expect(snapshot.activity.migrationProgress).toBe(35);
  });

  it("continues when storage is unavailable", async () => {
    const store = new ProgressStore({
      key: "test",
      storage: new BrokenStorage(),
    });
    const state = new TutorialState({ lessons: LESSONS, store });

    await state.init();
    const saved = await store.save({ ok: true });

    expect(state.value.currentIndex).toBe(0);
    expect(saved).toBe(false);
  });
});
