import { URL } from 'url';
import { Connection } from './connection';

export class LocalConnection implements Connection {
  constructor(
    readonly options: {
      host: string;
      username: string;
      password: string;
    },
  ) {}

  url(): URL {
    const url = new URL(`http://${this.options.host}/api/v1`);

    url.username = this.options.username;
    url.password = this.options.password;

    return url;
  }
}
