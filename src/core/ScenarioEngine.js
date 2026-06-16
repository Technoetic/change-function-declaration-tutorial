export class ScenarioEngine {
  evaluate(lesson, activity) {
    if (lesson.type === "rename") {
      return this.#evaluateRename(lesson, activity);
    }
    if (lesson.type === "cards") {
      return this.#evaluateCards(lesson, activity);
    }
    if (lesson.type === "order") {
      return this.#evaluateOrder(lesson, activity);
    }
    return this.#evaluateMigration(lesson, activity);
  }

  #evaluateRename(lesson, activity) {
    const complete = activity.renameChoice === "after";
    return {
      complete,
      score: complete ? 100 : 45,
      tone: complete ? "strong" : "soft",
      message: complete ? lesson.resultText.after : lesson.resultText.before,
      activeLabel: complete ? lesson.afterLabel : lesson.beforeLabel,
      missing: complete ? [] : ["더 정확한 이름"],
    };
  }

  #evaluateCards(lesson, activity) {
    const selected = activity.selectedCards?.[lesson.id] ?? [];
    const missingRequired = lesson.requiredCards.filter(
      (card) => !selected.includes(card),
    );
    const obsoleteSelected = lesson.obsoleteCards.filter((card) =>
      selected.includes(card),
    );
    const complete =
      missingRequired.length === 0 && obsoleteSelected.length === 0;
    const score = Math.max(
      20,
      100 - missingRequired.length * 24 - obsoleteSelected.length * 28,
    );
    return {
      complete,
      score,
      tone: complete ? "strong" : "soft",
      message: complete
        ? lesson.resultText.complete
        : lesson.resultText.incomplete,
      selected,
      missing: [...missingRequired, ...obsoleteSelected],
    };
  }

  #evaluateOrder(lesson, activity) {
    const order = activity.cardOrder?.[lesson.id] ?? lesson.initialOrder;
    const matches = lesson.targetOrder.filter(
      (card, index) => order[index] === card,
    ).length;
    const complete = matches === lesson.targetOrder.length;
    return {
      complete,
      score: Math.round((matches / lesson.targetOrder.length) * 100),
      tone: complete ? "strong" : "soft",
      message: complete
        ? lesson.resultText.complete
        : lesson.resultText.incomplete,
      order,
      missing: complete ? [] : ["읽는 순서"],
    };
  }

  #evaluateMigration(lesson, activity) {
    const progress = Number(activity.migrationProgress ?? 0);
    const complete = progress >= 85;
    return {
      complete,
      score: progress,
      tone: complete ? "strong" : "soft",
      message: complete
        ? lesson.resultText.complete
        : lesson.resultText.incomplete,
      progress,
      missing: complete ? [] : ["남은 요청 지점"],
    };
  }
}
