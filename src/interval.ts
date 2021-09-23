export class Interval<T extends CallableFunction> {
  protected _timeout?: NodeJS.Timeout;
  protected _timestamp = 0;

  get timestamp(): number {
    return Math.floor(this._timestamp / 1000);
  }

  constructor(readonly interval: number) {}

  set(callback: T): this {
    this.clear();

    this._timeout = setInterval(() => {
      this._timestamp = Date.now();

      callback();
    }, this.interval);

    this._timeout.unref();

    return this;
  }

  clear(): this {
    this._timestamp = 0;

    if (this._timeout !== undefined) {
      clearTimeout(this._timeout);
    }

    return this;
  }
}
