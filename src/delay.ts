export class Delay<T extends CallableFunction> {
  protected _pending = false;
  protected _timeout?: NodeJS.Timeout;
  protected _timestamp = 0;

  get pending(): boolean {
    return this._pending;
  }

  get timestamp(): number {
    return Math.floor(this._timestamp / 1000);
  }

  constructor(readonly delay: number) {}

  set(callback: T): this {
    this.clear();

    this._pending = true;

    this._timeout = setTimeout(() => {
      this._timestamp = Date.now();
      this._pending = false;

      callback();
    }, this.delay);

    this._timeout.unref();

    return this;
  }

  clear(): this {
    this._timestamp = 0;
    this._pending = false;

    if (this._timeout !== undefined) {
      clearTimeout(this._timeout);
    }

    return this;
  }
}
