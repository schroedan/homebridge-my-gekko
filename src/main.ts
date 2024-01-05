import { API } from 'homebridge';

import { Platform, PLATFORM_NAME, PLUGIN_IDENTIFIER } from './platform';

export default (api: API): void => {
  api.registerPlatform(PLUGIN_IDENTIFIER, PLATFORM_NAME, Platform);
};
