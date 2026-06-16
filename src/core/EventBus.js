export class EventBus extends EventTarget {
  emit(type, detail = {}) {
    this.dispatchEvent(new CustomEvent(type, { detail }));
  }

  on(type, listener, options = {}) {
    this.addEventListener(type, listener, options);
    return () => this.removeEventListener(type, listener, options);
  }
}
