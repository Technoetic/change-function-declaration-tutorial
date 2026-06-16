export class BaseComponent {
  constructor({ root, eventBus }) {
    this.root = root;
    this.eventBus = eventBus;
  }

  clear() {
    this.root.replaceChildren();
  }

  setHTML(markup) {
    this.root.innerHTML = markup;
  }

  find(selector) {
    return this.root.querySelector(selector);
  }

  findAll(selector) {
    return [...this.root.querySelectorAll(selector)];
  }
}
