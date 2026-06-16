import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  createIcons,
  RotateCcw,
} from "lucide";
import { AbstractStage } from "./components/AbstractStage.js";
import { ControlPanel } from "./components/ControlPanel.js";
import { LessonNav } from "./components/LessonNav.js";
import { OutcomePanel } from "./components/OutcomePanel.js";
import { ShellView } from "./components/ShellView.js";
import { EventBus } from "./core/EventBus.js";
import { ProgressStore } from "./core/ProgressStore.js";
import { ScenarioEngine } from "./core/ScenarioEngine.js";
import { TutorialState } from "./core/TutorialState.js";
import { LESSONS } from "./data/tutorial-data.js";
import "./main.css";

class IconRenderer {
  refresh() {
    createIcons({
      icons: {
        ArrowDown,
        ArrowUp,
        ChevronLeft,
        ChevronRight,
        RotateCcw,
      },
    });
  }
}

class TutorialApp {
  #root;
  #eventBus;
  #state;
  #engine;
  #icons;
  #views;

  constructor({ root, eventBus, state, engine, icons }) {
    this.#root = root;
    this.#eventBus = eventBus;
    this.#state = state;
    this.#engine = engine;
    this.#icons = icons;
    this.#views = {};
  }

  async init() {
    await this.#state.init();
    const shell = new ShellView({ root: this.#root, eventBus: this.#eventBus });
    await shell.init();
    const slots = shell.getSlots();
    this.#views = {
      shell,
      nav: await new LessonNav({
        root: slots.lessonList,
        eventBus: this.#eventBus,
      }).init(),
      stage: await new AbstractStage({
        root: slots.stage,
        eventBus: this.#eventBus,
      }).init(),
      controls: await new ControlPanel({
        root: slots.controls,
        eventBus: this.#eventBus,
      }).init(),
      outcome: await new OutcomePanel({
        root: slots.outcome,
        eventBus: this.#eventBus,
      }).init(),
    };
    this.#bindEvents();
    return this;
  }

  async start() {
    // @MX:NOTE Class 기반 렌더 루프가 모든 학습 위젯을 동일한 평가 엔진으로 동기화한다.
    await this.#render();
  }

  #bindEvents() {
    this.#eventBus.on("lesson:set-index", async (event) => {
      await this.#state.setCurrentIndex(event.detail.index);
      await this.#render();
    });

    this.#eventBus.on("lesson:navigate", async (event) => {
      const snapshot = this.#state.value;
      const offset = event.detail.direction === "next" ? 1 : -1;
      await this.#state.setCurrentIndex(snapshot.currentIndex + offset);
      await this.#render();
    });

    this.#eventBus.on("activity:update", async (event) => {
      await this.#state.updateActivity(event.detail);
      await this.#render();
    });

    this.#eventBus.on("card:toggle", async (event) => {
      const lesson = this.#state.currentLesson;
      const snapshot = this.#state.value;
      const selected = new Set(
        snapshot.activity.selectedCards[lesson.id] ?? [],
      );
      if (event.detail.checked) {
        selected.add(event.detail.card);
      } else {
        selected.delete(event.detail.card);
      }
      await this.#state.updateActivity({
        selectedCards: {
          ...snapshot.activity.selectedCards,
          [lesson.id]: [...selected],
        },
      });
      await this.#render();
    });

    this.#eventBus.on("order:move", async (event) => {
      const lesson = this.#state.currentLesson;
      const snapshot = this.#state.value;
      const order = [
        ...(snapshot.activity.cardOrder[lesson.id] ?? lesson.initialOrder),
      ];
      const index = order.indexOf(event.detail.card);
      const nextIndex = event.detail.direction === "up" ? index - 1 : index + 1;
      if (index < 0 || nextIndex < 0 || nextIndex >= order.length) {
        return;
      }
      [order[index], order[nextIndex]] = [order[nextIndex], order[index]];
      await this.#state.updateActivity({
        cardOrder: {
          ...snapshot.activity.cardOrder,
          [lesson.id]: order,
        },
      });
      await this.#render();
    });

    this.#eventBus.on("lesson:reset", async () => {
      await this.#state.resetLesson(this.#state.currentLesson);
      await this.#render();
    });
  }

  async #render() {
    await Promise.resolve();
    const snapshot = this.#state.value;
    const evaluations = LESSONS.map((lesson) =>
      this.#engine.evaluate(lesson, snapshot.activity),
    );
    const lesson = LESSONS[snapshot.currentIndex];
    const evaluation = evaluations[snapshot.currentIndex];
    const completion = Math.round(
      evaluations.reduce((sum, item) => sum + item.score, 0) /
        evaluations.length,
    );
    this.#views.shell.update({
      currentIndex: snapshot.currentIndex,
      total: LESSONS.length,
      completion,
    });
    this.#views.nav.render({
      lessons: LESSONS,
      currentIndex: snapshot.currentIndex,
      evaluations,
    });
    this.#views.stage.render({
      lesson,
      evaluation,
      activity: snapshot.activity,
    });
    this.#views.controls.render({ lesson, activity: snapshot.activity });
    this.#views.outcome.render({ lesson, evaluation });
    this.#icons.refresh();
  }
}

async function boot() {
  const root = document.querySelector("#app");
  const eventBus = new EventBus();
  const store = new ProgressStore({
    key: "change-function-declaration-progress",
    storage: globalThis.localStorage,
  });
  const app = new TutorialApp({
    root,
    eventBus,
    state: new TutorialState({ lessons: LESSONS, store }),
    engine: new ScenarioEngine(),
    icons: new IconRenderer(),
  });
  await app.init();
  await app.start();
}

boot().catch((error) => {
  const root = document.querySelector("#app");
  root.textContent = "튜토리얼을 여는 중 문제가 생겼습니다.";
  console.error(error);
});
