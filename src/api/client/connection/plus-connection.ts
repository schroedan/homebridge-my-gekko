import { URL } from 'url';
import { Connection } from './connection';

export class PlusConnection implements Connection {
  constructor(
    readonly options: {
      username: string;
      key: string;
      gekkoid: string;
    },
  ) {}

  url(): URL {
    const url = new URL('https://live.my-gekko.com/api/v1');

    url.searchParams.set('username', this.options.username);
    url.searchParams.set('key', this.options.key);
    url.searchParams.set('gekkoid', this.options.gekkoid);

    return url;
  }
}
