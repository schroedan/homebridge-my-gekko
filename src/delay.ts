export class Delay<T extends CallableFunction> {
  protected _pending = false;
  protected _timeout?: NodeJS.Timeout;

  get pending(): boolean {
    return this._pending;
  }

  constructor(readonly delay: number) {}

  set(callback: T): this {
    this.clear();

    this._pending = true;

    this._timeout = setTimeout(() => {
      this._pending = false;

      callback();
    }, this.delay);

    this._timeout.unref();

    return this;
  }

  clear(): this {
    this._pending = false;

    if (this._timeout !== undefined) {
      clearTimeout(this._timeout);
    }

    return this;
  }
}
