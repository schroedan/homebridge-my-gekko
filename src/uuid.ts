import { API } from 'homebridge';

import { PLUGIN_IDENTIFIER } from './platform';

export class UUID {
  constructor(readonly api: API) {}

  generate(accessoryIdentifier: string): string {
    return this.api.hap.uuid.generate(
      `${PLUGIN_IDENTIFIER}/${accessoryIdentifier}`,
    );
  }
}
