import { BaseComponent } from "./BaseComponent.js";

export class ControlPanel extends BaseComponent {
  async init() {
    await Promise.resolve();
    this.root.addEventListener("click", (event) => this.#handleClick(event));
    this.root.addEventListener("change", (event) => this.#handleChange(event));
    this.root.addEventListener("input", (event) => this.#handleInput(event));
    return this;
  }

  render({ lesson, activity }) {
    this.setHTML(`
      <section class="control-panel">
        <div class="panel-heading">
          <p class="eyebrow">직접 조작</p>
          <h3>${lesson.concept}</h3>
        </div>
        ${this.#renderControls(lesson, activity)}
        <div class="control-actions">
          <button class="secondary-button" type="button" data-reset-lesson>
            <i data-lucide="rotate-ccw" aria-hidden="true"></i>
            <span>처음 상태</span>
          </button>
        </div>
      </section>
    `);
  }

  #renderControls(lesson, activity) {
    if (lesson.type === "rename") {
      return this.#renderRenameControls(lesson, activity);
    }
    if (lesson.type === "cards") {
      return this.#renderCardControls(lesson, activity);
    }
    if (lesson.type === "order") {
      return this.#renderOrderControls(lesson, activity);
    }
    return this.#renderMigrationControls(activity);
  }

  #renderRenameControls(lesson, activity) {
    const choice = activity.renameChoice;
    return `
      <div class="segmented-control" role="group" aria-label="이름표 선택">
        ${Object.entries(lesson.controls)
          .map(
            ([value, label]) => `
              <button class="segment${choice === value ? " is-selected" : ""}" type="button"
                data-rename-choice="${value}" aria-pressed="${choice === value}">
                ${label}
              </button>
            `,
          )
          .join("")}
      </div>
    `;
  }

  #renderCardControls(lesson, activity) {
    const selected = activity.selectedCards?.[lesson.id] ?? [];
    const cards = [
      ...lesson.requiredCards,
      ...lesson.optionalCards,
      ...lesson.obsoleteCards,
    ];
    return `
      <div class="toggle-grid" aria-label="정보 카드 선택">
        ${cards
          .map(
            (card) => `
              <label class="toggle-card${selected.includes(card) ? " is-checked" : ""}">
                <input type="checkbox" data-card-toggle="${card}" ${selected.includes(card) ? "checked" : ""} />
                <span>${card}</span>
              </label>
            `,
          )
          .join("")}
      </div>
    `;
  }

  #renderOrderControls(lesson, activity) {
    const order = activity.cardOrder?.[lesson.id] ?? lesson.initialOrder;
    return `
      <ol class="order-controls" aria-label="정보 순서">
        ${order
          .map(
            (card, index) => `
              <li>
                <span>${card}</span>
                <div>
                  <button class="icon-button" type="button" data-move-card="${card}" data-direction="up"
                    aria-label="${card} 위로 이동" ${index === 0 ? "disabled" : ""}>
                    <i data-lucide="arrow-up" aria-hidden="true"></i>
                  </button>
                  <button class="icon-button" type="button" data-move-card="${card}" data-direction="down"
                    aria-label="${card} 아래로 이동" ${index === order.length - 1 ? "disabled" : ""}>
                    <i data-lucide="arrow-down" aria-hidden="true"></i>
                  </button>
                </div>
              </li>
            `,
          )
          .join("")}
      </ol>
    `;
  }

  #renderMigrationControls(activity) {
    const progress = Number(activity.migrationProgress ?? 0);
    return `
      <div class="range-field">
        <label for="migration-progress">새 문으로 이동한 지점</label>
        <input id="migration-progress" type="range" min="0" max="100" step="5"
          value="${progress}" data-migration-range />
        <output for="migration-progress">${progress}%</output>
      </div>
      <div class="stepper-row" aria-label="전환 빠른 선택">
        <button type="button" class="secondary-button" data-migration-jump="35">초기</button>
        <button type="button" class="secondary-button" data-migration-jump="65">중간</button>
        <button type="button" class="secondary-button" data-migration-jump="95">마무리</button>
      </div>
    `;
  }

  #handleClick(event) {
    const renameButton = event.target.closest("[data-rename-choice]");
    if (renameButton) {
      this.eventBus.emit("activity:update", {
        renameChoice: renameButton.dataset.renameChoice,
      });
      return;
    }

    const moveButton = event.target.closest("[data-move-card]");
    if (moveButton) {
      this.eventBus.emit("order:move", {
        card: moveButton.dataset.moveCard,
        direction: moveButton.dataset.direction,
      });
      return;
    }

    const migrationJump = event.target.closest("[data-migration-jump]");
    if (migrationJump) {
      this.eventBus.emit("activity:update", {
        migrationProgress: Number(migrationJump.dataset.migrationJump),
      });
      return;
    }

    if (event.target.closest("[data-reset-lesson]")) {
      this.eventBus.emit("lesson:reset");
    }
  }

  #handleChange(event) {
    const input = event.target.closest("[data-card-toggle]");
    if (!input) {
      return;
    }
    this.eventBus.emit("card:toggle", {
      card: input.dataset.cardToggle,
      checked: input.checked,
    });
  }

  #handleInput(event) {
    const range = event.target.closest("[data-migration-range]");
    if (!range) {
      return;
    }
    this.eventBus.emit("activity:update", {
      migrationProgress: Number(range.value),
    });
  }
}
