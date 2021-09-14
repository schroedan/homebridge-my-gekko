import { Request } from './request';

export class Response {
  private _json = undefined;

  constructor(readonly request: Request, readonly data: string) {}

  json<T>(): T | undefined {
    if (this._json === undefined) {
      const data = this.data.trim();

      if (data !== 'OK') {
        this._json = JSON.parse(data);
      }
    }

    return this._json;
  }
}
