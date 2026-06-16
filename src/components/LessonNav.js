import { BaseComponent } from "./BaseComponent.js";

export class LessonNav extends BaseComponent {
  async init() {
    await Promise.resolve();
    this.root.addEventListener("click", (event) => {
      const button = event.target.closest("[data-lesson-index]");
      if (!button) {
        return;
      }
      this.eventBus.emit("lesson:set-index", {
        index: Number(button.dataset.lessonIndex),
      });
    });
    return this;
  }

  render({ lessons, currentIndex, evaluations }) {
    this.setHTML(
      lessons
        .map((lesson, index) => {
          const evaluation = evaluations[index];
          const active = index === currentIndex;
          return `
            <button class="lesson-tab${active ? " is-active" : ""}" type="button"
              data-lesson-index="${index}" aria-pressed="${active}">
              <span class="lesson-tab__number">${index + 1}</span>
              <span class="lesson-tab__body">
                <span>${lesson.shortTitle}</span>
                <small>${lesson.concept}</small>
              </span>
              <span class="lesson-tab__score" aria-label="완성도 ${evaluation.score}점">
                ${evaluation.complete ? "완료" : `${evaluation.score}%`}
              </span>
            </button>
          `;
        })
        .join(""),
    );
  }
}
