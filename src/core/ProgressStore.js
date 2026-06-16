export class ProgressStore {
  #key;
  #storage;

  constructor({ key, storage }) {
    this.#key = key;
    this.#storage = storage;
  }

  async load() {
    await Promise.resolve();
    try {
      const raw = this.#storage?.getItem(this.#key);
      return raw ? JSON.parse(raw) : null;
    } catch (_error) {
      return null;
    }
  }

  async save(value) {
    await Promise.resolve();
    try {
      this.#storage?.setItem(this.#key, JSON.stringify(value));
      return true;
    } catch (_error) {
      return false;
    }
  }
}
