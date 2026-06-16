import { PRINCIPLES } from "../data/tutorial-data.js";
import { BaseComponent } from "./BaseComponent.js";

export class OutcomePanel extends BaseComponent {
  async init() {
    await Promise.resolve();
    return this;
  }

  render({ lesson, evaluation }) {
    this.setHTML(`
      <section class="outcome-panel" data-tone="${evaluation.tone}">
        <div class="score-row">
          <div>
            <p class="eyebrow">약속 안정도</p>
            <strong>${evaluation.score}%</strong>
          </div>
          <meter class="score-meter" min="0" max="100" value="${evaluation.score}">
            ${evaluation.score}%
          </meter>
        </div>
        <p class="outcome-message">${evaluation.message}</p>
        <div class="missing-list">
          ${
            evaluation.missing.length
              ? evaluation.missing
                  .map((item) => `<span>${item}</span>`)
                  .join("")
              : `<span>${lesson.concept} 완료</span>`
          }
        </div>
        <ul class="principle-list">
          ${PRINCIPLES.map((principle) => `<li>${principle}</li>`).join("")}
        </ul>
      </section>
    `);
  }
}
