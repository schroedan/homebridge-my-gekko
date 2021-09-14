import { URL } from 'url';
import { Connection } from '../connection';
import { Request } from './request';

export class ReadRequest implements Request {
  path = '/';

  constructor(readonly connection: Connection) {}

  withPath(path: string): ReadRequest {
    const request = new ReadRequest(this.connection);
    request.path = path;
    return request;
  }

  url(): URL {
    const url = new URL(this.connection.url().toString());

    url.pathname += this.path;

    return url;
  }
}
