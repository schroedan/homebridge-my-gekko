export class Interval<T extends CallableFunction> {
  protected _timeout?: NodeJS.Timeout;

  constructor(readonly interval: number) {}

  set(callback: T): this {
    this.clear();

    this._timeout = setInterval(() => {
      callback();
    }, this.interval);

    this._timeout.unref();

    return this;
  }

  clear(): this {
    if (this._timeout !== undefined) {
      clearTimeout(this._timeout);
    }

    return this;
  }
}
