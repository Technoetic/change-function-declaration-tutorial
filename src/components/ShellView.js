import { BaseComponent } from "./BaseComponent.js";

export class ShellView extends BaseComponent {
  async init() {
    await Promise.resolve();
    this.setHTML(`
      <main class="app-shell" aria-labelledby="app-title">
        <header class="topbar">
          <div class="brand-lockup">
            <div class="brand-mark" aria-hidden="true">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div>
              <p class="eyebrow">Martin Fowler Refactoring</p>
              <h1 id="app-title">Change Function Declaration</h1>
            </div>
          </div>
          <div class="topbar-actions" aria-label="단계 이동">
            <button class="icon-button" type="button" data-action="prev" aria-label="이전 단계">
              <i data-lucide="chevron-left" aria-hidden="true"></i>
            </button>
            <div class="step-counter" data-counter>1 / 5</div>
            <button class="icon-button" type="button" data-action="next" aria-label="다음 단계">
              <i data-lucide="chevron-right" aria-hidden="true"></i>
            </button>
          </div>
        </header>

        <section class="workbench" aria-label="인터랙티브 튜토리얼">
          <aside class="lesson-rail" aria-label="학습 단계">
            <div class="rail-heading">
              <span>학습 흐름</span>
              <strong data-progress-label>0%</strong>
            </div>
            <nav class="lesson-list" data-lesson-list></nav>
          </aside>

          <section class="stage-column" aria-label="추상 무대">
            <div data-stage-root></div>
          </section>

          <aside class="control-column" aria-label="조작 패널">
            <div data-control-root></div>
            <div data-outcome-root></div>
          </aside>
        </section>
      </main>
    `);
    this.#bindNavigation();
    return this;
  }

  update({ currentIndex, total, completion }) {
    const counter = this.find("[data-counter]");
    const progressLabel = this.find("[data-progress-label]");
    if (counter) {
      counter.textContent = `${currentIndex + 1} / ${total}`;
    }
    if (progressLabel) {
      progressLabel.textContent = `${completion}%`;
    }
  }

  getSlots() {
    return {
      lessonList: this.find("[data-lesson-list]"),
      stage: this.find("[data-stage-root]"),
      controls: this.find("[data-control-root]"),
      outcome: this.find("[data-outcome-root]"),
    };
  }

  #bindNavigation() {
    this.root.addEventListener("click", (event) => {
      const button = event.target.closest("[data-action]");
      if (!button) {
        return;
      }
      this.eventBus.emit("lesson:navigate", {
        direction: button.dataset.action,
      });
    });
  }
}
