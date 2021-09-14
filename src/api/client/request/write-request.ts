import { URL } from 'url';
import { Connection } from '../connection';
import { Request } from './request';

type Param = { name: string; value: string };

export class WriteRequest implements Request {
  path = '/';
  params: Param[] = [];

  constructor(readonly connection: Connection) {}

  withPath(path: string): WriteRequest {
    const request = new WriteRequest(this.connection);
    request.path = path;
    request.params = this.params;
    return request;
  }

  withParams(params: Param[]): WriteRequest {
    const request = new WriteRequest(this.connection);
    request.path = this.path;
    request.params = params;
    return request;
  }

  url(): URL {
    const url = new URL(this.connection.url().toString());

    url.pathname += this.path;

    for (const param of this.params) {
      url.searchParams.set(param.name, param.value);
    }

    return url;
  }
}
