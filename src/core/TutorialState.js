import { DEFAULT_ACTIVITY_STATE } from "../data/tutorial-data.js";

export class TutorialState {
  #lessons;
  #store;
  #snapshot;

  constructor({ lessons, store }) {
    this.#lessons = lessons;
    this.#store = store;
    this.#snapshot = this.#createInitialSnapshot();
  }

  async init() {
    const saved = await this.#store.load();
    if (saved?.activity) {
      this.#snapshot = this.#normalizeSnapshot(saved);
    }
    await this.#store.save(this.#snapshot);
    return this;
  }

  get value() {
    return structuredClone(this.#snapshot);
  }

  get currentLesson() {
    return this.#lessons[this.#snapshot.currentIndex];
  }

  async setCurrentIndex(index) {
    const nextIndex = Math.min(Math.max(index, 0), this.#lessons.length - 1);
    this.#snapshot.currentIndex = nextIndex;
    await this.#persist();
    return this.value;
  }

  async updateActivity(patch) {
    this.#snapshot.activity = {
      ...this.#snapshot.activity,
      ...patch,
    };
    await this.#persist();
    return this.value;
  }

  async resetLesson(lesson) {
    if (lesson.type === "rename") {
      this.#snapshot.activity.renameChoice = "before";
    }
    if (lesson.type === "cards") {
      this.#snapshot.activity.selectedCards[lesson.id] = [
        ...lesson.initialCards,
      ];
    }
    if (lesson.type === "order") {
      this.#snapshot.activity.cardOrder[lesson.id] = [...lesson.initialOrder];
    }
    if (lesson.type === "migrate") {
      this.#snapshot.activity.migrationProgress = 35;
    }
    await this.#persist();
    return this.value;
  }

  #createInitialSnapshot() {
    const selectedCards = {};
    const cardOrder = {};
    for (const lesson of this.#lessons) {
      if (lesson.type === "cards") {
        selectedCards[lesson.id] = [...lesson.initialCards];
      }
      if (lesson.type === "order") {
        cardOrder[lesson.id] = [...lesson.initialOrder];
      }
    }
    return {
      currentIndex: 0,
      activity: {
        ...structuredClone(DEFAULT_ACTIVITY_STATE),
        selectedCards,
        cardOrder,
      },
    };
  }

  #normalizeSnapshot(saved) {
    const base = this.#createInitialSnapshot();
    return {
      currentIndex: Number.isInteger(saved.currentIndex)
        ? Math.min(Math.max(saved.currentIndex, 0), this.#lessons.length - 1)
        : 0,
      activity: {
        ...base.activity,
        ...saved.activity,
        selectedCards: {
          ...base.activity.selectedCards,
          ...(saved.activity.selectedCards ?? {}),
        },
        cardOrder: {
          ...base.activity.cardOrder,
          ...(saved.activity.cardOrder ?? {}),
        },
      },
    };
  }

  async #persist() {
    await this.#store.save(this.#snapshot);
  }
}
