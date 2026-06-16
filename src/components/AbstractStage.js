import { APP_CASES } from "../data/tutorial-data.js";
import { BaseComponent } from "./BaseComponent.js";

export class AbstractStage extends BaseComponent {
  async init() {
    await Promise.resolve();
    return this;
  }

  render({ lesson, evaluation, activity }) {
    const appCase = APP_CASES.find((item) => item.id === lesson.caseId);
    this.setHTML(`
      <article class="lesson-card" data-lesson-type="${lesson.type}">
        <div class="lesson-card__header">
          <div>
            <p class="eyebrow">${appCase.name} 사례</p>
            <h2>${lesson.title}</h2>
          </div>
          <span class="concept-pill">${lesson.badge}</span>
        </div>
        <p class="lesson-summary">${lesson.summary}</p>
        ${this.#renderVisual(lesson, evaluation, activity, appCase)}
      </article>
    `);
  }

  #renderVisual(lesson, evaluation, activity, appCase) {
    if (lesson.type === "rename") {
      return this.#renderRename(evaluation, appCase);
    }
    if (lesson.type === "cards") {
      return this.#renderCards(lesson, evaluation, appCase);
    }
    if (lesson.type === "order") {
      return this.#renderOrder(lesson, evaluation, activity, appCase);
    }
    return this.#renderMigration(lesson, evaluation, appCase);
  }

  #renderRename(evaluation, appCase) {
    const choice = evaluation.complete ? "after" : "before";
    return `
      <div class="abstract-board rename-board" data-tone="${evaluation.tone}">
        <div class="request-cluster" aria-label="요청 지점">
          ${["홈", "장바구니", appCase.shortName]
            .map(
              (label, index) =>
                `<span class="request-dot request-dot--${index}">${label}</span>`,
            )
            .join("")}
        </div>
        <div class="signal-line" aria-hidden="true"></div>
        <div class="name-gate" data-choice="${choice}">
          <span class="gate-caption">현재 이름표</span>
          <strong>${evaluation.activeLabel}</strong>
          <span>${appCase.signal}</span>
        </div>
        <div class="service-cluster" aria-label="처리 지점">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    `;
  }

  #renderCards(lesson, evaluation, appCase) {
    const allCards = [
      ...lesson.requiredCards,
      ...lesson.optionalCards,
      ...lesson.obsoleteCards,
    ];
    return `
      <div class="abstract-board card-board" data-tone="${evaluation.tone}">
        <div class="app-orbit" aria-label="${appCase.name}">
          <span>${appCase.shortName}</span>
          <small>${appCase.signal}</small>
        </div>
        <div class="card-stream" aria-label="정보 카드">
          ${allCards
            .map((card) => {
              const active = evaluation.selected.includes(card);
              const stale = lesson.obsoleteCards.includes(card);
              return `<span class="info-card${active ? " is-active" : ""}${stale ? " is-stale" : ""}">${card}</span>`;
            })
            .join("")}
        </div>
        <div class="flow-gate">
          <span class="flow-gate__ring"></span>
          <strong>${evaluation.complete ? "흐름 안정" : "흐름 점검"}</strong>
        </div>
      </div>
    `;
  }

  #renderOrder(lesson, evaluation, activity, appCase) {
    const order = activity.cardOrder?.[lesson.id] ?? lesson.initialOrder;
    return `
      <div class="abstract-board order-board" data-tone="${evaluation.tone}">
        <div class="order-stack" aria-label="현재 읽는 순서">
          ${order
            .map(
              (card, index) => `
                <span class="order-token" data-match="${lesson.targetOrder[index] === card}">
                  <small>${index + 1}</small>${card}
                </span>
              `,
            )
            .join("")}
        </div>
        <div class="order-pulse" aria-hidden="true">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <div class="app-orbit">
          <span>${appCase.shortName}</span>
          <small>${appCase.signal}</small>
        </div>
      </div>
    `;
  }

  #renderMigration(lesson, evaluation, appCase) {
    const progress = Math.min(Math.max(evaluation.progress, 0), 100);
    const progressBucket = Math.round(progress / 5) * 5;
    return `
      <div class="abstract-board migrate-board migrate-board--${progressBucket}" data-tone="${evaluation.tone}">
        <div class="bridge-door bridge-door--old">
          <span>${lesson.bridgeLabels[0]}</span>
        </div>
        <div class="migration-bridge" aria-hidden="true">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>
        <div class="bridge-door bridge-door--new">
          <span>${lesson.bridgeLabels[1]}</span>
          <small>${appCase.shortName}</small>
        </div>
      </div>
    `;
  }
}
